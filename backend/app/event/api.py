from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.event.schema import EventResponse
from app.event.service import list_events


router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventResponse])
def read_events(
    session: Annotated[Session, Depends(get_session)],
    zone_id: int | None = None,
    severity: str | None = None,
    limit: int = 50,
) -> list[EventResponse]:
    limit = max(1, min(limit, 200))
    return list_events(session, zone_id=zone_id, severity=severity, limit=limit)
