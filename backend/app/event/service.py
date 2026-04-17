from sqlmodel import Session, select

from app.event import repository
from app.event.schema import EventCreate, EventResponse
from app.storage.models import EventLog, Zone


def create_event(session: Session, payload: EventCreate) -> EventLog:
    event = EventLog(
        zone_id=payload.zone_id,
        severity=payload.severity,
        event_type=payload.event_type,
        message=payload.message,
        source=payload.source,
    )
    return repository.create_event(session, event)


def list_events(
    session: Session,
    zone_id: int | None = None,
    severity: str | None = None,
    limit: int = 50,
) -> list[EventResponse]:
    events = repository.list_events(session, zone_id=zone_id, severity=severity, limit=limit)
    zone_map = {
        zone.id: zone.name for zone in session.exec(select(Zone)).all() if zone.id is not None
    }
    return [
        EventResponse(
            id=event.id or 0,
            zone_id=zone_map.get(event.zone_id, str(event.zone_id)),
            timestamp=event.timestamp,
            severity=event.severity,
            event_type=event.event_type,
            message=event.message,
            source=event.source,
        )
        for event in events
    ]
