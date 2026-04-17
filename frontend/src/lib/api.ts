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

import type { DashboardSummary, SensorData, EventLog, Zone, WorkerState, Scenario } from '@/features/types'

export const api = {
  getDashboardSummary: () => fetchJson<DashboardSummary>('/dashboard/summary'),
  getSensorsLatest: () => fetchJson<SensorData>('/sensors/latest'),
  getSensorHistory: (minutes = 10) => fetchJson<SensorData[]>(`/sensors/history?minutes=${minutes}`),
  getEvents: (params?: { zone_id?: string; severity?: string; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.zone_id) qs.set('zone_id', params.zone_id)
    if (params?.severity) qs.set('severity', params.severity)
    if (params?.limit) qs.set('limit', String(params.limit))
    return fetchJson<EventLog[]>(`/events?${qs}`)
  },
  getZones: () => fetchJson<Zone[]>('/zones'),
  getWorkerStatus: () => fetchJson<WorkerState>('/worker/status'),
  runScenario: (scenario: Scenario) => postJson<{ status: string }>('/demo/scenario', { scenario }),
}
