from datetime import datetime

from pydantic import BaseModel


class RiskEvaluation(BaseModel):
    zone_id: int
    timestamp: datetime
    overall_status: str
    risk_score: float
    summary: str
