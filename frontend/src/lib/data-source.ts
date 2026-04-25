import type { SensorData, EventLog, WorkerState, Zone } from '@/features/types'

export interface DataSource {
  getSensorsLatest(zone?: string): Promise<SensorData | null>
  getSensorHistory(zone?: string, minutes?: number): Promise<SensorData[]>
  getEvents(params?: { zone?: string; severity?: string; limit?: number }): Promise<EventLog[]>
  getWorkerStatus(zone?: string): Promise<WorkerState | null>
  getZones(): Promise<Zone[]>
}

export async function createStaticDataSource(): Promise<DataSource> {
  const { api } = await import('@/lib/simulator')
  return {
    getSensorsLatest: (zone) => api.getSensorsLatest(zone),
    getSensorHistory: (zone, minutes) => api.getSensorHistory(zone, minutes),
    getEvents: (params) => api.getEvents(params),
    getWorkerStatus: (zone) => api.getWorkerStatus(zone),
    getZones: () => api.getZones(),
  }
}

export async function createBackendDataSource(): Promise<DataSource> {
  const { api } = await import('@/lib/api')
  return {
    getSensorsLatest: (zone) => api.getSensorsLatest(zone),
    getSensorHistory: async (zone, minutes) => {
      const result = await api.getSensorHistory(zone, minutes)
      return result.readings
    },
    getEvents: (params) => api.getEvents(params),
    getWorkerStatus: (zone) => api.getWorkerStatus(zone),
    getZones: () => api.getZones(),
  }
}

let _dataSource: DataSource | null = null
let _initPromise: Promise<DataSource> | null = null

export function getDataSource(): DataSource {
  if (_dataSource) return _dataSource
  throw new Error('DataSource not initialized. Call initDataSource() first.')
}

export async function initDataSource(): Promise<DataSource> {
  if (_dataSource) return _dataSource
  if (_initPromise) return _initPromise
  _initPromise = (async () => {
    const { getRuntimeMode } = await import('@/lib/runtime')
    _dataSource = getRuntimeMode() === 'backend'
      ? await createBackendDataSource()
      : await createStaticDataSource()
    return _dataSource
  })()
  return _initPromise
}
