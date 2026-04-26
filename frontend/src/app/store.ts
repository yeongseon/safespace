import { create } from 'zustand'
import type { Status, SensorData, RiskState, EventLog, WorkerState, Zone, Scenario, TwinSceneManifest } from '@/features/types'

const MAX_HISTORY = 300
const MAX_EVENTS = 100

const STATUS_PRIORITY: Record<Status, number> = { SAFE: 0, CAUTION: 1, WARNING: 2, CRITICAL: 3 }

interface SafeSpaceState {
  connectionStatus: 'connected' | 'reconnecting' | 'offline'
  setConnectionStatus: (s: 'connected' | 'reconnecting' | 'offline') => void

  currentZoneId: string
  setCurrentZoneId: (id: string) => void

  sensorByZone: Record<string, SensorData | undefined>
  sensorHistoryByZone: Record<string, SensorData[]>
  riskByZone: Record<string, RiskState | undefined>
  workerByZone: Record<string, WorkerState | undefined>
  eventsByZone: Record<string, EventLog[]>

  upsertSensor: (zone: string, data: SensorData) => void
  appendSensorHistory: (zone: string, data: SensorData) => void
  upsertRisk: (zone: string, data: RiskState) => void
  upsertWorker: (zone: string, data: WorkerState) => void
  addEvent: (zone: string, event: EventLog) => void

  twinManifestByZone: Record<string, TwinSceneManifest | undefined>
  selectedTwinAnchorId: string | null
  twinPanelOpen: boolean
  setTwinManifest: (zone: string, manifest: TwinSceneManifest) => void
  setSelectedTwinAnchorId: (id: string | null) => void
  setTwinPanelOpen: (open: boolean) => void

  zones: Zone[]
  setZones: (z: Zone[]) => void

  activeScenario: Scenario
  setActiveScenario: (s: Scenario) => void

  overallStatus: Status
}

export const useStore = create<SafeSpaceState>((set) => ({
  connectionStatus: 'offline',
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  currentZoneId: 'paint-tank-a',
  setCurrentZoneId: (currentZoneId) => set({ currentZoneId }),

  sensorByZone: {},
  sensorHistoryByZone: {},
  riskByZone: {},
  workerByZone: {},
  eventsByZone: {},

  upsertSensor: (zone, data) =>
    set((state) => ({
      sensorByZone: { ...state.sensorByZone, [zone]: data },
    })),

  appendSensorHistory: (zone, data) =>
    set((state) => {
      const prev = state.sensorHistoryByZone[zone] ?? []
      return {
        sensorHistoryByZone: {
          ...state.sensorHistoryByZone,
          [zone]: [...prev, data].slice(-MAX_HISTORY),
        },
      }
    }),

  upsertRisk: (zone, data) =>
    set((state) => {
      const nextRiskByZone = { ...state.riskByZone, [zone]: data }
      let worst: Status = 'SAFE'
      for (const r of Object.values(nextRiskByZone)) {
        if (r && STATUS_PRIORITY[r.overall_status] > STATUS_PRIORITY[worst]) {
          worst = r.overall_status
        }
      }
      const nextZones = state.zones.map((z) =>
        z.id === zone ? { ...z, status: data.overall_status } : z,
      )
      return { riskByZone: nextRiskByZone, overallStatus: worst, zones: nextZones }
    }),

  upsertWorker: (zone, data) =>
    set((state) => ({
      workerByZone: { ...state.workerByZone, [zone]: data },
    })),

  addEvent: (zone, event) =>
    set((state) => {
      const prev = state.eventsByZone[zone] ?? []
      return {
        eventsByZone: {
          ...state.eventsByZone,
          [zone]: [event, ...prev].slice(0, MAX_EVENTS),
        },
      }
    }),

  twinManifestByZone: {},
  selectedTwinAnchorId: null,
  twinPanelOpen: false,
  setTwinManifest: (zone, manifest) =>
    set((state) => ({
      twinManifestByZone: { ...state.twinManifestByZone, [zone]: manifest },
    })),
  setSelectedTwinAnchorId: (selectedTwinAnchorId) => set({ selectedTwinAnchorId }),
  setTwinPanelOpen: (twinPanelOpen) => set({ twinPanelOpen }),

  zones: [],
  setZones: (zones) => set({ zones }),

  activeScenario: 'safe',
  setActiveScenario: (activeScenario) => set({ activeScenario }),

  overallStatus: 'SAFE',
}))

export const useCurrentZoneSensor = () => useStore((s) => s.sensorByZone[s.currentZoneId])
export const useCurrentZoneRisk = () => useStore((s) => s.riskByZone[s.currentZoneId])
export const useCurrentZoneWorker = () => useStore((s) => s.workerByZone[s.currentZoneId])
const EMPTY_EVENTS: never[] = []
export const useCurrentZoneEvents = () => useStore((s) => s.eventsByZone[s.currentZoneId] ?? EMPTY_EVENTS)
const EMPTY_HISTORY: never[] = []
export const useCurrentZoneHistory = () => useStore((s) => s.sensorHistoryByZone[s.currentZoneId] ?? EMPTY_HISTORY)
export const useCurrentZoneManifest = () => useStore((s) => s.twinManifestByZone[s.currentZoneId])
export const useWorstZoneRisk = () => useStore((s) => {
  const priority: Record<Status, number> = { SAFE: 0, CAUTION: 1, WARNING: 2, CRITICAL: 3 }
  let worst: RiskState | undefined
  for (const r of Object.values(s.riskByZone)) {
    if (r && (!worst || priority[r.overall_status] > priority[worst.overall_status])) {
      worst = r
    }
  }
  return worst
})
export const useAllEvents = () => useStore((s) => {
  const all: EventLog[] = []
  for (const events of Object.values(s.eventsByZone)) {
    all.push(...events)
  }
  all.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  return all.slice(0, MAX_EVENTS)
})
