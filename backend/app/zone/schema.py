from pydantic import BaseModel


class ZoneResponse(BaseModel):
    id: int
    name: str
    type: str
    status: str
    location_label: str
