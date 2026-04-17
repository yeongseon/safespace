from datetime import datetime

from pydantic import BaseModel


class WorkerStatusResponse(BaseModel):
    zone_id: str
    timestamp: datetime
    worker_status: str
    confidence: float
    last_motion_seconds: float
