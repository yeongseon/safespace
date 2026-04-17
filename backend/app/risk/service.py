from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select

from app.risk.rules import evaluate_sensor_risk, map_status
from app.storage.models import RiskState, SensorReading, WorkerState


def get_recent_sensor_history(session: Session, zone_id: int) -> list[SensorReading]:
    since = datetime.now(timezone.utc) - timedelta(minutes=5)
    statement = (
        select(SensorReading)
        .where(SensorReading.zone_id == zone_id)
        .where(SensorReading.timestamp >= since)
    )
    readings = list(session.exec(statement).all())
    return sorted(readings, key=lambda item: (item.timestamp, item.id or 0))


def get_latest_risk_state(session: Session, zone_id: int) -> RiskState | None:
    statement = select(RiskState).where(RiskState.zone_id == zone_id)
    risks = list(session.exec(statement).all())
    if not risks:
        return None
    return max(risks, key=lambda item: (item.timestamp, item.id or 0))


def evaluate_risk(
    session: Session, sensor_data: SensorReading, worker_state: WorkerState | None
) -> RiskState:
    history = get_recent_sensor_history(session, sensor_data.zone_id)
    score, summary = evaluate_sensor_risk(sensor_data, history, worker_state)
    risk_state = RiskState(
        zone_id=sensor_data.zone_id,
        timestamp=sensor_data.timestamp,
        overall_status=map_status(score),
        risk_score=score,
        summary=summary,
    )
    session.add(risk_state)
    session.commit()
    session.refresh(risk_state)
    return risk_state
