import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPinned } from 'lucide-react'
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
      <div className="flex items-center gap-2 rounded-lg border border-safe/20 bg-safe/5 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <MapPinned size={13} className="text-safe" />
        <select
          value={currentZoneId}
          onChange={(e) => setCurrentZoneId(e.target.value)}
          className="bg-transparent border-none text-slate-200 text-xs rounded pr-1 focus:outline-none"
        >
          {Object.entries(ZONE_LABELS).map(([id, label]) => (
            <option key={id} value={id} className="bg-surface text-slate-200">{label}</option>
          ))}
        </select>
      </div>
      <span className="text-slate-400 text-xs font-mono tabular-nums">{timeStr}</span>
      <motion.div
        animate={{ boxShadow: ['0 0 0 rgba(34,197,94,0)', '0 0 0 6px rgba(34,197,94,0.05)', '0 0 0 rgba(34,197,94,0)'] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-full border border-border/60 bg-surface/80 px-2.5 py-1"
      >
        <ConnectionIndicator />
      </motion.div>
    </header>
  )
}
