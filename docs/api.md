# 🌐 API 명세

SafeSpace 백엔드가 제공하는 REST API와 WebSocket 인터페이스이다. 기본 URL은 `http://localhost:8000`이다.

---

## 📡 엔드포인트 요약

| ⚙️ 메서드 | 📡 경로 | 📝 설명 |
|--------|------|------|
| GET | `/api/dashboard/summary` | 전체 대시보드 요약 |
| GET | `/api/sensors/latest` | 최신 센서 데이터 |
| GET | `/api/sensors/history` | 센서 이력 |
| GET | `/api/events` | 이벤트 로그 목록 |
| GET | `/api/zones` | 구역 목록 |
| GET | `/api/worker/status` | 작업자 상태 |
| POST | `/api/demo/scenario` | 데모 시나리오 활성화 |
| WS | `/ws/live` | 실시간 데이터 스트림 |

---

## 🌐 REST API

### 📊 GET /api/dashboard/summary

전체 시스템 상태를 종합한 대시보드 요약이다. 모든 구역의 위험 상태를 집계하여 최고 위험 등급을 반환한다.

**📥 요청**

```bash
curl http://localhost:8000/api/dashboard/summary
```

**📤 응답 스키마**

| 📋 필드 | ⚙️ 타입 | 📝 설명 |
|------|------|------|
| `overall_status` | string | 전체 최고 위험 등급 (`SAFE` \| `CAUTION` \| `WARNING` \| `CRITICAL`) |
| `risk_score` | float | 전체 최고 위험 점수 (0~100) |
| `summary` | string | 위험 구역 요약 텍스트 |
| `connection_status` | string | 센서 루프 상태 (`connected` \| `disconnected`) |
| `timestamp` | string | 최신 데이터 시각 (ISO 8601) |
| `zones` | array | 구역별 상태 목록 |
| `websocket_clients` | int | 현재 WebSocket 연결 수 |

**🧾 응답 예시**

```json
{
  "overall_status": "WARNING",
  "risk_score": 72.15,
  "summary": "paint-tank-a: oxygen trending low, elevated H2S",
  "connection_status": "connected",
  "timestamp": "2026-04-17T12:00:00+00:00",
  "zones": [
    {
      "zone_id": "paint-tank-a",
      "overall_status": "WARNING",
      "risk_score": 72.15,
      "summary": "oxygen trending low, elevated H2S",
      "worker_status": "normal"
    },
    {
      "zone_id": "cargo-hold-b",
      "overall_status": "SAFE",
      "risk_score": 0.0,
      "summary": "awaiting sensor data",
      "worker_status": "normal"
    },
    {
      "zone_id": "engine-room-c",
      "overall_status": "SAFE",
      "risk_score": 0.0,
      "summary": "awaiting sensor data",
      "worker_status": "normal"
    }
  ],
  "websocket_clients": 2
}
```

---

### 📊 GET /api/sensors/latest

지정 구역의 최신 센서 데이터 1건을 반환한다.

**🔎 쿼리 파라미터**

| 🔎 파라미터 | ⚙️ 타입 | 📋 기본값 | 📝 설명 |
|----------|------|--------|------|
| `zone_id` | int | - | 구역 ID (선택) |

**📤 응답 스키마**

| 📋 필드 | ⚙️ 타입 | 📏 단위 | 📝 설명 |
|------|------|------|------|
| `zone_id` | string | - | 구역 식별자 |
| `oxygen` | float | % | 산소 농도 |
| `h2s` | float | ppm | 황화수소 |
| `co` | float | ppm | 일산화탄소 |
| `voc` | float | ppm | 휘발성유기화합물 |
| `temperature` | float | °C | 온도 |
| `humidity` | float | % | 습도 |
| `timestamp` | string | - | ISO 8601 |

**🧾 응답 예시**

```json
{
  "zone_id": "paint-tank-a",
  "oxygen": 19.2,
  "h2s": 11.4,
  "co": 8.1,
  "voc": 120.0,
  "temperature": 31.2,
  "humidity": 72.5,
  "timestamp": "2026-04-17T12:00:00+00:00"
}
```

---

### 📈 GET /api/sensors/history

지정 기간의 센서 이력을 반환한다.

**🔎 쿼리 파라미터**

| 🔎 파라미터 | ⚙️ 타입 | 📋 기본값 | 📝 설명 |
|----------|------|--------|------|
| `minutes` | int | 10 | 최근 N분간의 이력 |
| `zone_id` | int | - | 구역 ID (선택) |

**📤 응답**: `SensorData[]` 배열 (시간순 정렬)

```bash
curl "http://localhost:8000/api/sensors/history?minutes=5"
```

---

### 📝 GET /api/events

이벤트 로그 목록을 반환한다. 최신순 정렬.

**🔎 쿼리 파라미터**

| 🔎 파라미터 | ⚙️ 타입 | 📋 기본값 | 📝 설명 |
|----------|------|--------|------|
| `zone_id` | int | - | 구역 ID (선택) |
| `severity` | string | - | 심각도 필터 (`info` \| `warning` \| `critical`) |
| `limit` | int | 50 | 최대 반환 건수 |

**📤 응답 스키마**

| 📋 필드 | ⚙️ 타입 | 📝 설명 |
|------|------|------|
| `id` | int | 이벤트 ID |
| `zone_id` | string | 구역 식별자 |
| `timestamp` | string | ISO 8601 |
| `severity` | string | `info` \| `warning` \| `critical` |
| `event_type` | string | 이벤트 유형 |
| `message` | string | 상세 메시지 |
| `source` | string | 발생 출처 (`risk_engine` \| `demo_simulator`) |

**🧾 응답 예시**

