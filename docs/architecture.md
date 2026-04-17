# 아키텍처

SafeSpace의 시스템 아키텍처, 데이터 흐름, 모듈 의존성을 설명한다.

---

## 시스템 개요

SafeSpace는 두 가지 실행 모드를 지원한다:

1. **Full-Stack 모드**: FastAPI 백엔드가 센서 데이터를 생성하고 WebSocket으로 프론트엔드에 전달
2. **Static 모드**: 클라이언트 사이드 시뮬레이터가 브라우저에서 직접 데이터 생성 (GitHub Pages)

---

## 시스템 컨텍스트

```mermaid
graph TB
    subgraph Users["사용자"]
        SA[안전관리자]
        ZM[구역관리자]
        JD[심사위원/청중]
    end

    subgraph SafeSpace["SafeSpace System"]
        FE[React Dashboard<br/>실시간 관제 UI]
        BE[FastAPI Backend<br/>데이터 파이프라인]
        DB[(SQLite DB)]
    end

    subgraph External["외부 시스템 (향후)"]
        IOT[IoT 센서]
        CAM[CCTV 카메라]
        SMS[SMS/Push 알림]
    end

    SA --> FE
    ZM --> FE
    JD --> FE
    FE <-->|REST + WebSocket| BE
    BE <--> DB
    IOT -.->|향후 연동| BE
    CAM -.->|향후 연동| BE
    BE -.->|향후 연동| SMS
```

---

## Full-Stack 모드 아키텍처

```mermaid
graph TB
    subgraph Backend["FastAPI Backend (Python)"]
        direction TB
        LP[Sensor Loop<br/>asyncio.create_task<br/>2초 간격]
        DS[DemoSimulator<br/>시나리오 엔진]
        RE[Risk Engine<br/>rules.py]
        WM[WebSocket Manager<br/>ConnectionManager]
        API[REST API<br/>FastAPI Routers]

        LP --> DS
        DS --> RE
        RE --> WM
        LP --> WM
        API --> DS
    end

    subgraph Database["SQLite"]
        SR[(SensorReading)]
        RS[(RiskState)]
        EL[(EventLog)]
        WS[(WorkerState)]
        ZN[(Zone)]
    end

    subgraph Frontend["React Frontend (TypeScript)"]
        direction TB
        WSC[WebSocket Client]
        ZST[Zustand Store]
        RQ[React Query]
        CMP[React Components<br/>20+ 컴포넌트]

        WSC --> ZST
        RQ --> ZST
        ZST --> CMP
    end

    LP -.-> SR
    LP -.-> RS
    LP -.-> EL
    LP -.-> WS
    LP -.-> ZN
    WM -->|broadcast JSON| WSC
    CMP -->|HTTP GET/POST| API
```

---

## Static 모드 아키텍처

```mermaid
graph LR
    subgraph Browser["브라우저"]
        direction TB
        SIM["simulator.ts<br/>(DemoSimulator + RiskEngine<br/>TypeScript 포팅)"]
        ZST[Zustand Store]
        CMP[React Components]

        SIM -->|"2초 tick()"|ZST
        ZST --> CMP
        CMP -->|"api.runScenario()"|SIM
    end
```

!!! info "두 모드의 코드 공유"
    프론트엔드 컴포넌트는 `api` 객체를 통해 데이터에 접근한다. Full-Stack 모드에서는 `lib/api.ts`의 HTTP 클라이언트를, Static 모드에서는 `lib/simulator.ts`의 인메모리 API를 사용한다. 인터페이스가 동일하므로 컴포넌트 코드 변경이 불필요하다.

---

## 데이터 흐름

### 센서 데이터 생성 → UI 표시

```mermaid
sequenceDiagram
    participant SL as Sensor Loop
    participant DS as DemoSimulator
    participant DB as SQLite
    participant RE as Risk Engine
    participant WS as WebSocket Manager
    participant ST as Zustand Store
    participant UI as React UI

    loop 매 2초
        SL->>DS: generate_state(zone_name)
        DS-->>SL: SimulatedState
        SL->>DB: INSERT SensorReading
        SL->>DB: UPDATE WorkerState
        SL->>RE: evaluate_risk(reading, history, worker)
        RE-->>SL: (score, summary)
        SL->>DB: INSERT RiskState
        SL->>DB: UPDATE Zone.status

        alt 상태 전환 발생
            SL->>DB: INSERT EventLog
            SL->>WS: broadcast("event_created", event)
        end

        SL->>WS: broadcast("sensor_update", sensor)
        SL->>WS: broadcast("status_update", risk)
        WS-->>ST: JSON message via WebSocket
        ST-->>UI: 리렌더링 트리거
    end
```

### 시나리오 활성화 흐름

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as React UI
    participant API as REST API
    participant DS as DemoSimulator
    participant SL as Sensor Loop

    User->>UI: 시나리오 버튼 클릭
    UI->>API: POST /api/demo/scenario {"scenario": "oxygen_drop"}
    API->>DS: activate(ScenarioType.oxygen_drop)
    DS-->>API: ok
    API-->>UI: {"status": "ok"}

    Note over SL: 다음 tick에서 새 시나리오 적용
    SL->>DS: generate_state("paint-tank-a")
    DS-->>SL: 산소 감소된 SimulatedState
