from fastapi import APIRouter, HTTPException

from app.demo.schema import ScenarioRequest
from app.main_state import runtime_state


router = APIRouter(prefix="/api/demo", tags=["demo"])


@router.post("/scenario")
async def activate_demo_scenario(payload: ScenarioRequest) -> dict[str, str]:
    if runtime_state.demo_simulator is None:
        raise HTTPException(status_code=503, detail="Demo simulator not ready")
    _ = await runtime_state.demo_simulator.activate(payload.scenario)
    return {"status": "ok", "scenario": payload.scenario.value}
