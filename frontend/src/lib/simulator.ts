import { useStore } from '@/app/store'
import type { Status, SensorData, RiskState, EventLog, WorkerState, Zone, Scenario } from '@/features/types'

let intervalId: ReturnType<typeof setInterval> | null = null
let activeScenario: Scenario = 'safe'
let scenarioStartedAt = Date.now()
let eventCounter = 0
let lastScenarioEventType = ''
let lastThresholdStatus: Status | null = null

const ZONES: Zone[] = [
  { id: 'paint-tank-a', name: 'Paint Tank A', type: 'paint_tank', status: 'SAFE', location_label: 'Dock 1 / Paint Tank A' },
  { id: 'cargo-hold-b', name: 'Cargo Hold B', type: 'cargo_hold', status: 'SAFE', location_label: 'Dock 2 / Cargo Hold B' },
  { id: 'engine-room-c', name: 'Engine Room C', type: 'engine_room', status: 'SAFE', location_label: 'Vessel 7 / Engine Room C' },
]

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v))
}

function generateSensor(scenario: Scenario, elapsed: number): Omit<SensorData, 'timestamp'> {
  const base = { oxygen: +(20.8 + rand(-0.12, 0.06)).toFixed(2), h2s: +(1 + rand(-0.2, 0.3)).toFixed(2), co: +(5 + rand(-1.2, 1.4)).toFixed(2), voc: +(80 + rand(-8, 10)).toFixed(2), temperature: +(25.8 + rand(-0.8, 1)).toFixed(2), humidity: +(62 + rand(-3, 3)).toFixed(2) }

  if (scenario === 'oxygen_drop') {
    const p = Math.min(elapsed / 30, 1)
    base.oxygen = +(20.8 - 4.3 * p + rand(-0.08, 0.03)).toFixed(2)
  } else if (scenario === 'gas_leak') {
    const p = Math.min(elapsed / 18, 1)
    base.h2s = +(2 + 23 * p + rand(-0.4, 0.6)).toFixed(2)
    base.voc = +(80 + 270 * p + rand(-8, 10)).toFixed(2)
    base.co = +(7 + 25 * p + rand(-1.5, 2)).toFixed(2)
  } else if (scenario === 'worker_collapse') {
    void 0
  } else if (scenario === 'multi_risk') {
    const p = Math.min(elapsed / 30, 1)
    base.oxygen = +(20.8 - 4.3 * p + rand(-0.08, 0.03)).toFixed(2)
    const gp = Math.min(elapsed / 20, 1)
    base.h2s = +(2 + 23 * gp + rand(-0.5, 0.8)).toFixed(2)
    base.voc = +(80 + 270 * gp + rand(-10, 12)).toFixed(2)
    base.co = +(6 + 30 * gp + rand(-2, 2)).toFixed(2)
  }
  return base
}

function generateWorker(scenario: Scenario, elapsed: number): WorkerState {
  const ts = new Date().toISOString()
  if (scenario === 'worker_collapse' || scenario === 'multi_risk') {
    return { worker_status: 'fall_suspected', confidence: 0.96, last_motion_seconds: Math.max(12, elapsed * 1.4), timestamp: ts }
  }
  return { worker_status: 'normal', confidence: 0.98, last_motion_seconds: +rand(0.5, 3.5).toFixed(2), timestamp: ts }
}

function oxygenRisk(o2: number): [number, string] {
  if (o2 >= 19.5) return [0, 'oxygen normal']
  if (o2 >= 18.0) { const s = 40 + ((19.5 - o2) / 1.5) * 30; return [clamp(s), 'oxygen trending low'] }
  return [clamp(75 + ((18 - o2) / 2) * 25), 'oxygen critically low']
}

function gasRisk(v: number, safeMax: number, warnMax: number): number {
  if (v <= safeMax) return 0
  if (v <= warnMax) return clamp(35 + ((v - safeMax) / Math.max(warnMax - safeMax, 1)) * 30)
  return clamp(70 + ((v - warnMax) / Math.max(warnMax, 1)) * 35)
}

function workerRisk(w: WorkerState): [number, string] {
  if (w.worker_status === 'normal') return [0, 'worker normal']
  if (w.worker_status === 'fall_suspected') return [90, 'worker collapse suspected']
  return [35, `worker state ${w.worker_status}`]
}

function mapStatus(score: number): Status {
  if (score <= 24) return 'SAFE'
  if (score <= 49) return 'CAUTION'
  if (score <= 74) return 'WARNING'
  return 'CRITICAL'
}

function evaluateRisk(sensor: SensorData, worker: WorkerState): RiskState {
  const [o2Score, o2Msg] = oxygenRisk(sensor.oxygen)
  const h2sScore = gasRisk(sensor.h2s, 5, 10)
  const coScore = gasRisk(sensor.co, 25, 50)
  const vocScore = gasRisk(sensor.voc, 100, 200)
  const maxGas = Math.max(h2sScore, coScore, vocScore)
  const envScore = sensor.temperature > 35 || sensor.temperature < 15 ? clamp(Math.abs(sensor.temperature - 25) * 4) : 0
  const [wScore, wMsg] = workerRisk(worker)

  const combined = o2Score * 0.35 + maxGas * 0.30 + envScore * 0.10 + wScore * 0.25
  const total = clamp(combined)
  const msgs: string[] = []
  if (o2Score > 0) msgs.push(o2Msg)
  if (h2sScore >= 35) msgs.push('elevated H₂S')
  if (coScore >= 35) msgs.push('elevated CO')
  if (vocScore >= 35) msgs.push('elevated VOC')
  if (wScore > 0) msgs.push(wMsg)
  const summary = msgs.length > 0 ? msgs.join(', ') : 'all monitored conditions are within safe operating range'

  return { overall_status: mapStatus(total), risk_score: +total.toFixed(1), summary, timestamp: sensor.timestamp }
}

