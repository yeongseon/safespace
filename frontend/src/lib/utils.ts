import type { Status } from '@/features/types'

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function statusToLabel(s: Status): string {
  const labels: Record<Status, string> = {
    SAFE: 'SAFE',
    CAUTION: 'CAUTION',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL',
  }
  return labels[s]
}

export function getSensorStatus(
  key: string,
  value: number,
): Status {
  const ranges: Record<string, { safeMin?: number; warnMin?: number; safeMax?: number; warnMax?: number }> = {
    oxygen: { safeMin: 19.5, warnMin: 18.0 },
    h2s: { safeMax: 5, warnMax: 10 },
    co: { safeMax: 25, warnMax: 50 },
    voc: { safeMax: 100, warnMax: 200 },
    temperature: { safeMax: 35, warnMax: 40 },
    humidity: { safeMax: 70, warnMax: 85 },
  }

  const range = ranges[key]
  if (!range) return 'SAFE'

  if (range.safeMin !== undefined) {
    if (value >= range.safeMin) return 'SAFE'
    if (value >= (range.warnMin ?? 0)) return 'WARNING'
    return 'CRITICAL'
  }

  if (range.safeMax !== undefined) {
    if (value <= range.safeMax) return 'SAFE'
    if (value <= (range.warnMax ?? Infinity)) return 'WARNING'
    return 'CRITICAL'
  }

  return 'SAFE'
}
