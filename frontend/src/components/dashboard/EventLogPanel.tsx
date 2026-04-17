import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/app/store'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatTime } from '@/lib/utils'

export function EventLogPanel() {
  const events = useStore((s) => s.events)

  return (
    <div className="bg-surface border border-border/50 rounded-xl flex flex-col min-h-0">
      <div className="px-4 py-2.5 border-b border-border/50 shrink-0">
        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Event Log</span>
      </div>
      <div className="overflow-y-auto max-h-52 flex flex-col">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-600">No events</div>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 px-4 py-2 border-b border-border/30 last:border-0 hover:bg-surface-hover transition-colors"
              >
                <span className="text-xs text-slate-600 font-mono mt-0.5 shrink-0 w-16">
                  {formatTime(event.timestamp)}
                </span>
                <StatusBadge status={event.severity} className="shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400 leading-relaxed">{event.message}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
