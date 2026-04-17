from __future__ import annotations

import asyncio
import random
from dataclasses import dataclass
from datetime import datetime, timezone

from app.demo.schema import ScenarioType


@dataclass(slots=True)
class SimulatedState:
    oxygen: float
    h2s: float
    co: float
    voc: float
    temperature: float
    humidity: float
    worker_status: str
    confidence: float
    last_motion_seconds: float
    scenario: str


class DemoSimulator:
    def __init__(self) -> None:
        self._scenario: ScenarioType = ScenarioType.safe
        self._scenario_started_at: datetime = datetime.now(timezone.utc)
        self._lock: asyncio.Lock = asyncio.Lock()

    async def activate(self, scenario: ScenarioType) -> ScenarioType:
        async with self._lock:
            self._scenario = scenario
            self._scenario_started_at = datetime.now(timezone.utc)
            return self._scenario

    async def get_active_scenario(self) -> ScenarioType:
        async with self._lock:
            return self._scenario

    async def generate_state(self, zone_name: str) -> SimulatedState:
        async with self._lock:
            scenario = self._scenario if zone_name == "paint-tank-a" else ScenarioType.safe
            elapsed = (datetime.now(timezone.utc) - self._scenario_started_at).total_seconds()
            return self._generate(zone_name, scenario, elapsed)

    def _generate(self, zone_name: str, scenario: ScenarioType, elapsed: float) -> SimulatedState:
        safe = self._safe_baseline(zone_name)
        if scenario == ScenarioType.safe:
            return safe
        if scenario == ScenarioType.oxygen_drop:
            progress = min(elapsed / 30.0, 1.0)
            safe.oxygen = round(20.8 - (4.3 * progress) + random.uniform(-0.08, 0.03), 2)
            safe.scenario = scenario.value
            return safe
        if scenario == ScenarioType.gas_leak:
            progress = min(elapsed / 18.0, 1.0)
            safe.h2s = round(2 + (23 * progress) + random.uniform(-0.4, 0.6), 2)
            safe.voc = round(80 + (270 * progress) + random.uniform(-8, 10), 2)
            safe.co = round(7 + (25 * progress) + random.uniform(-1.5, 2), 2)
            safe.scenario = scenario.value
            return safe
        if scenario == ScenarioType.worker_collapse:
            safe.worker_status = "fall_suspected"
            safe.confidence = 0.96
            safe.last_motion_seconds = max(12.0, elapsed * 1.4)
            safe.scenario = scenario.value
            return safe
        progress = min(elapsed / 30.0, 1.0)
        safe.oxygen = round(20.8 - (4.3 * progress) + random.uniform(-0.08, 0.03), 2)
        safe.h2s = round(2 + (23 * min(elapsed / 20.0, 1.0)) + random.uniform(-0.5, 0.8), 2)
        safe.voc = round(80 + (270 * min(elapsed / 20.0, 1.0)) + random.uniform(-10, 12), 2)
        safe.co = round(6 + (30 * min(elapsed / 20.0, 1.0)) + random.uniform(-2, 2), 2)
        safe.worker_status = "fall_suspected"
        safe.confidence = 0.98
        safe.last_motion_seconds = max(15.0, elapsed * 1.6)
        safe.scenario = ScenarioType.multi_risk.value
        return safe

    def _safe_baseline(self, zone_name: str) -> SimulatedState:
        zone_temp_offset = {"paint-tank-a": 1.8, "cargo-hold-b": -1.4, "engine-room-c": 5.5}.get(
            zone_name, 0.0
        )
        zone_humidity_offset = {
            "paint-tank-a": 4.0,
            "cargo-hold-b": 7.0,
            "engine-room-c": -6.0,
        }.get(zone_name, 0.0)
        return SimulatedState(
            oxygen=round(20.8 + random.uniform(-0.12, 0.06), 2),
            h2s=round(1 + random.uniform(-0.2, 0.3), 2),
            co=round(5 + random.uniform(-1.2, 1.4), 2),
            voc=round(80 + random.uniform(-8, 10), 2),
            temperature=round(24 + zone_temp_offset + random.uniform(-0.8, 1.0), 2),
            humidity=round(58 + zone_humidity_offset + random.uniform(-3.0, 3.0), 2),
            worker_status="normal",
            confidence=0.98,
            last_motion_seconds=round(random.uniform(0.5, 3.5), 2),
            scenario="safe",
        )


demo_simulator = DemoSimulator()
