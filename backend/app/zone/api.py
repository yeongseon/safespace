from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.zone.schema import ZoneResponse
from app.zone.service import list_zones


router = APIRouter(prefix="/api/zones", tags=["zones"])


@router.get("", response_model=list[ZoneResponse])
def read_zones(session: Annotated[Session, Depends(get_session)]) -> list[ZoneResponse]:
    return list_zones(session)
