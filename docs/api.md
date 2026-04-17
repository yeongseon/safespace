# API 명세

---

## REST Endpoints

### GET /api/dashboard/summary

```json
{
  "overall_status": "WARNING",
  "risk_score": 72,
  "summary": "paint-tank-a: oxygen trending low",
  "connection_status": "connected",
  "timestamp": "2026-04-17T20:00:00",
  "zones": [{"zone_id": "paint-tank-a", "overall_status": "WARNING", "risk_score": 72}]
}
```

### GET /api/sensors/latest

```json
{"zone_id": "paint-tank-a", "oxygen": 19.2, "h2s": 11.4, "co": 8.1, "voc": 120.0, "temperature": 31.2, "humidity": 72.5, "timestamp": "2026-04-17T20:00:00"}
```

### GET /api/sensors/history?minutes=10

`SensorData[]` 배열 반환.

### GET /api/events?zone_id=&severity=&limit=50

```json
[{"id": 1, "zone_id": "paint-tank-a", "timestamp": "...", "severity": "CRITICAL", "event_type": "risk_threshold", "message": "oxygen critically low", "source": "risk_engine"}]
```

### GET /api/zones

```json
[{"id": "paint-tank-a", "name": "Paint Tank A", "type": "paint_tank", "status": "SAFE", "location_label": "Dock 1 / Paint Tank A"}]
```

### GET /api/worker/status

```json
{"zone_id": "paint-tank-a", "worker_status": "fall_suspected", "confidence": 0.84, "last_motion_seconds": 18, "timestamp": "..."}
```

### POST /api/demo/scenario

**Request:** `{"scenario": "oxygen_drop"}`

**허용 값:** `safe`, `oxygen_drop`, `gas_leak`, `worker_collapse`, `multi_risk`

---

## WebSocket /ws/live

| 이벤트 | 설명 |
|--------|------|
| `sensor_update` | 센서 데이터 갱신 |
| `status_update` | 위험 상태 변경 |
| `event_created` | 새 이벤트 생성 |
