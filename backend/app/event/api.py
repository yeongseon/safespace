from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.event.schema import EventResponse
from app.event.service import list_events
from app.zone.service import resolve_zone_id


router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventResponse])
def read_events(
    session: Annotated[Session, Depends(get_session)],
    zone_id: int | None = None,
    zone: str | None = None,
    severity: str | None = None,
    limit: int = 50,
) -> list[EventResponse]:
    limit = max(1, min(limit, 200))
    resolved = resolve_zone_id(session, zone_id=zone_id, zone=zone)
    return list_events(session, zone_id=resolved, severity=severity, limit=limit)
