from __future__ import annotations

import asyncio
from dataclasses import dataclass

from app.core.websocket import ConnectionManager
from app.demo.service import DemoSimulator


@dataclass
class RuntimeState:
    websocket_manager: ConnectionManager
    demo_simulator: DemoSimulator | None = None
    sensor_task: asyncio.Task[None] | None = None


runtime_state = RuntimeState(websocket_manager=ConnectionManager())