```json
[
  {
    "id": 42,
    "zone_id": "paint-tank-a",
    "timestamp": "2026-04-17T12:00:02+00:00",
    "severity": "critical",
    "event_type": "risk_threshold_exceeded",
    "message": "oxygen critically low, elevated H2S",
    "source": "risk_engine"
  }
]
```

---

### 🗺️ GET /api/zones

등록된 구역 목록을 반환한다.

**🧾 응답 예시**

```json
[
  {
    "id": "paint-tank-a",
    "name": "Paint Tank A",
    "type": "paint_tank",
    "status": "SAFE",
    "location_label": "Dock 1 / Paint Tank A"
  },
  {
    "id": "cargo-hold-b",
    "name": "Cargo Hold B",
    "type": "cargo_hold",
    "status": "SAFE",
    "location_label": "Dock 2 / Cargo Hold B"
  },
  {
    "id": "engine-room-c",
    "name": "Engine Room C",
    "type": "engine_room",
    "status": "SAFE",
    "location_label": "Vessel 7 / Engine Room C"
  }
]
```

---

### 🎥 GET /api/worker/status

현재 작업자 상태를 반환한다.

**📤 응답 스키마**

| 📋 필드 | ⚙️ 타입 | 📝 설명 |
|------|------|------|
| `zone_id` | string | 구역 식별자 |
| `worker_status` | string | `normal` \| `inactive` \| `fall_suspected` \| `no_motion` |
| `confidence` | float | 감지 신뢰도 (0~1) |
| `last_motion_seconds` | float | 마지막 움직임 후 경과 시간 (초) |
| `timestamp` | string | ISO 8601 |

**🧾 응답 예시**

```json
{
  "zone_id": "paint-tank-a",
  "worker_status": "fall_suspected",
  "confidence": 0.96,
  "last_motion_seconds": 18.4,
  "timestamp": "2026-04-17T12:00:00+00:00"
}
```

---

### 🎮 POST /api/demo/scenario

데모 시나리오를 활성화한다. 활성화된 시나리오는 `paint-tank-a` 구역에만 적용된다.

**📥 요청 본문**

```json
{
  "scenario": "oxygen_drop"
}
```

**✅ 허용 값**

| 🎮 시나리오 | 📝 설명 |
|----------|------|
| `safe` | 정상 상태 복귀 |
| `oxygen_drop` | 30초간 산소 감소 (20.8% → 16.5%) |
| `gas_leak` | 18초간 가스 누출 (H₂S, VOC, CO 급상승) |
| `worker_collapse` | 작업자 쓰러짐 (fall_suspected, confidence 0.96) |
| `multi_risk` | 산소 감소 + 가스 누출 + 작업자 쓰러짐 동시 발생 |

**🧾 요청 예시**

```bash
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario": "gas_leak"}'
```

**📤 응답**

```json
{
  "status": "ok",
  "scenario": "gas_leak"
}
```

---

## 📡 WebSocket

### 🔗 연결

```
ws://localhost:8000/ws/live
```

연결 후 서버가 2초 간격으로 메시지를 브로드캐스트한다. 클라이언트는 별도 구독 요청 없이 자동으로 모든 메시지를 수신한다.

### 📨 메시지 형식

모든 메시지는 동일한 JSON 구조를 따른다.

```json
{
  "type": "<message_type>",
  "data": { ... }
}
```

### 📋 메시지 유형

=== "sensor_update"

    센서 데이터 갱신. 2초 간격으로 구역별 발생.

    ```json
    {
      "type": "sensor_update",
      "data": {
        "zone_id": "paint-tank-a",
        "timestamp": "2026-04-17T12:00:00+00:00",
        "oxygen": 19.2,
        "h2s": 11.4,
        "co": 8.1,
        "voc": 120.0,
        "temperature": 31.2,
        "humidity": 72.5,
        "scenario": "oxygen_drop"
      }
    }
    ```

=== "status_update"

    위험 상태 변경. 매 센서 갱신 후 발생.

    ```json
    {
      "type": "status_update",
      "data": {
        "zone_id": "paint-tank-a",
        "timestamp": "2026-04-17T12:00:00+00:00",
        "overall_status": "WARNING",
        "risk_score": 72.15,
        "summary": "oxygen trending low, elevated H2S"
      }
    }
    ```

=== "event_created"

    새 이벤트 생성. WARNING/CRITICAL 전환 시 또는 시나리오 활성화 시 발생.

    ```json
    {
      "type": "event_created",
      "data": {
        "id": 42,
        "zone_id": "paint-tank-a",
        "timestamp": "2026-04-17T12:00:02+00:00",
        "severity": "critical",
        "event_type": "risk_threshold_exceeded",
        "message": "oxygen critically low",
        "source": "risk_engine"
      }
    }
    ```

### 💻 JavaScript 클라이언트 예시

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/live')

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data)

  switch (type) {
    case 'sensor_update':
      console.log(`[${data.zone_id}] O₂: ${data.oxygen}%`)
      break
    case 'status_update':
      console.log(`[${data.zone_id}] ${data.overall_status} (${data.risk_score})`)
      break
    case 'event_created':
      console.log(`[EVENT] ${data.severity}: ${data.message}`)
      break
  }
}
```

---

## ⚠️ 에러 응답

FastAPI 기본 에러 형식을 따른다.

### 🚨 422 Validation Error

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "scenario"],
      "msg": "Input should be 'safe', 'oxygen_drop', 'gas_leak', 'worker_collapse' or 'multi_risk'",
      "input": "invalid_scenario"
    }
  ]
}
```

### 🔍 404 Not Found

```json
{
  "detail": "Not Found"
}
```
