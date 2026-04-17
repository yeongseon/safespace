from __future__ import annotations

from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SensorReading(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    zone_id: int = Field(index=True, foreign_key="zone.id")
    timestamp: datetime = Field(default_factory=utcnow, index=True)
    oxygen: float
    h2s: float
    co: float
    voc: float
    temperature: float
    humidity: float


class RiskState(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    zone_id: int = Field(index=True, foreign_key="zone.id")
    timestamp: datetime = Field(default_factory=utcnow, index=True)
    overall_status: str = Field(index=True)
    risk_score: float
    summary: str


class EventLog(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    zone_id: int = Field(index=True, foreign_key="zone.id")
    timestamp: datetime = Field(default_factory=utcnow, index=True)
    severity: str = Field(index=True)
    event_type: str = Field(index=True)
    message: str
    source: str


class WorkerState(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    zone_id: int = Field(index=True, foreign_key="zone.id")
    timestamp: datetime = Field(default_factory=utcnow, index=True)
    worker_status: str = Field(index=True)
    confidence: float
    last_motion_seconds: float


class Zone(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    type: str
    status: str = Field(default="SAFE", index=True)
    location_label: str
