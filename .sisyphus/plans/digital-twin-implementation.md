# SafeSpace Spark 2.0 Digital Twin - Implementation Plan

## Current State Analysis

### Frontend (React 19 + Zustand + Vite + Tailwind 4)
- **Store** (`store.ts`): Single global state - `sensorData`, `sensorHistory`, `riskState`, `workerState`, `events` are NOT zone-aware. `currentZoneId` exists but is unused for data partitioning.
- **Router** (`router.tsx`): HashRouter with 4 routes: `/`, `/demo`, `/events`, `/zones`
- **Bootstrap** (`App.tsx`): `useEffect(() => startSimulator(), [])` - hardcoded to simulator mode
- **WebSocket** (`websocket.ts`): Handles `sensor_update`, `status_update`, `event_created`, `worker_update` - all write to single global state
- **API** (`api.ts`): No zone parameter on `getSensorsLatest`, `getSensorHistory`, `getWorkerStatus`
- **Simulator** (`simulator.ts`): Generates data for `paint-tank-a` only, exports its own `api` shim
- **Types** (`types.ts`): `SensorData`, `RiskState`, `EventLog`, `WorkerState`, `Zone`, `Scenario`, `WSMessage`

### Backend (FastAPI + SQLModel + SQLite)
- **Models** (`storage/models.py`): `Zone` has `name` (string slug, unique) + `id` (int PK). All other models use `zone_id: int` FK.
- **APIs**: `sensor/api.py`, `worker/api.py`, `event/api.py` all accept `zone_id: int | None` query param
- **Services**: Map `zone.id` -> `zone.name` in responses (responses already use string slugs)
- **WebSocket**: Broadcasts `sensor_update`, `status_update`, `event_created` with `zone_id` = zone.name (string slug). NO `worker_update` broadcast exists.
- **Sensor loop** (`main.py`): Iterates all zones, calls `process_zone()` which generates sensor+risk+worker data and broadcasts

### Key Gaps for Twin
1. Frontend store is not zone-aware (single sensor/risk/worker state)
2. No runtime mode switching (hardcoded simulator)
3. Backend APIs don't accept zone slug queries
4. No worker_update WebSocket broadcast
5. No Twin page, components, or 3D assets
6. No DataSource abstraction (simulator vs backend)

---

## PR 1 - Zone-Aware Structure Normalization

### Goal
Make the entire stack zone-aware without adding Twin UI. After this PR, Dashboard works with zone-scoped data.

### 1.1 Backend Changes

#### `backend/app/zone/service.py` - Add zone lookup helper
```python
def get_zone_by_name(session: Session, name: str) -> Zone | None:
    zones = list(session.exec(select(Zone).where(Zone.name == name)).all())
    return zones[0] if zones else None

def resolve_zone_id(session: Session, zone_id: int | None = None, zone: str | None = None) -> int | None:
    if zone_id is not None:
        return zone_id
    if zone is not None:
        z = get_zone_by_name(session, zone)
        return z.id if z else None
    return None
```

#### `backend/app/sensor/api.py` - Add `zone: str | None` param
- Add `zone: str | None = None` to both endpoints
- Call `resolve_zone_id(session, zone_id=zone_id, zone=zone)` 
- Pass resolved int to service

#### `backend/app/worker/api.py` - Same pattern
#### `backend/app/event/api.py` - Same pattern

#### `backend/app/main.py` - Add worker_update broadcast
In `process_zone()`, after `update_worker_status()`:
```python
await runtime_state.websocket_manager.broadcast(
    "worker_update",
    {
        "zone_id": db_zone.name,
        "timestamp": worker.timestamp.isoformat(),
        "worker_status": worker.worker_status,
        "confidence": worker.confidence,
        "last_motion_seconds": worker.last_motion_seconds,
    },
)
```

### 1.2 Frontend Changes

#### `frontend/src/features/types.ts` - Add Twin types + fix WSMessage
- Add `'worker_update'` to WSMessage type union
- Add all Twin types: `TwinSceneManifest`, `TwinCameraPreset`, `TwinSensorAnchor`, `TwinWorkerAnchor`, `TwinExitAnchor`, `TwinHotspot`, `TwinHazardVolume`

