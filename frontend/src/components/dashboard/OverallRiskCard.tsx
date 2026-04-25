import { motion } from 'framer-motion'
import { useStore, useWorstZoneRisk } from '@/app/store'
import { StatusBadge } from '@/components/common/StatusBadge'
import { STATUS_COLORS, STATUS_GLOW } from '@/lib/constants'
import { cn } from '@/lib/utils'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function OverallRiskCard() {
  const { overallStatus } = useStore()
  const riskState = useWorstZoneRisk()
  const score = riskState?.risk_score ?? 0
  const dashOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE
  const color = STATUS_COLORS[overallStatus]

  return (
    <div className={cn(
      'bg-surface border border-border/50 rounded-xl p-5 flex flex-col items-center gap-3',
      STATUS_GLOW[overallStatus],
    )}>
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Overall Risk</span>
        <StatusBadge status={overallStatus} />
      </div>

      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          <motion.circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={score}
            animate={{ opacity: [0.6, 1] }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>

      {riskState && (
        <p className="text-xs text-slate-400 text-center leading-relaxed">{riskState.summary}</p>
      )}
    </div>
  )
}
