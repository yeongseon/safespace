from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select

from app.storage.models import SensorReading


def create_sensor_reading(session: Session, reading: SensorReading) -> SensorReading:
    session.add(reading)
    session.commit()
    session.refresh(reading)
    return reading


def get_latest_reading(session: Session, zone_id: int | None = None) -> SensorReading | None:
    statement = select(SensorReading)
    if zone_id is not None:
        statement = statement.where(SensorReading.zone_id == zone_id)
    readings = list(session.exec(statement).all())
    if not readings:
        return None
    return max(readings, key=lambda item: (item.timestamp, item.id or 0))


def get_history_readings(
    session: Session,
    minutes: int = 10,
    zone_id: int | None = None,
) -> list[SensorReading]:
    since = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    statement = select(SensorReading).where(SensorReading.timestamp >= since)
    if zone_id is not None:
        statement = statement.where(SensorReading.zone_id == zone_id)
    readings = list(session.exec(statement).all())
    return sorted(readings, key=lambda item: (item.timestamp, item.id or 0))
