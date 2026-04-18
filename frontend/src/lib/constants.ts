import type { Status } from '@/features/types'

export const STATUS_COLORS: Record<Status, string> = {
  SAFE: '#22c55e',
  CAUTION: '#eab308',
  WARNING: '#f97316',
  CRITICAL: '#ef4444',
}

export const STATUS_BG: Record<Status, string> = {
  SAFE: 'bg-safe/10 border-safe/30',
  CAUTION: 'bg-caution/10 border-caution/30',
  WARNING: 'bg-warning/10 border-warning/30',
  CRITICAL: 'bg-critical/10 border-critical/30',
}

export const STATUS_GLOW: Record<Status, string> = {
  SAFE: 'glow-safe',
  CAUTION: '',
  WARNING: 'glow-warning',
  CRITICAL: 'glow-critical',
}

export const SENSOR_RANGES = {
  oxygen: { unit: '%', safeMin: 19.5, warnMin: 18.0, label: 'O₂' },
  h2s: { unit: 'ppm', safeMax: 5, warnMax: 10, label: 'H₂S' },
  co: { unit: 'ppm', safeMax: 25, warnMax: 50, label: 'CO' },
  voc: { unit: 'ppm', safeMax: 100, warnMax: 200, label: 'VOC' },
  temperature: { unit: '°C', safeMax: 35, warnMax: 40, label: 'Temperature' },
  humidity: { unit: '%', safeMax: 70, warnMax: 85, label: 'Humidity' },
}

export const ZONE_LABELS: Record<string, string> = {
  'paint-tank-a': 'Paint Tank A',
  'cargo-hold-b': 'Cargo Hold B',
  'engine-room-c': 'Engine Room C',
}
