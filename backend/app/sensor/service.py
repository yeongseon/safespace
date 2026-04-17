from sqlmodel import Session, select

from app.sensor import repository
from app.sensor.schema import SensorHistory, SensorLatest
from app.storage.models import Zone


def get_latest(session: Session, zone_id: int | None = None) -> SensorLatest | None:
    reading = repository.get_latest_reading(session, zone_id=zone_id)
    if reading is None:
        return None
    zone = session.get(Zone, reading.zone_id)
    zone_name = zone.name if zone is not None else str(reading.zone_id)
    return SensorLatest(
        zone_id=zone_name,
        timestamp=reading.timestamp,
        oxygen=reading.oxygen,
        h2s=reading.h2s,
        co=reading.co,
        voc=reading.voc,
        temperature=reading.temperature,
        humidity=reading.humidity,
    )


def get_history(session: Session, minutes: int = 10, zone_id: int | None = None) -> SensorHistory:
    readings = repository.get_history_readings(session, minutes=minutes, zone_id=zone_id)
    zone_map = {
        zone.id: zone.name for zone in session.exec(select(Zone)).all() if zone.id is not None
    }
    items = [
        SensorLatest(
            zone_id=zone_map.get(reading.zone_id, str(reading.zone_id)),
            timestamp=reading.timestamp,
            oxygen=reading.oxygen,
            h2s=reading.h2s,
            co=reading.co,
            voc=reading.voc,
            temperature=reading.temperature,
            humidity=reading.humidity,
        )
        for reading in readings
    ]
    if zone_id is not None:
        resolved_zone_id = zone_map[zone_id] if zone_id in zone_map else str(zone_id)
    else:
        resolved_zone_id = items[-1].zone_id if items else "unknown"
    return SensorHistory(zone_id=resolved_zone_id, readings=items)
