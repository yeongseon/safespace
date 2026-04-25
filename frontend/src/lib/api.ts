const API_BASE = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

import type { DashboardSummary, SensorData, SensorHistory, EventLog, Zone, WorkerState, Scenario } from '@/features/types'

export const api = {
  getDashboardSummary: () => fetchJson<DashboardSummary>('/dashboard/summary'),
  getSensorsLatest: (zone?: string) => {
    const qs = zone ? `?zone=${zone}` : ''
    return fetchJson<SensorData>(`/sensors/latest${qs}`)
  },
  getSensorHistory: (zone?: string, minutes = 10) => {
    const qs = new URLSearchParams()
    if (zone) qs.set('zone', zone)
    qs.set('minutes', String(minutes))
    return fetchJson<SensorHistory>(`/sensors/history?${qs}`)
  },
  getEvents: (params?: { zone?: string; severity?: string; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.zone) qs.set('zone', params.zone)
    if (params?.severity) qs.set('severity', params.severity)
    if (params?.limit) qs.set('limit', String(params.limit))
    const suffix = qs.toString() ? `?${qs}` : ''
    return fetchJson<EventLog[]>(`/events${suffix}`)
  },
  getZones: () => fetchJson<Zone[]>('/zones'),
  getWorkerStatus: (zone?: string) => {
    const qs = zone ? `?zone=${zone}` : ''
    return fetchJson<WorkerState>(`/worker/status${qs}`)
  },
  runScenario: (scenario: Scenario) => postJson<{ status: string }>('/demo/scenario', { scenario }),
}
