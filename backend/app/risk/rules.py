from __future__ import annotations

from collections.abc import Iterable

from app.core.config import settings
from app.storage.models import SensorReading, WorkerState


def clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return max(minimum, min(maximum, value))


def oxygen_risk(oxygen: float) -> tuple[float, str]:
    if oxygen >= settings.oxygen_safe_min:
        return 0.0, "oxygen normal"
    if oxygen >= settings.oxygen_warning_min:
        score = (
            40.0
            + (
                (settings.oxygen_safe_min - oxygen)
                / (settings.oxygen_safe_min - settings.oxygen_warning_min)
            )
            * 30.0
        )
        return clamp(score), "oxygen trending low"
    score = 75.0 + ((settings.oxygen_warning_min - oxygen) / 2.0) * 25.0
    return clamp(score), "oxygen critically low"


def gas_risk(value: float, safe_max: float, warning_max: float) -> float:
    if value <= safe_max:
        return 0.0
    if value <= warning_max:
        return clamp(35.0 + ((value - safe_max) / max(warning_max - safe_max, 1.0)) * 30.0)
    return clamp(70.0 + ((value - warning_max) / max(warning_max, 1.0)) * 35.0)


def toxic_gas_risk(sensor: SensorReading) -> tuple[float, list[str]]:
    risks = {
        "H2S": gas_risk(sensor.h2s, settings.h2s_safe_max, settings.h2s_warning_max),
        "CO": gas_risk(sensor.co, settings.co_safe_max, settings.co_warning_max),
        "VOC": gas_risk(sensor.voc, settings.voc_safe_max, settings.voc_warning_max),
    }
    messages = [name for name, score in risks.items() if score >= 35.0]
    return clamp(max(risks.values()) if risks else 0.0), messages


def environment_risk(sensor: SensorReading) -> tuple[float, str]:
    temp_risk = 0.0
    humidity_risk = 0.0
    if sensor.temperature < 15 or sensor.temperature > 35:
        temp_risk = clamp(abs(sensor.temperature - 25) * 4)
    if sensor.humidity < 25 or sensor.humidity > 80:
        humidity_risk = clamp(abs(sensor.humidity - 55) * 1.6)
    risk = clamp((temp_risk + humidity_risk) / 2.0)
    if risk < 25:
        return risk, "environment stable"
    return risk, "environment requires attention"


def worker_risk(worker_state: WorkerState | None) -> tuple[float, str]:
    if worker_state is None:
        return 15.0, "worker telemetry stale"
    status = worker_state.worker_status
    if status == "normal":
        return 0.0, "worker normal"
    if status == "fall_suspected":
        return 90.0, "worker collapse suspected"
    if status == "no_motion":
        return 70.0, "worker not moving"
    return 35.0, f"worker state {status}"


def rapid_change_risk(
    current: SensorReading, history: Iterable[SensorReading]
) -> tuple[float, list[str]]:
    readings = list(history)
    if not readings:
        return 0.0, []
    avg_oxygen = sum(item.oxygen for item in readings) / len(readings)
    avg_h2s = sum(item.h2s for item in readings) / len(readings)
    avg_co = sum(item.co for item in readings) / len(readings)
    avg_voc = sum(item.voc for item in readings) / len(readings)
    messages: list[str] = []
    score = 0.0
    if avg_oxygen - current.oxygen >= 1.0:
        score = max(score, clamp((avg_oxygen - current.oxygen) * 20.0))
        messages.append("rapid oxygen drop")
    if current.h2s - avg_h2s >= 5.0:
        score = max(score, clamp((current.h2s - avg_h2s) * 4.0))
        messages.append("rapid H2S spike")
    if current.co - avg_co >= 20.0:
        score = max(score, clamp((current.co - avg_co) * 2.0))
        messages.append("rapid CO spike")
    if current.voc - avg_voc >= 80.0:
        score = max(score, clamp((current.voc - avg_voc) * 0.5))
        messages.append("rapid VOC spike")
    return clamp(score), messages


def map_status(score: float) -> str:
    if score <= 24:
        return "SAFE"
    if score <= 49:
        return "CAUTION"
    if score <= 74:
        return "WARNING"
    return "CRITICAL"


def evaluate_sensor_risk(
    current: SensorReading,
    history: Iterable[SensorReading],
    worker_state: WorkerState | None,
) -> tuple[float, str]:
    oxygen_score, oxygen_message = oxygen_risk(current.oxygen)
    gas_score, gas_messages = toxic_gas_risk(current)
    environment_score, environment_message = environment_risk(current)
    worker_score, worker_message = worker_risk(worker_state)
    rapid_score, rapid_messages = rapid_change_risk(current, history)

    combined = (
        oxygen_score * 0.35
        + max(gas_score, rapid_score) * 0.30
        + environment_score * 0.10
        + worker_score * 0.25
    )
    total_score = clamp(combined + rapid_score * 0.15)
    messages = [oxygen_message, environment_message, worker_message]
    messages.extend(f"elevated {name}" for name in gas_messages)
    messages.extend(rapid_messages)
    summary = ", ".join(
        dict.fromkeys(message for message in messages if message and "normal" not in message)
    )
    if not summary:
        summary = "all monitored conditions are within safe operating range"
    return round(total_score, 2), summary