#### `frontend/src/app/store.ts` - Zone-aware refactor
Replace single state with byZone maps:
```typescript
interface SafeSpaceState {
  connectionStatus: 'connected' | 'reconnecting' | 'offline'
  setConnectionStatus: (s: 'connected' | 'reconnecting' | 'offline') => void

  currentZoneId: string
  setCurrentZoneId: (id: string) => void

  // Zone-aware state
  sensorByZone: Record<string, SensorData | undefined>
  sensorHistoryByZone: Record<string, SensorData[]>
  riskByZone: Record<string, RiskState | undefined>
  workerByZone: Record<string, WorkerState | undefined>
  eventsByZone: Record<string, EventLog[]>

  // Zone-aware mutators
  upsertSensor: (zone: string, data: SensorData) => void
  appendSensorHistory: (zone: string, data: SensorData) => void
  upsertRisk: (zone: string, data: RiskState) => void
  upsertWorker: (zone: string, data: WorkerState) => void
  addEvent: (zone: string, event: EventLog) => void

  // Twin state (for PR2, but define interface now)
  twinManifestByZone: Record<string, TwinSceneManifest | undefined>
  selectedTwinAnchorId: string | null
  twinPanelOpen: boolean
  setTwinManifest: (zone: string, manifest: TwinSceneManifest) => void
  setSelectedTwinAnchorId: (id: string | null) => void
  setTwinPanelOpen: (open: boolean) => void

  // Keep backward compat
  zones: Zone[]
  setZones: (z: Zone[]) => void
  activeScenario: Scenario
  setActiveScenario: (s: Scenario) => void
  overallStatus: Status
  setOverallStatus: (s: Status) => void
}
```

Selectors (exported functions):
```typescript
export const useCurrentZoneSensor = () => useStore(s => s.sensorByZone[s.currentZoneId])
export const useCurrentZoneRisk = () => useStore(s => s.riskByZone[s.currentZoneId])
export const useCurrentZoneWorker = () => useStore(s => s.workerByZone[s.currentZoneId])
export const useCurrentZoneEvents = () => useStore(s => s.eventsByZone[s.currentZoneId] ?? [])
export const useCurrentZoneHistory = () => useStore(s => s.sensorHistoryByZone[s.currentZoneId] ?? [])
```

#### `frontend/src/lib/websocket.ts` - Route messages by zone
```typescript
if (type === 'sensor_update') {
  const sensor = data as SensorData & { zone_id: string }
  const zone = sensor.zone_id ?? store.currentZoneId
  store.upsertSensor(zone, sensor)
  store.appendSensorHistory(zone, sensor)
} else if (type === 'status_update') {
  const risk = data as RiskState & { zone_id: string }
  const zone = risk.zone_id ?? store.currentZoneId
  store.upsertRisk(zone, risk)
} else if (type === 'event_created') {
  const event = data as EventLog
  store.addEvent(event.zone_id, event)
} else if (type === 'worker_update') {
  const worker = data as WorkerState & { zone_id: string }
  const zone = worker.zone_id ?? store.currentZoneId
  store.upsertWorker(zone, worker)
}
```

#### `frontend/src/lib/simulator.ts` - Multi-zone simulation
- Generate data for all 3 zones (not just paint-tank-a)
- Use zone-aware store mutators: `store.upsertSensor(zone, ...)`, etc.
- Export api shim that accepts zone parameter

#### `frontend/src/lib/api.ts` - Add zone params
```typescript
getSensorsLatest: (zone?: string) => fetchJson<SensorData>(`/sensors/latest${zone ? `?zone=${zone}` : ''}`),
getSensorHistory: (zone: string, minutes = 10) => fetchJson<SensorData[]>(`/sensors/history?zone=${zone}&minutes=${minutes}`),
getEvents: (params?: { zone?: string; severity?: string; limit?: number }) => { ... },
getWorkerStatus: (zone?: string) => fetchJson<WorkerState>(`/worker/status${zone ? `?zone=${zone}` : ''}`),
```

