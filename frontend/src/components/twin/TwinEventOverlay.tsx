import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentZoneEvents } from '@/app/store'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatTime } from '@/lib/utils'

export function TwinEventOverlay() {
  const events = useCurrentZoneEvents()
  const recent = events.slice(0, 4)

  return (
    <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 max-w-64 pointer-events-auto">
      <AnimatePresence initial={false}>
        {recent.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 px-2.5 py-1.5 bg-surface/90 backdrop-blur-sm border border-border/50 rounded-lg"
          >
            <StatusBadge status={event.severity} className="mt-0.5 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 truncate">{event.message}</span>
              <span className="text-[9px] text-slate-600 font-mono">{formatTime(event.timestamp)}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
