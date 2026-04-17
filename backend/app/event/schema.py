from datetime import datetime

from pydantic import BaseModel


class EventCreate(BaseModel):
    zone_id: int
    severity: str
    event_type: str
    message: str
    source: str = "system"


class EventResponse(BaseModel):
    id: int
    zone_id: str
    timestamp: datetime
    severity: str
    event_type: str
    message: str
    source: str
