from datetime import datetime, timezone

from sqlmodel import Session, select

from app.storage.models import WorkerState, Zone
from app.worker.schema import WorkerStatusResponse


def get_worker_status(session: Session, zone_id: int | None = None) -> WorkerStatusResponse | None:
    statement = select(WorkerState)
    if zone_id is not None:
        statement = statement.where(WorkerState.zone_id == zone_id)
    workers = list(session.exec(statement).all())
    if not workers:
        return None
    worker = max(workers, key=lambda item: (item.timestamp, item.id or 0))
    zone = session.get(Zone, worker.zone_id)
    zone_name = zone.name if zone is not None else str(worker.zone_id)
    return WorkerStatusResponse(
        zone_id=zone_name,
        timestamp=worker.timestamp,
        worker_status=worker.worker_status,
        confidence=worker.confidence,
        last_motion_seconds=worker.last_motion_seconds,
    )


def update_worker_status(
    session: Session,
    zone_id: int,
    worker_status: str,
    confidence: float,
    last_motion_seconds: float,
) -> WorkerState:
    worker = WorkerState(
        zone_id=zone_id,
        timestamp=datetime.now(timezone.utc),
        worker_status=worker_status,
        confidence=confidence,
        last_motion_seconds=last_motion_seconds,
    )
    session.add(worker)
    session.commit()
    session.refresh(worker)
    return worker
