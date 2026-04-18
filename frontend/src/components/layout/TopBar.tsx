import { useEffect, useState } from 'react'
import { useStore } from '@/app/store'
import { ConnectionIndicator } from '@/components/common/ConnectionIndicator'
import { ZONE_LABELS } from '@/lib/constants'

export function TopBar() {
  const [time, setTime] = useState(new Date())
  const { currentZoneId, setCurrentZoneId } = useStore()

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <header className="h-12 bg-bg-deep border-b border-border flex items-center px-4 gap-4 shrink-0">
      <span className="text-slate-100 font-bold tracking-widest text-sm uppercase">
        🛡️ SafeSpace
      </span>
      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
        🏭 Confined Space Monitor
      </span>
      <div className="flex-1" />
      <select
        value={currentZoneId}
        onChange={(e) => setCurrentZoneId(e.target.value)}
        className="bg-surface border border-border text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-safe/50"
      >
        {Object.entries(ZONE_LABELS).map(([id, label]) => (
          <option key={id} value={id}>{label}</option>
        ))}
      </select>
      <span className="text-slate-400 text-xs font-mono tabular-nums">{timeStr}</span>
      <ConnectionIndicator />
    </header>
  )
}
