# 프론트엔드 구조

React 19 + TypeScript 기반의 실시간 산업 관제 대시보드이다. Vite 8로 빌드하며, Tailwind CSS v4의 `@theme` 시스템으로 디자인 토큰을 관리한다.

---

## 디렉터리 구조

```
frontend/src/
├── main.tsx                 # ReactDOM.createRoot 엔트리
├── App.tsx                  # 런타임 부트스트랩 + Router 마운트
├── App.css                  # 앱 레벨 스타일
├── index.css                # 기본 CSS 리셋
│
├── app/                     # 앱 인프라
│   ├── store.ts             # Zustand 글로벌 스토어 (구역별 맵 구조)
│   ├── router.tsx           # HashRouter + 라우트 정의
│   └── providers.tsx        # React Query Provider
│
├── pages/                   # 페이지 컴포넌트
│   ├── dashboard/
│   │   └── DashboardPage.tsx    # 메인 관제 화면
│   ├── twin/
│   │   └── TwinPage.tsx         # 3D 디지털 트윈 (lazy loading)
│   ├── demo/
│   │   └── DemoPage.tsx         # 시나리오 컨트롤 패널
│   ├── events/
│   │   └── EventsPage.tsx       # 이벤트 로그 전체 목록
│   └── zones/
│       └── ZonesPage.tsx        # 구역별 상태 카드
│
├── components/              # 재사용 컴포넌트
│   ├── layout/
│   │   ├── AppShell.tsx         # 전체 레이아웃 (TopBar + Sidebar + Content)
│   │   ├── TopBar.tsx           # 상단 네비게이션 바
│   │   └── Sidebar.tsx          # 좌측 사이드바
│   ├── dashboard/
│   │   ├── OverallRiskCard.tsx   # SVG 원형 게이지
│   │   ├── SensorMetricCard.tsx  # 개별 센서 카드
│   │   ├── LiveTrendChart.tsx    # 실시간 시계열 차트
│   │   ├── AlertBanner.tsx       # 경고 배너
│   │   ├── VideoMonitorPanel.tsx # 작업자 영상 패널
│   │   ├── WorkerStatusCard.tsx  # 작업자 상태 카드
│   │   ├── EventLogPanel.tsx     # 이벤트 로그
│   │   ├── ActionGuidePanel.tsx  # 조치 가이드
│   │   └── ZoneOverviewPanel.tsx # 구역 개요 + Twin 이동
│   ├── twin/
│   │   ├── TwinCanvas.tsx        # Three.js + Spark 2.0 렌더러 + 프로그래스 바
│   │   ├── TwinHud.tsx           # HUD 오버레이 합성
│   │   ├── TwinSensorAnchors.tsx # 센서 마커 (rAF 투영)
│   │   ├── TwinWorkerMarker.tsx  # 작업자 마커 (rAF 투영)
│   │   ├── TwinEventOverlay.tsx  # 이벤트 토스트
│   │   ├── TwinLegend.tsx        # 위험 등급 범례
│   │   └── TwinLoadingState.tsx  # 매니페스트 로딩 스피너
│   └── common/
│       ├── StatusBadge.tsx       # 상태별 색상 뱃지
│       ├── AnimatedValue.tsx     # 숫자 롤링 애니메이션
│       └── ConnectionIndicator.tsx # 연결 상태 표시기
│
├── features/                # 도메인 타입
│   └── types.ts             # 모든 TypeScript 인터페이스 (Twin 타입 포함)
│
├── lib/                     # 유틸리티 & 서비스
│   ├── runtime.ts           # 런타임 모드 판별 + bootstrapRuntime()
│   ├── data-source.ts       # DataSource 추상화 (static/backend 팩토리)
│   ├── simulator.ts         # 클라이언트 사이드 시뮬레이터 (다중 구역)
│   ├── twin-loader.ts       # Twin 매니페스트 로더 + 캐싱
│   ├── api.ts               # 백엔드 REST API 클라이언트
│   ├── websocket.ts         # WebSocket 연결 관리 (구역별 라우팅)
│   ├── utils.ts             # 공통 유틸리티 함수
│   └── constants.ts         # 상수 정의
│
└── styles/
    └── globals.css          # Tailwind v4 + 커스텀 CSS + glow 애니메이션
```

---

## 라우팅

`HashRouter`를 사용하여 GitHub Pages에서 클라이언트 사이드 라우팅을 지원한다.

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/#/` | `DashboardPage` | 메인 관제 대시보드 |
| `/#/twin` | `TwinPage` | 3D 디지털 트윈 (lazy loading) |
| `/#/demo` | `DemoPage` | 데모 시나리오 컨트롤 |
| `/#/events` | `EventsPage` | 이벤트 로그 전체 목록 |
| `/#/zones` | `ZonesPage` | 구역별 상태 카드 |

```tsx
// router.tsx
const TwinPage = lazy(() => import('@/pages/twin/TwinPage'))

<HashRouter>
  <AppShell>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/twin" element={<Suspense fallback={null}><TwinPage /></Suspense>} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/zones" element={<ZonesPage />} />
    </Routes>
  </AppShell>
</HashRouter>
```

