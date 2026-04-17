# 데이터 모델

SQLModel 기반 SQLite 저장.

---

## SensorReading

| 필드 | 타입 | 설명 |
|------|------|------|
| id | int (PK) | 자동 증가 |
| zone_id | int (FK) | 구역 참조 |
| timestamp | datetime | 측정 시각 |
| oxygen | float | 산소 (%) |
| h2s, co, voc | float | 가스 (ppm) |
| temperature | float | 온도 (°C) |
| humidity | float | 습도 (%) |

## RiskState

| 필드 | 타입 | 설명 |
|------|------|------|
| id, zone_id, timestamp | — | 기본 |
| overall_status | string | SAFE/CAUTION/WARNING/CRITICAL |
| risk_score | float | 0~100 |
| summary | string | 위험 요약 |

## EventLog

| 필드 | 타입 | 설명 |
|------|------|------|
| id, zone_id, timestamp | — | 기본 |
| severity | string | info/warning/critical |
| event_type | string | 이벤트 유형 |
| message, source | string | 설명, 출처 |

## WorkerState

| 필드 | 타입 | 설명 |
|------|------|------|
| worker_status | string | normal/inactive/fall_suspected |
| confidence | float | 0~1 |
| last_motion_seconds | float | 마지막 움직임 후 경과(초) |

## Zone

| 필드 | 타입 | 설명 |
|------|------|------|
| name | string (unique) | 구역 식별자 |
| type | string | paint_tank/cargo_hold/engine_room |
| status | string | 현재 상태 |
| location_label | string | 표시용 위치 |
