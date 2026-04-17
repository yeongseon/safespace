import { useStore } from '@/app/store'
import type { SensorData, RiskState, EventLog, WorkerState } from '@/features/types'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

export function connectWebSocket() {
  const store = useStore.getState()

  if (ws?.readyState === WebSocket.OPEN) return

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
    store.setConnectionStatus('reconnecting')
    ws = null
    reconnectTimer = setTimeout(connectWebSocket, 3000)
  }

  ws.onerror = () => {
    ws?.close()
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      const { type, data } = msg

      if (type === 'sensor_update') {
        const sensor = data as SensorData
        store.setSensorData(sensor)
        store.appendSensorHistory(sensor)
      } else if (type === 'status_update') {
        store.setRiskState(data as RiskState)
      } else if (type === 'event_created') {
        store.addEvent(data as EventLog)
      } else if (type === 'worker_update') {
        store.setWorkerState(data as WorkerState)
      }
    } catch {
      void 0
    }
  }
}

export function disconnectWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  ws?.close()
  ws = null
}
