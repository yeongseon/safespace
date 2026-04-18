import { useStore } from '@/app/store'
import { cn } from '@/lib/utils'

const STATUS_DOT: Record<string, string> = {
  connected: 'bg-safe',
  reconnecting: 'bg-caution',
  offline: 'bg-critical',
}

const STATUS_LABEL: Record<string, string> = {
  connected: '🟢 Live',
  reconnecting: '🟡 Reconnecting',
  offline: '🔴 Offline',
}

export function ConnectionIndicator() {
  const connectionStatus = useStore((s) => s.connectionStatus)

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full', STATUS_DOT[connectionStatus], connectionStatus === 'connected' && 'animate-pulse')} />
      <span className="text-xs text-slate-400">{STATUS_LABEL[connectionStatus]}</span>
    </div>
  )
}