---

## 상태 관리 (Zustand Store)

Zustand 5.0 기반 단일 글로벌 스토어이다. 서버 상태와 UI 상태를 통합 관리한다.

### 스토어 구조

```typescript
interface SafeSpaceState {
  // 연결 상태
  connectionStatus: 'connected' | 'reconnecting' | 'offline'
  setConnectionStatus: (s: 'connected' | 'reconnecting' | 'offline') => void

  // 현재 선택된 구역
  currentZoneId: string           // 기본값: 'paint-tank-a'
  setCurrentZoneId: (id: string) => void

  // 구역별 센서 데이터
  sensorByZone: Record<string, SensorData | undefined>
  sensorHistoryByZone: Record<string, SensorData[]>  // 구역별 최대 300건

  // 구역별 위험 상태
  riskByZone: Record<string, RiskState | undefined>

  // 구역별 작업자 상태
  workerByZone: Record<string, WorkerState | undefined>

  // 구역별 이벤트 로그
  eventsByZone: Record<string, EventLog[]>  // 구역별 최대 100건

  // 구역 파라미터 뮤테이터
  upsertSensor: (zone: string, data: SensorData) => void
  appendSensorHistory: (zone: string, data: SensorData) => void
  upsertRisk: (zone: string, data: RiskState) => void
  upsertWorker: (zone: string, data: WorkerState) => void
  addEvent: (zone: string, event: EventLog) => void

  // Twin 매니페스트 캐시
  twinManifestByZone: Record<string, TwinSceneManifest | undefined>
  setTwinManifest: (zone: string, manifest: TwinSceneManifest) => void

  // 구역 목록
  zones: Zone[]
  setZones: (z: Zone[]) => void

  // 시나리오
  activeScenario: Scenario
  setActiveScenario: (s: Scenario) => void

  // 전체 상태 (fleet-wide max)
  overallStatus: Status           // 모든 구역 중 최고 위험 등급
}
```

### 셀렉터 훅

`currentZoneId`를 기준으로 현재 구역의 데이터를 자동 구독하는 훅이다.

| 훅 | 반환 타입 | 설명 |
|----|-----------|------|
| `useCurrentZoneSensor()` | `SensorData \| undefined` | 현재 구역 센서 최신값 |
| `useCurrentZoneRisk()` | `RiskState \| undefined` | 현재 구역 위험 상태 |
| `useCurrentZoneWorker()` | `WorkerState \| undefined` | 현재 구역 작업자 상태 |
| `useCurrentZoneEvents()` | `EventLog[]` | 현재 구역 이벤트 목록 |
| `useCurrentZoneHistory()` | `SensorData[]` | 현재 구역 센서 히스토리 |
| `useCurrentZoneManifest()` | `TwinSceneManifest \| undefined` | 현재 구역 Twin 매니페스트 |
| `useAllEvents()` | `EventLog[]` | 전체 구역 이벤트 (시간순, 최대 100건) |

### 데이터 보관 정책

| 데이터 | 최대 보관 | 정책 |
|--------|-----------|------|
| `sensorHistoryByZone[zone]` | 구역별 300건 | FIFO — `slice(-MAX_HISTORY)` |
| `eventsByZone[zone]` | 구역별 100건 | FIFO — 새 이벤트를 앞에 추가 후 `slice(0, 100)` |
| `sensorByZone[zone]` | 1건 | 항상 최신값으로 덮어쓰기 |
| `riskByZone[zone]` | 1건 | 항상 최신값으로 덮어쓰기 |
| `twinManifestByZone[zone]` | 1건 | 페치 후 캐싱 |

---

## TypeScript 인터페이스

`features/types.ts`에 정의된 도메인 타입이다.

=== "센서 & 위험"

    ```typescript
    export type Status = 'SAFE' | 'CAUTION' | 'WARNING' | 'CRITICAL'

    export interface SensorData {
      oxygen: number      // % (0-100)
      h2s: number         // ppm
      co: number          // ppm
      voc: number         // ppm
      temperature: number // °C
      humidity: number    // %
      timestamp: string   // ISO 8601
    }

    export interface RiskState {
      overall_status: Status
      risk_score: number  // 0-100
      summary: string
      timestamp: string
    }
    ```

=== "이벤트 & 작업자"

    ```typescript
    export interface EventLog {
      id: number
      zone_id: string
      timestamp: string
      severity: Status
      event_type: string
      message: string
      source: string
    }

    export interface WorkerState {
      worker_status: 'normal' | 'inactive' | 'fall_suspected'
      confidence: number         // 0-1
      last_motion_seconds: number
      timestamp: string
    }
    ```

=== "구역 & 시나리오"

    ```typescript
    export interface Zone {
      id: string
      name: string
      type: string          // 'paint_tank' | 'cargo_hold' | 'engine_room'
      status: Status
      location_label: string
    }

    export type Scenario = 'safe' | 'oxygen_drop' | 'gas_leak'
 | 'worker_collapse' | 'multi_risk'

    export interface WSMessage {
      type: 'sensor_update' | 'status_update' | 'event_created' | 'worker_update'
      data: Record<string, unknown>
    }
    ```