function tickZone(zoneId: string, scenario: Scenario, elapsed: number) {
  const store = useStore.getState()
  const ts = new Date().toISOString()

  const sensorBase = generateSensor(scenario, elapsed)
  const sensor: SensorData = { ...sensorBase, timestamp: ts }
  const worker = generateWorker(scenario, elapsed)
  const risk = evaluateRisk(sensor, worker)

  store.upsertSensor(zoneId, sensor)
  store.appendSensorHistory(zoneId, sensor)
  store.upsertRisk(zoneId, risk)
  store.upsertWorker(zoneId, worker)

  return risk
}

function tick() {
  const store = useStore.getState()
  const elapsed = (Date.now() - scenarioStartedAt) / 1000
  const ts = new Date().toISOString()

  const updatedZones: Zone[] = []

  for (const zone of ZONES) {
    const scenario = zone.id === 'paint-tank-a' ? activeScenario : 'safe'
    const risk = tickZone(zone.id, scenario, elapsed)
    updatedZones.push({ ...zone, status: risk.overall_status })
  }

  store.setZones(updatedZones)

  if (activeScenario !== 'safe') {
    const risk = store.riskByZone['paint-tank-a']
    const evtType = `scenario_${activeScenario}`
    if (lastScenarioEventType !== evtType) {
      lastScenarioEventType = evtType
      const evt: EventLog = { id: ++eventCounter, zone_id: 'paint-tank-a', timestamp: ts, severity: risk?.overall_status ?? 'CAUTION', event_type: evtType, message: `Demo scenario ${activeScenario} activated`, source: 'demo_simulator' }
      store.addEvent('paint-tank-a', evt)
    }
    if (risk && (risk.overall_status === 'WARNING' || risk.overall_status === 'CRITICAL') && risk.overall_status !== lastThresholdStatus) {
      lastThresholdStatus = risk.overall_status
      const evt: EventLog = { id: ++eventCounter, zone_id: 'paint-tank-a', timestamp: ts, severity: risk.overall_status, event_type: 'risk_threshold', message: risk.summary, source: 'risk_engine' }
      store.addEvent('paint-tank-a', evt)
    } else if (risk && risk.overall_status !== 'WARNING' && risk.overall_status !== 'CRITICAL') {
      lastThresholdStatus = null
    }
  }
}

export function startSimulator() {
  const store = useStore.getState()
  store.setConnectionStatus('connected')
  store.setZones(ZONES)
  tick()
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(tick, 2000)
  return () => stopSimulator()
}

export function stopSimulator() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

export const api = {
  getDashboardSummary: async () => {
    const store = useStore.getState()
    const r = store.riskByZone[store.currentZoneId]
    return { zone_id: store.currentZoneId, overall_status: r?.overall_status ?? 'SAFE' as Status, risk_score: r?.risk_score ?? 0, summary: r?.summary ?? '', connection_status: 'connected', timestamp: new Date().toISOString() }
  },
  getSensorsLatest: async (zone?: string) => {
    const store = useStore.getState()
    const z = zone ?? store.currentZoneId
    return store.sensorByZone[z] ?? { oxygen: 20.8, h2s: 1, co: 5, voc: 80, temperature: 25, humidity: 60, timestamp: new Date().toISOString() }
  },
  getSensorHistory: async (zone?: string, _minutes?: number) => {
    const store = useStore.getState()
    const z = zone ?? store.currentZoneId
    return store.sensorHistoryByZone[z] ?? []
  },
  getEvents: async (params?: { zone?: string; severity?: string; limit?: number }) => {
    const store = useStore.getState()
    let events: EventLog[]
    if (params?.zone) {
      events = store.eventsByZone[params.zone] ?? []
    } else {
      events = []
      for (const zoneEvents of Object.values(store.eventsByZone)) {
        events.push(...zoneEvents)
      }
      events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    }
    if (params?.severity) {
      events = events.filter((e) => e.severity === params.severity)
    }
    return events.slice(0, params?.limit ?? 100)
  },
  getZones: async () => useStore.getState().zones,
  getWorkerStatus: async (zone?: string) => {
    const store = useStore.getState()
    const z = zone ?? store.currentZoneId
    return store.workerByZone[z] ?? { worker_status: 'normal' as const, confidence: 0.98, last_motion_seconds: 1, timestamp: new Date().toISOString() }
  },
  runScenario: async (scenario: Scenario) => {
    activeScenario = scenario
    scenarioStartedAt = Date.now()
    lastScenarioEventType = ''
    lastThresholdStatus = null
    tick()
    return { status: 'ok' }
  },
}
