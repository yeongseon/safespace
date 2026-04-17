# 백엔드 구조

백엔드는 **안정적인 상태 계산기 + 이벤트 공급자** 역할을 수행한다.

---

## Folder Structure

```
backend/app/
  main.py          FastAPI 앱, 센서 루프
  core/            config, db, websocket
  sensor/          api, service, schema, repository
  risk/            service, rules, schema
  event/           api, service, schema, repository
  zone/            api, service, schema
  worker/          api, service, schema
  demo/            api, service, schema
  storage/         models.py (SQLModel 테이블)
```

---

## Responsibilities

| 모듈 | 역할 |
|------|------|
| sensor | 센서 데이터 수신/저장 |
| risk | 위험 상태 계산 (가중 점수제) |
| event | 이벤트 생성/저장 |
| websocket | 실시간 브로드캐스트 |
| demo | 시나리오 시뮬레이터 |
| main.py | 백그라운드 센서 루프 (2초 간격) |