#### `frontend/src/lib/runtime.ts` - New file: mode controller
```typescript
export function bootstrapRuntime() {
  const mode = import.meta.env.VITE_RUNTIME_MODE ?? "static"
  if (mode === "static") {
    return startSimulator()
  }
  const disconnect = connectWebSocket()
  return () => { disconnect?.() }
}
```

#### `frontend/src/App.tsx` - Use runtime bootstrap
Replace `startSimulator()` with `bootstrapRuntime()`

#### `frontend/src/lib/data-source.ts` - New file: unified data interface
```typescript
export interface DataSource {
  getSensorsLatest(zone?: string): Promise<SensorData | null>
  getSensorHistory(zone: string, minutes?: number): Promise<SensorData[]>
  getEvents(params?: { zone?: string; severity?: string; limit?: number }): Promise<EventLog[]>
  getWorkerStatus(zone?: string): Promise<WorkerState | null>
  getZones(): Promise<Zone[]>
}
```
Two implementations: `createStaticDataSource()` (reads from store/simulator) and `createBackendDataSource()` (uses api.ts)

#### Dashboard components - Update to use zone-aware selectors
All dashboard components that read from store need to switch from:
- `useStore(s => s.sensorData)` -> `useCurrentZoneSensor()`
- `useStore(s => s.sensorHistory)` -> `useCurrentZoneHistory()`
- `useStore(s => s.riskState)` -> `useCurrentZoneRisk()`
- `useStore(s => s.workerState)` -> `useCurrentZoneWorker()`
- `useStore(s => s.events)` -> `useCurrentZoneEvents()`

Files affected:
- `components/dashboard/SensorMetricCard.tsx`
- `components/dashboard/LiveTrendChart.tsx`
- `components/dashboard/OverallRiskCard.tsx`
- `components/dashboard/WorkerStatusCard.tsx`
- `components/dashboard/EventLogPanel.tsx`
- `components/dashboard/ActionGuidePanel.tsx`
- `components/dashboard/AlertBanner.tsx`
- `components/dashboard/ZoneOverviewPanel.tsx`
- `pages/dashboard/DashboardPage.tsx`
- `pages/events/EventsPage.tsx`
- `pages/zones/ZonesPage.tsx`

### 1.3 Verification
- `npm run build` passes
- `npm run dev` works in static mode
- Dashboard displays zone-scoped data
- Zone switching updates dashboard
- Backend `pytest` passes (if tests exist)
- LSP diagnostics clean

---

## PR 2 - Twin Page + Spark 2.0 Integration

### Goal
Add the 3D digital twin page with Spark 2.0 renderer, sensor anchors, worker markers, event overlays.

### 2.1 Dependencies
```json
{
  "three": "^0.180.0",
  "@sparkjsdev/spark": "^2.0.0"
}
```

### 2.2 Static Assets
Create `frontend/public/twin/` with:
- `index.json` (zone registry)
- `paint-tank-a/manifest.json` + placeholder `scene.spz` + `preview.webp`
- `cargo-hold-b/manifest.json` + placeholder + preview
- `engine-room-c/manifest.json` + placeholder + preview

Note: Real .spz files won't be in repo (too large). Use placeholder manifests that the loader handles gracefully.

### 2.3 New Files

#### `frontend/src/lib/twin-loader.ts`
- `loadTwinIndex()` - fetch index.json
- `loadTwinManifest(zone)` - fetch zone manifest
- `resolveTwinAssetUrl(path)` - BASE_URL-aware URL builder

#### `frontend/src/pages/twin/TwinPage.tsx`
- Zone selector top bar
- TwinCanvas (main 3D view)
- TwinHud (right panel)
- Bottom strip (timeline/events)
- Reads from zone-aware store

