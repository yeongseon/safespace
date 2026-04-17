import { create } from 'zustand'
import type { Status, SensorData, RiskState, EventLog, WorkerState, Zone, Scenario } from '@/features/types'

interface SafeSpaceState {
  connectionStatus: 'connected' | 'reconnecting' | 'offline'
  setConnectionStatus: (s: 'connected' | 'reconnecting' | 'offline') => void

  currentZoneId: string
  setCurrentZoneId: (id: string) => void

  sensorData: SensorData | null
  setSensorData: (d: SensorData) => void

  sensorHistory: SensorData[]
  appendSensorHistory: (d: SensorData) => void

  riskState: RiskState | null
  setRiskState: (r: RiskState) => void

  events: EventLog[]
  addEvent: (e: EventLog) => void
  setEvents: (events: EventLog[]) => void

  workerState: WorkerState | null
  setWorkerState: (w: WorkerState) => void

  zones: Zone[]
  setZones: (z: Zone[]) => void

  activeScenario: Scenario
  setActiveScenario: (s: Scenario) => void

  overallStatus: Status
  setOverallStatus: (s: Status) => void
}

const MAX_HISTORY = 300

export const useStore = create<SafeSpaceState>((set) => ({
  connectionStatus: 'offline',
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  currentZoneId: 'paint-tank-a',
  setCurrentZoneId: (currentZoneId) => set({ currentZoneId }),

  sensorData: null,
  setSensorData: (sensorData) => set({ sensorData }),

  sensorHistory: [],
  appendSensorHistory: (d) =>
    set((state) => ({
      sensorHistory: [...state.sensorHistory.slice(-MAX_HISTORY), d],
    })),

  riskState: null,
  setRiskState: (riskState) => set({ riskState, overallStatus: riskState.overall_status }),

  events: [],
  addEvent: (e) =>
    set((state) => ({
      events: [e, ...state.events].slice(0, 100),
    })),
  setEvents: (events) => set({ events }),

  workerState: null,
  setWorkerState: (workerState) => set({ workerState }),

  zones: [],
  setZones: (zones) => set({ zones }),

  activeScenario: 'safe',
  setActiveScenario: (activeScenario) => set({ activeScenario }),

  overallStatus: 'SAFE',
  setOverallStatus: (overallStatus) => set({ overallStatus }),
}))
