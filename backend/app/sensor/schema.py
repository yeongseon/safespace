from datetime import datetime

from pydantic import BaseModel


class SensorLatest(BaseModel):
    zone_id: str
    timestamp: datetime
    oxygen: float
    h2s: float
    co: float
    voc: float
    temperature: float
    humidity: float


class SensorHistory(BaseModel):
    zone_id: str
    readings: list[SensorLatest]
