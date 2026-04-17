from sqlmodel import Session, select

from app.risk.service import get_latest_risk_state
from app.storage.models import Zone
from app.zone.schema import ZoneResponse


def list_zones(session: Session) -> list[ZoneResponse]:
    zones = list(session.exec(select(Zone)).all())
    zones.sort(key=lambda zone: zone.name)
    return [ZoneResponse.model_validate(zone.model_dump()) for zone in zones]


def get_zone_status(session: Session, zone_id: int) -> str:
    risk = get_latest_risk_state(session, zone_id)
    if risk is not None:
        return risk.overall_status
    zone = session.get(Zone, zone_id)
    return zone.status if zone is not None else "UNKNOWN"
