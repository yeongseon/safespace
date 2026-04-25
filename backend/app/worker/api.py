from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.worker.schema import WorkerStatusResponse
from app.worker.service import get_worker_status
from app.zone.service import resolve_zone_id


router = APIRouter(prefix="/api/worker", tags=["worker"])


@router.get("/status", response_model=WorkerStatusResponse | None)
def read_worker_status(
    session: Annotated[Session, Depends(get_session)],
    zone_id: int | None = None,
    zone: str | None = None,
) -> WorkerStatusResponse | None:
    resolved = resolve_zone_id(session, zone_id=zone_id, zone=zone)
    return get_worker_status(session, zone_id=resolved)
