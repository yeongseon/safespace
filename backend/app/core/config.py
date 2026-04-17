from dataclasses import dataclass


@dataclass(slots=True)
class Settings:
    db_path: str = "./safespace.db"
    websocket_path: str = "/ws/live"
    websocket_ping_interval_seconds: int = 20
    sensor_interval_seconds: int = 2
    oxygen_safe_min: float = 19.5
    oxygen_warning_min: float = 18.0
    h2s_safe_max: float = 5.0
    h2s_warning_max: float = 10.0
    co_safe_max: float = 25.0
    co_warning_max: float = 50.0
    voc_safe_max: float = 100.0
    voc_warning_max: float = 200.0


settings = Settings()
