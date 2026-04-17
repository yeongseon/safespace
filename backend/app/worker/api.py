from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.worker.schema import WorkerStatusResponse
from app.worker.service import get_worker_status


router = APIRouter(prefix="/api/worker", tags=["worker"])


@router.get("/status", response_model=WorkerStatusResponse | None)
def read_worker_status(
    session: Annotated[Session, Depends(get_session)],
    zone_id: int | None = None,
) -> WorkerStatusResponse | None:
    return get_worker_status(session, zone_id=zone_id)
