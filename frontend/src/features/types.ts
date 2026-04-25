export type Status = 'SAFE' | 'CAUTION' | 'WARNING' | 'CRITICAL'

export interface SensorData {
  oxygen: number
  h2s: number
  co: number
  voc: number
  temperature: number
  humidity: number
  timestamp: string
}

export interface SensorHistory {
  zone_id: number
  readings: SensorData[]
}

export interface RiskState {
  overall_status: Status
  risk_score: number
  summary: string
  timestamp: string
}

export interface DashboardSummary {
  overall_status: Status
  risk_score: number
  summary: string
  connection_status: string
  timestamp: string
  zones?: {
    zone_id: string
    overall_status: Status
    risk_score: number
    summary: string
    worker_status: string
  }[]
  websocket_clients?: number
}

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
  confidence: number
  last_motion_seconds: number
  timestamp: string
}

export interface Zone {
  id: string
  name: string
  type: string
  status: Status
  location_label: string
}

export type Scenario = 'safe' | 'oxygen_drop' | 'gas_leak' | 'worker_collapse' | 'multi_risk'

export interface WSMessage {
  type: 'sensor_update' | 'status_update' | 'event_created' | 'worker_update'
  data: Record<string, unknown>
}

export interface TwinSceneManifest {
  version: 1
  zone: string
  title: string
  splatUrl: string
  thumbnailUrl?: string
  defaultCamera: TwinCameraPreset
  anchors: {
    sensors: TwinSensorAnchor[]
    worker: TwinWorkerAnchor
    exits: TwinExitAnchor[]
    hotspots?: TwinHotspot[]
    hazardVolumes?: TwinHazardVolume[]
  }
}

export interface TwinCameraPreset {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
}

export interface TwinSensorAnchor {
  id: string
  sensorKey: 'oxygen' | 'h2s' | 'co' | 'voc' | 'temperature' | 'humidity'
  label: string
  position: [number, number, number]
}

export interface TwinWorkerAnchor {
  id: string
  label: string
  position: [number, number, number]
}

export interface TwinExitAnchor {
  id: string
  label: string
  position: [number, number, number]
}

export interface TwinHotspot {
  id: string
  type: 'event' | 'camera' | 'inspection'
  label: string
  position: [number, number, number]
}

export interface TwinHazardVolume {
  id: string
  label: string
  center: [number, number, number]
  size: [number, number, number]
}
