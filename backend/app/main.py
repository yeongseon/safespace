from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.core.config import settings
from app.core.db import create_db_and_tables, engine, get_session
from app.demo.api import router as demo_router
from app.demo.schema import ScenarioType
from app.demo.service import demo_simulator
from app.event.api import router as event_router
from app.event.schema import EventCreate
from app.event.service import create_event, list_events
from app.main_state import runtime_state
from app.risk.service import evaluate_risk, get_latest_risk_state
from app.sensor.api import router as sensor_router
from app.sensor.repository import create_sensor_reading
from app.storage.models import RiskState, SensorReading, Zone
from app.worker.api import router as worker_router
from app.worker.service import get_worker_status, update_worker_status
from app.zone.api import router as zone_router


@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    del app_instance
    create_db_and_tables()
    seed_default_zones()
    runtime_state.demo_simulator = demo_simulator
    current_task = runtime_state.sensor_task
    if current_task is None or current_task.done():
        runtime_state.sensor_task = asyncio.create_task(sensor_loop())
    _ = await demo_simulator.activate(ScenarioType.safe)
    try:
        yield
    finally:
        current_task = runtime_state.sensor_task
        if current_task is not None:
            _ = current_task.cancel()
            try:
                await current_task
            except asyncio.CancelledError:
                pass


