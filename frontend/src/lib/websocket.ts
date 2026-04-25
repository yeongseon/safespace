import { useStore } from '@/app/store'
import type { SensorData, RiskState, EventLog, WorkerState } from '@/features/types'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let intentionalClose = false

export function connectWebSocket() {
  const store = useStore.getState()

  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return

  intentionalClose = false
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = window.location.host
  ws = new WebSocket(`${protocol}://${host}/ws/live`)

  ws.onopen = () => {
    store.setConnectionStatus('connected')
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  ws.onclose = () => {
    ws = null
    if (intentionalClose) {
      useStore.getState().setConnectionStatus('offline')
      return
    }
    useStore.getState().setConnectionStatus('reconnecting')
    reconnectTimer = setTimeout(connectWebSocket, 3000)
  }

  ws.onerror = () => {
    ws?.close()
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      const { type, data } = msg
      const s = useStore.getState()

      if (type === 'sensor_update') {
        const payload = data as SensorData & { zone_id?: string }
        const zone = payload.zone_id ?? s.currentZoneId
        s.upsertSensor(zone, payload)
        s.appendSensorHistory(zone, payload)
      } else if (type === 'status_update') {
        const payload = data as RiskState & { zone_id?: string }
        const zone = payload.zone_id ?? s.currentZoneId
        s.upsertRisk(zone, payload)
      } else if (type === 'event_created') {
        const payload = data as EventLog
        s.addEvent(payload.zone_id, payload)
      } else if (type === 'worker_update') {
        const payload = data as WorkerState & { zone_id?: string }
        const zone = payload.zone_id ?? s.currentZoneId
        s.upsertWorker(zone, payload)
      }
    } catch {
      void 0
    }
  }
}

export function disconnectWebSocket() {
  intentionalClose = true
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  ws?.close()
  ws = null
}
