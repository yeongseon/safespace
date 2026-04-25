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


def get_zone_by_name(session: Session, name: str) -> Zone | None:
    """Look up a zone by its slug name (e.g. 'paint-tank-a')."""
    zones = list(session.exec(select(Zone).where(Zone.name == name)).all())
    return zones[0] if zones else None


def resolve_zone_id(
    session: Session,
    zone_id: int | None = None,
    zone: str | None = None,
) -> int | None:
    """Resolve a zone identifier to a numeric DB id.

    Accepts either a numeric ``zone_id`` or a string slug ``zone``.
    Returns the numeric id or ``None`` if nothing matched.
    """
    if zone_id is not None:
        return zone_id
    if zone is not None:
        z = get_zone_by_name(session, zone)
        return z.id if z is not None else None
    return None