```

---

## 모듈 의존성

### 백엔드 모듈 관계

```mermaid
graph TD
    MAIN[main.py] --> CORE_DB[core/db.py]
    MAIN --> CORE_WS[core/websocket.py]
    MAIN --> CORE_CFG[core/config.py]
    MAIN --> DEMO_SVC[demo/service.py]
    MAIN --> RISK_SVC[risk/service.py]
    MAIN --> SENSOR_REPO[sensor/repository.py]
    MAIN --> EVENT_SVC[event/service.py]
    MAIN --> WORKER_SVC[worker/service.py]
    MAIN --> STATE[main_state.py]
    MAIN --> MODELS[storage/models.py]

    RISK_SVC --> RISK_RULES[risk/rules.py]
    RISK_RULES --> CORE_CFG
    RISK_RULES --> MODELS

    SENSOR_REPO --> MODELS
    EVENT_SVC --> MODELS
    WORKER_SVC --> MODELS
    DEMO_SVC --> DEMO_SCHEMA[demo/schema.py]

    STATE --> CORE_WS
    CORE_DB --> MODELS

    style MAIN fill:#f96,stroke:#333
    style RISK_RULES fill:#9f6,stroke:#333
    style MODELS fill:#69f,stroke:#333
```

### 프론트엔드 모듈 관계

```mermaid
graph TD
    ENTRY[main.tsx] --> APP[App.tsx]
    APP --> ROUTER[app/router.tsx]
    APP --> SIM[lib/simulator.ts]

    ROUTER --> DASH[pages/DashboardPage]
    ROUTER --> DEMO_P[pages/DemoPage]
    ROUTER --> EVENTS_P[pages/EventsPage]
    ROUTER --> ZONES_P[pages/ZonesPage]

    ROUTER --> SHELL[components/layout/AppShell]

    DASH --> RISK_CARD[OverallRiskCard]
    DASH --> SENSOR_CARD[SensorMetricCard]
    DASH --> CHART[LiveTrendChart]
    DASH --> BANNER[AlertBanner]
    DASH --> VIDEO[VideoMonitorPanel]
    DASH --> EVENT_LOG[EventLogPanel]
    DASH --> ACTION[ActionGuidePanel]

    SIM --> STORE[app/store.ts]
    STORE --> TYPES[features/types.ts]

    RISK_CARD --> STORE
    SENSOR_CARD --> STORE
    CHART --> STORE
    BANNER --> STORE
    VIDEO --> STORE
    EVENT_LOG --> STORE

    style ENTRY fill:#f96
    style STORE fill:#9f6
    style SIM fill:#ff9
```

---

## 상태 관리 아키텍처

```mermaid
graph LR
    subgraph Sources["데이터 소스"]
        WS[WebSocket<br/>Full-Stack]
        SIM[Simulator<br/>Static]
    end

    subgraph Store["Zustand Store"]
        SD[sensorData]
        SH[sensorHistory<br/>max 300]
        RS[riskState]
        EV[events<br/>max 100]
        WK[workerState]
        ZN[zones]
        CS[connectionStatus]
        OS[overallStatus]
    end

    subgraph Consumers["React 컴포넌트"]
        C1[OverallRiskCard → riskState, overallStatus]
        C2[SensorMetricCard → sensorData]
        C3[LiveTrendChart → sensorHistory]
        C4[AlertBanner → overallStatus]
        C5[EventLogPanel → events]
        C6[VideoMonitorPanel → workerState]
    end

    WS --> SD
    WS --> RS
    WS --> EV
    SIM --> SD
    SIM --> SH
    SIM --> RS
    SIM --> EV
    SIM --> WK
    SIM --> ZN

    SD --> C2
    SH --> C3
    RS --> C1
    OS --> C4
    EV --> C5
    WK --> C6
```

---

## 이벤트 구동 아키텍처

시스템은 이벤트 구동(event-driven) 패턴을 따른다.

| 이벤트 | 발생 시점 | 소비자 |
|--------|-----------|--------|
| `sensor_update` | 매 2초, 구역별 | 센서 카드, 차트, 히스토리 |
| `status_update` | 매 2초, 구역별 | 리스크 게이지, 배너, 상태 뱃지 |
| `event_created` | 상태 전환 시 | 이벤트 로그, 조치 가이드 |

### 이벤트 생성 조건

```mermaid
graph TD
    A[Risk 평가 완료] --> B{상태 변경?}
    B -->|WARNING/CRITICAL 전환| C[risk_threshold_exceeded 이벤트]
    B -->|변경 없음| D[이벤트 없음]

    E[시나리오 활성화] --> F{신규 시나리오?}
    F -->|최근 5건에 없음| G[scenario_xxx 이벤트]
    F -->|이미 존재| H[이벤트 없음]
```

---

## 확장 포인트

| 확장 영역 | 현재 | 확장 방법 |
|-----------|------|-----------|
| 데이터 소스 | DemoSimulator | MQTT 브릿지 → 실제 IoT 센서 |
| 영상 분석 | 시뮬레이션 | MediaPipe Pose → WorkerState API |
| 데이터베이스 | SQLite | PostgreSQL + 커넥션 풀 |
| 알림 | UI 배너만 | WebHook → SMS/Email/Push |
| 인증 | 없음 | FastAPI OAuth2 + JWT |
| 캐싱 | 없음 | Redis (센서 최신값, 세션) |
