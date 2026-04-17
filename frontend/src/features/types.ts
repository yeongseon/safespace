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

export interface RiskState {
  overall_status: Status
  risk_score: number
  summary: string
  timestamp: string
}

export interface DashboardSummary {
  zone_id: string
  overall_status: Status
  risk_score: number
  summary: string
  connection_status: string
  timestamp: string
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
  type: 'sensor_update' | 'status_update' | 'event_created'
  data: Record<string, unknown>
}
