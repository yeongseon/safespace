from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.sensor.schema import SensorHistory, SensorLatest
from app.sensor.service import get_history, get_latest


router = APIRouter(prefix="/api/sensors", tags=["sensors"])


@router.get("/latest", response_model=SensorLatest | None)
def read_latest_sensor(
    session: Annotated[Session, Depends(get_session)],
    zone_id: int | None = None,
) -> SensorLatest | None:
    return get_latest(session, zone_id=zone_id)


@router.get("/history", response_model=SensorHistory)
def read_sensor_history(
    session: Annotated[Session, Depends(get_session)],
    minutes: int = 10,
    zone_id: int | None = None,
) -> SensorHistory:
    minutes = max(1, min(minutes, 720))
    return get_history(session, minutes=minutes, zone_id=zone_id)
