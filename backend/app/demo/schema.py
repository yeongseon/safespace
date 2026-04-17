from enum import Enum

from pydantic import BaseModel


class ScenarioType(str, Enum):
    safe = "safe"
    oxygen_drop = "oxygen_drop"
    gas_leak = "gas_leak"
    worker_collapse = "worker_collapse"
    multi_risk = "multi_risk"


class ScenarioRequest(BaseModel):
    scenario: ScenarioType
