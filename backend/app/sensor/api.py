from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.sensor.schema import SensorHistory, SensorLatest
from app.sensor.service import get_history, get_latest
from app.zone.service import resolve_zone_id


router = APIRouter(prefix="/api/sensors", tags=["sensors"])


@router.get("/latest", response_model=SensorLatest | None)
def read_latest_sensor(
    session: Annotated[Session, Depends(get_session)],
    zone_id: int | None = None,
    zone: str | None = None,
) -> SensorLatest | None:
    resolved = resolve_zone_id(session, zone_id=zone_id, zone=zone)
    return get_latest(session, zone_id=resolved)


@router.get("/history", response_model=SensorHistory)
def read_sensor_history(
    session: Annotated[Session, Depends(get_session)],
    minutes: int = 10,
    zone_id: int | None = None,
    zone: str | None = None,
) -> SensorHistory:
    minutes = max(1, min(minutes, 720))
    resolved = resolve_zone_id(session, zone_id=zone_id, zone=zone)
    return get_history(session, minutes=minutes, zone_id=resolved)