#### `frontend/src/components/twin/TwinCanvas.tsx`
- Creates Three.js scene + camera + WebGLRenderer
- Creates SparkRenderer, adds to scene
- Loads SplatMesh from manifest.splatUrl
- Applies defaultCamera preset
- Handles resize, dispose, animation loop
- Zone change = dispose old mesh, load new

#### `frontend/src/components/twin/TwinSensorAnchors.tsx`
- CSS overlay positioned via 3D->2D projection
- Maps anchor positions to screen coords
- Shows sensor values with risk-based colors
- Click to select anchor -> HUD detail

#### `frontend/src/components/twin/TwinWorkerMarker.tsx`
- Single worker marker overlay
- Color by status (normal=green, inactive=yellow, fall_suspected=red)
- Shows confidence + inactivity timer

#### `frontend/src/components/twin/TwinEventOverlay.tsx`
- Recent event hotspots as overlay markers
- Pulsing animation for critical events
- Click to focus camera + show in HUD

#### `frontend/src/components/twin/TwinHud.tsx`
- Zone name + risk level
- Sensor summary cards
- Worker status card
- Recent events list
- Recommended action

#### `frontend/src/components/twin/TwinLegend.tsx`
- SAFE/CAUTION/WARNING/CRITICAL color legend

#### `frontend/src/components/twin/TwinLoadingState.tsx`
- Loading skeleton
- Error/no-asset fallback
- Retry button

### 2.4 Router + Sidebar
- Add `/twin` route with `React.lazy()` 
- Add Twin nav item to Sidebar (Box icon from lucide-react)

### 2.5 Verification
- Twin page loads for all 3 zones
- Graceful fallback when .spz missing
- Sensor overlays show correct values
- Worker marker updates in real-time
- Zone switching works
- No memory leaks (dispose on unmount/zone change)
- Build passes

---

## PR 3 - Cross-Page Integration

### Goal
Connect Dashboard, Events, Zones pages to Twin.

### 3.1 Changes

#### `DashboardPage.tsx`
- "Open Twin" button in header
- Zone card click -> navigate to Twin

#### `ZoneOverviewPanel.tsx`
- "View in Twin" button per zone card
- Twin Ready badge
- Preview thumbnail

#### `EventsPage.tsx`
- Event row click -> setCurrentZoneId + navigate to /twin
- Zone filter uses slug

#### `ZonesPage.tsx`
- "Open Twin" button per zone
- Twin asset availability badge

### 3.2 Documentation
- `docs/digital-twin.md` - New: Twin architecture, manifest schema, Spark 2.0 usage
- `docs/frontend.md` - Update: Twin components, runtime, data-source, zone-aware store
- `docs/backend.md` - Update: zone slug queries, worker_update broadcast
- `docs/api.md` - Update: zone query param examples, worker_update WS message
- `docs/architecture.md` - Update: Twin Visualization Layer diagram
- `docs/ux-ui.md` - Update: Twin HUD layout, overlay principles

### 3.3 Verification
- Dashboard -> Twin navigation works
- Events -> Twin navigation works with correct zone
- Zones -> Twin navigation works
- All docs accurate

---

## Risk Assessment

1. **Store refactor scope**: Changing store shape affects ALL dashboard components. Must update every selector.
2. **Simulator multi-zone**: Current simulator only generates for paint-tank-a. Need to expand carefully.
3. **Spark 2.0 bundle size**: Three.js + Spark will significantly increase bundle. Lazy loading is critical.
4. **No real .spz files**: Need graceful fallback when scene files are missing.
5. **CSS overlay positioning**: 3D-to-2D projection for sensor anchors requires camera matrix math each frame.

## Questions for Oracle
1. Is the store refactor approach (byZone maps + selectors) the right pattern, or should we use separate Zustand slices?
2. Should TwinCanvas use vanilla Three.js in useEffect or React Three Fiber? (Spec says no R3F initially)
3. How to handle 3D->2D overlay projection efficiently for sensor anchors?
4. DataSource abstraction: is a simple interface + two implementations sufficient, or do we need a React context provider?
5. For the simulator multi-zone expansion: should each zone tick independently or all in one tick?
