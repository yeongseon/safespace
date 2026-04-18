import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, XOctagon, Bell } from 'lucide-react'
import { useStore } from '@/app/store'
import { formatTime } from '@/lib/utils'

export function AlertBanner() {
  const { overallStatus, riskState } = useStore()
  const visible = overallStatus === 'WARNING' || overallStatus === 'CRITICAL'

  return (
    <AnimatePresence>
      {visible && riskState && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`overflow-hidden ${overallStatus === 'CRITICAL' ? 'glow-critical' : ''}`}
        >
          <div
            className={`flex items-center gap-3 px-4 py-2.5 border-b ${
              overallStatus === 'CRITICAL'
                ? 'bg-critical/15 border-critical/40 text-critical'
                : 'bg-warning/10 border-warning/30 text-warning'
            }`}
          >
            {overallStatus === 'CRITICAL' ? (
              <XOctagon size={16} className="shrink-0" />
            ) : (
              <AlertTriangle size={16} className="shrink-0" />
            )}
              <span className="text-xs font-bold uppercase tracking-widest">
                {overallStatus === 'CRITICAL' ? '🚨 Critical Alert' : '⚠️ Warning'}
              </span>
            <span className="text-xs opacity-80 flex-1">{riskState.summary}</span>
            <span className="text-xs opacity-60 font-mono">{formatTime(riskState.timestamp)}</span>
            {overallStatus === 'CRITICAL' && (
              <span className="flex items-center gap-1 text-xs bg-critical/20 border border-critical/40 px-2 py-0.5 rounded">
                <Bell size={10} />
                🚨 Immediate action required
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
