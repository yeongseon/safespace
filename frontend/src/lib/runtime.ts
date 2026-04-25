import { useStore } from '@/app/store'
import { startSimulator } from '@/lib/simulator'
import { connectWebSocket, disconnectWebSocket } from '@/lib/websocket'
import { initDataSource, getDataSource } from '@/lib/data-source'

export type RuntimeMode = 'static' | 'backend'

export function getRuntimeMode(): RuntimeMode {
  return (import.meta.env.VITE_RUNTIME_MODE as RuntimeMode) ?? 'static'
}

export async function bootstrapRuntime(): Promise<() => void> {
  const mode = getRuntimeMode()
  await initDataSource()

  if (mode === 'backend') {
    const zones = await getDataSource().getZones()
    useStore.getState().setZones(zones)
    connectWebSocket()
    return () => disconnectWebSocket()
  }

  return startSimulator()
}