app = FastAPI(title="SafeSpace Backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensor_router)
app.include_router(event_router)
app.include_router(zone_router)
app.include_router(worker_router)
app.include_router(demo_router)


def seed_default_zones() -> None:
    defaults = [
        {
            "name": "paint-tank-a",
            "type": "paint_tank",
            "status": "SAFE",
            "location_label": "Dock 1 / Paint Tank A",
        },
        {
            "name": "cargo-hold-b",
            "type": "cargo_hold",
            "status": "SAFE",
            "location_label": "Dock 2 / Cargo Hold B",
        },
        {
            "name": "engine-room-c",
            "type": "engine_room",
            "status": "SAFE",
            "location_label": "Vessel 7 / Engine Room C",
        },
    ]
    with Session(engine) as session:
        existing = {zone.name for zone in session.exec(select(Zone)).all()}
        created = False
        for item in defaults:
            if item["name"] not in existing:
                session.add(
                    Zone(
                        name=item["name"],
                        type=item["type"],
                        status=item["status"],
                        location_label=item["location_label"],
                    )
                )
                created = True
        if created:
            session.commit()


def maybe_create_threshold_event(
    session: Session, risk_state: RiskState, zone_name: str
) -> list[dict[str, object]]:
    events: list[dict[str, object]] = []
    previous: RiskState | None = None
    risk_items = list(
        session.exec(select(RiskState).where(RiskState.zone_id == risk_state.zone_id)).all()
    )
    risk_items.sort(key=lambda item: (item.timestamp, item.id or 0), reverse=True)
    if len(risk_items) > 1:
        previous = risk_items[1]
    if risk_state.overall_status in {"WARNING", "CRITICAL"} and (
        previous is None or previous.overall_status != risk_state.overall_status
    ):
        severity = "critical" if risk_state.overall_status == "CRITICAL" else "warning"
        event = create_event(
            session,
            EventCreate(
                zone_id=risk_state.zone_id,
                severity=severity,
                event_type="risk_threshold_exceeded",
                message=risk_state.summary,
                source="risk_engine",
            ),
        )
        events.append(
            {
                "id": event.id,
                "zone_id": zone_name,
                "timestamp": event.timestamp.isoformat(),
                "severity": event.severity,
                "event_type": event.event_type,
                "message": event.message,
                "source": event.source,
            }
        )
    return events


async def process_zone(zone: Zone) -> None:
    if zone.id is None:
        return
    with Session(engine) as session:
        db_zone = session.get(Zone, zone.id)
        if db_zone is None or db_zone.id is None:
            return
        sim_state = await demo_simulator.generate_state(zone.name)
        worker = update_worker_status(
            session=session,
            zone_id=db_zone.id,
            worker_status=sim_state.worker_status,
            confidence=sim_state.confidence,
            last_motion_seconds=sim_state.last_motion_seconds,
        )
        reading = create_sensor_reading(
            session,
            SensorReading(
                zone_id=db_zone.id,
                oxygen=sim_state.oxygen,
                h2s=sim_state.h2s,
                co=sim_state.co,
                voc=sim_state.voc,
                temperature=sim_state.temperature,
                humidity=sim_state.humidity,
            ),
        )
        sensor_payload: dict[str, object] = {
            "zone_id": db_zone.name,
            "timestamp": reading.timestamp.isoformat(),
            "oxygen": reading.oxygen,
            "h2s": reading.h2s,
            "co": reading.co,
            "voc": reading.voc,
            "temperature": reading.temperature,
            "humidity": reading.humidity,
        }
        risk_state = evaluate_risk(session, reading, worker)
        db_zone.status = risk_state.overall_status
        session.add(db_zone)
        session.commit()

        if sim_state.scenario != "safe":
            recent = list_events(session, zone_id=db_zone.id, severity=None, limit=5)
            activation_key = f"scenario_{sim_state.scenario}"
            if not any(event.event_type == activation_key for event in recent):
                event = create_event(
                    session,
                    EventCreate(
                        zone_id=db_zone.id,
                        severity="info",
                        event_type=activation_key,
                        message=f"Demo scenario {sim_state.scenario} active in {db_zone.name}",
                        source="demo_simulator",
                    ),
                )
                await runtime_state.websocket_manager.broadcast(
                    "event_created",
                    {
                        "id": event.id,
                        "zone_id": db_zone.name,
                        "timestamp": event.timestamp.isoformat(),
                        "severity": event.severity,
                        "event_type": event.event_type,
                        "message": event.message,
                        "source": event.source,
                    },
                )

        threshold_events = maybe_create_threshold_event(session, risk_state, db_zone.name)
        sensor_payload["scenario"] = sim_state.scenario
        await runtime_state.websocket_manager.broadcast("sensor_update", sensor_payload)
        await runtime_state.websocket_manager.broadcast(
            "status_update",
            {
                "zone_id": db_zone.name,
                "timestamp": risk_state.timestamp.isoformat(),
                "overall_status": risk_state.overall_status,
                "risk_score": risk_state.risk_score,
                "summary": risk_state.summary,
            },
        )
        for event_payload in threshold_events:
            await runtime_state.websocket_manager.broadcast("event_created", event_payload)


async def sensor_loop() -> None:
    while True:
        try:
            with Session(engine) as session:
                zones = list(session.exec(select(Zone)).all())
                zones.sort(key=lambda zone: zone.name)
            for zone in zones:
                await process_zone(zone)
        except Exception as exc:
            print(f"Sensor loop error: {exc}")
        await asyncio.sleep(settings.sensor_interval_seconds)


@app.websocket(settings.websocket_path)
async def websocket_live(websocket: WebSocket) -> None:
    await runtime_state.websocket_manager.connect(websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        runtime_state.websocket_manager.disconnect(websocket)
    except Exception:
        runtime_state.websocket_manager.disconnect(websocket)


@app.get("/api/dashboard/summary")
def get_dashboard_summary(
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, object]:
    zones = list(session.exec(select(Zone)).all())
    zones.sort(key=lambda zone: zone.name)
    zone_summaries: list[dict[str, object]] = []
    max_score = 0.0
    overall_status = "SAFE"
    summary_texts: list[str] = []
    latest_timestamp = datetime.min
    status_priority = {"SAFE": 0, "CAUTION": 1, "WARNING": 2, "CRITICAL": 3}
    for zone in zones:
        if zone.id is None:
            continue
        risk = get_latest_risk_state(session, zone.id)
        worker = get_worker_status(session, zone.id)
        zone_status = risk.overall_status if risk else zone.status
        zone_score = risk.risk_score if risk else 0.0
        zone_summary = risk.summary if risk else "awaiting sensor data"
        zone_time = risk.timestamp if risk else datetime.min
        latest_timestamp = max(latest_timestamp, zone_time)
        if status_priority[zone_status] > status_priority[overall_status]:
            overall_status = zone_status
        max_score = max(max_score, zone_score)
        if zone_status != "SAFE":
            summary_texts.append(f"{zone.name}: {zone_summary}")
        zone_summaries.append(
            {
                "zone_id": zone.name,
                "overall_status": zone_status,
                "risk_score": zone_score,
                "summary": zone_summary,
                "worker_status": worker.worker_status if worker else "unknown",
            }
        )
    summary = (
        "; ".join(summary_texts)
        if summary_texts
        else "All monitored zones operating within safe limits"
    )
    return {
        "overall_status": overall_status,
        "risk_score": round(max_score, 2),
        "summary": summary,
        "connection_status": "connected"
        if runtime_state.sensor_task is not None and not runtime_state.sensor_task.done()
        else "disconnected",
        "timestamp": (
            datetime.now(timezone.utc).isoformat()
            if latest_timestamp == datetime.min
            else latest_timestamp.isoformat()
        ),
        "zones": zone_summaries,
        "websocket_clients": len(runtime_state.websocket_manager.active_connections),
    }
