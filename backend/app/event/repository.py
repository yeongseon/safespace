from sqlmodel import Session, select

from app.storage.models import EventLog


def create_event(session: Session, event: EventLog) -> EventLog:
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


def list_events(
    session: Session,
    zone_id: int | None = None,
    severity: str | None = None,
    limit: int = 50,
) -> list[EventLog]:
    statement = select(EventLog)
    if zone_id is not None:
        statement = statement.where(EventLog.zone_id == zone_id)
    if severity:
        statement = statement.where(EventLog.severity == severity)
    events = list(session.exec(statement).all())
    events.sort(key=lambda item: (item.timestamp, item.id or 0), reverse=True)
    return events[:limit]