---

## 클라이언트 사이드 시뮬레이터

`lib/simulator.ts`는 GitHub Pages 정적 배포를 위해 백엔드 로직을 TypeScript로 완전히 포팅한 모듈이다. 3개 구역(`paint-tank-a`, `cargo-hold-b`, `engine-room-c`)을 동시에 시뮬레이션한다.

### 구조

| 함수 | 역할 |
|------|------|
| `startSimulator()` | 연결 상태 설정, 구역 초기화, 2초 간격 `tick()` 시작 |
| `stopSimulator()` | 인터벌 정리 |
| `tick()` | 3개 구역 순회 → `tickZone()` 호출 → 스토어 갱신 → 이벤트 생성 |
| `tickZone(zoneId, scenario, elapsed)` | 구역별 센서 생성 → 작업자 생성 → 위험 평가 → 스토어 갱신 |
| `generateSensor(scenario, elapsed)` | 시나리오별 센서값 생성 |
| `generateWorker(scenario, elapsed)` | 시나리오별 작업자 상태 생성 |
| `evaluateRisk(sensor, worker)` | 가중 점수 계산 (백엔드 rules.py 미러링) |
| `api` 객체 | `DataSource` 인터페이스 호환 — 스토어에서 라이브 데이터 반환 |

### DataSource 추상화

`lib/data-source.ts`에 정의된 `DataSource` 인터페이스로 static/backend 모드를 통합한다.

```typescript
interface DataSource {
  getSensorsLatest(zone?: string): Promise<SensorData | null>
  getSensorHistory(zone?: string, minutes?: number): Promise<SensorData[]>
  getEvents(params?: { zone?: string; severity?: string; limit?: number }): Promise<EventLog[]>
  getWorkerStatus(zone?: string): Promise<WorkerState | null>
  getZones(): Promise<Zone[]>
}
```

`initDataSource()`가 런타임 모드에 따라 `createStaticDataSource()` 또는 `createBackendDataSource()` 팩토리를 호출한다. 이후 `getDataSource()`로 싱글턴에 접근한다.

### 런타임 부트스트랩

`App.tsx`는 `bootstrapRuntime()`이 완료될 때까지 렌더링을 차단한다. 이를 통해 `getDataSource()` 호출 전에 DataSource가 반드시 초기화된다.

```typescript
// App.tsx
const [ready, setReady] = useState(false)
useEffect(() => {
  bootstrapRuntime().then((fn) => { cleanup = fn; setReady(true) })
}, [])
if (!ready) return <div>Initializing…</div>
```

---

## 컴포넌트 책임 매트릭스

| 컴포넌트 | 데이터 소스 (스토어) | 주요 동작 |
|----------|---------------------|-----------|
| `OverallRiskCard` | `useWorstZoneRisk()`, `overallStatus` | SVG 게이지 렌더링, 점수 애니메이션 |
| `SensorMetricCard` | `useCurrentZoneSensor()` | 6종 센서 카드, 임계치 색상 |
| `LiveTrendChart` | `useCurrentZoneHistory()` | Recharts LineChart, 60 포인트 |
| `AlertBanner` | `useWorstZoneRisk()`, `overallStatus` | 조건부 표시, AnimatePresence |
| `VideoMonitorPanel` | `useCurrentZoneWorker()` | 상태별 오버레이, confidence 표시 |
| `WorkerStatusCard` | `useCurrentZoneWorker()` | 작업자 상태 텍스트 + 뱃지 |
| `EventLogPanel` | `useCurrentZoneEvents()` | 역순 목록, 진입 애니메이션 |
| `ActionGuidePanel` | `overallStatus` | 상태별 조치 권고 텍스트 |
| `ZoneOverviewPanel` | `zones`, `currentZoneId` | 구역 목록, 상태 뱃지, Twin 이동 버튼 |
| `TwinCanvas` | `TwinSceneManifest` (props) | Three.js + Spark 2.0 렌더링, `.spz` 다운로드 프로그래스 바 |
| `TwinSensorAnchors` | `useCurrentZoneSensor()` | rAF 투영 기반 센서 마커 |
| `TwinWorkerMarker` | `useCurrentZoneWorker()` | rAF 투영 기반 작업자 마커 |
| `TwinEventOverlay` | `useCurrentZoneEvents()` | 최근 이벤트 토스트 |
| `TwinLegend` | 정적 | 위험 등급 색상 범례 |
| `ConnectionIndicator` | `connectionStatus` | 녹색/노란/빨간 점 표시 |
| `StatusBadge` | props | 상태 텍스트 + 배경 색상 |
| `AnimatedValue` | props | 숫자 변경 시 롤링 애니메이션 |

---

## 빌드 설정

### Vite 설정

```typescript
// vite.config.ts
export default defineConfig({
  base: '/safespace/',  // GitHub Pages 서브 경로
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true }
    }
  }
})
```

### 빌드 명령

```bash
npm run build   # tsc -b && vite build → dist/ 생성
npm run dev     # Vite dev server (HMR, proxy)
npm run preview # 빌드 결과 로컬 프리뷰
```
