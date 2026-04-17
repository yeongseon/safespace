import { motion, AnimatePresence } from 'framer-motion'
import type { Status } from '@/features/types'
import { STATUS_COLORS } from '@/lib/constants'
import { statusToLabel } from '@/lib/utils'

const STATUS_CLASSES: Record<Status, string> = {
  SAFE: 'bg-safe/10 text-safe border-safe/30',
  CAUTION: 'bg-caution/10 text-caution border-caution/30',
  WARNING: 'bg-warning/10 text-warning border-warning/30',
  CRITICAL: 'bg-critical/10 text-critical border-critical/30',
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CLASSES[status]} ${className}`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
        {statusToLabel(status)}
      </motion.span>
    </AnimatePresence>
  )
}
