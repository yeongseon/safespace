import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AnimatedValue } from '@/components/common/AnimatedValue'
import { StatusBadge } from '@/components/common/StatusBadge'
import { STATUS_COLORS, STATUS_GLOW } from '@/lib/constants'
import { getSensorStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Status } from '@/features/types'

interface SensorMetricCardProps {
  label: string
  value: number
  unit: string
  sensorKey: string
  safeMin?: number
  safeMax?: number
  warnMin?: number
  warnMax?: number
  prevValue?: number
}

export function SensorMetricCard({
  label,
  value,
  unit,
  sensorKey,
  safeMin,
  safeMax,
  prevValue,
}: SensorMetricCardProps) {
  const status: Status = getSensorStatus(sensorKey, value)
  const color = STATUS_COLORS[status]
  const delta = prevValue !== undefined ? value - prevValue : 0

  const TrendIcon = delta > 0.05 ? TrendingUp : delta < -0.05 ? TrendingDown : Minus
  const trendColor = delta > 0.05 ? 'text-critical' : delta < -0.05 ? 'text-safe' : 'text-slate-500'

  const barMax = safeMax ?? (safeMin !== undefined ? 25 : 100)
  const barValue = safeMin !== undefined
    ? Math.max(0, Math.min(100, ((value - 15) / (25 - 15)) * 100))
    : Math.max(0, Math.min(100, (value / barMax) * 100))

  return (
    <div
      className={cn(
        'bg-surface border rounded-xl p-4 flex flex-col gap-2 transition-shadow',
        status === 'SAFE' ? 'border-border/50' : `border-[${color}]/30`,
        (status === 'WARNING' || status === 'CRITICAL') && STATUS_GLOW[status],
      )}
      style={status !== 'SAFE' ? { borderColor: `${color}30` } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</span>
        <TrendIcon size={12} className={trendColor} />
      </div>

      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          <AnimatedValue value={value} decimals={sensorKey === 'temperature' || sensorKey === 'humidity' ? 1 : 1} />
        </span>
        <span className="text-xs text-slate-500 mb-0.5">{unit}</span>
      </div>

      <div className="h-1 bg-bg-deep rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barValue}%`, backgroundColor: color }}
        />
      </div>

      <StatusBadge status={status} className="self-start" />
    </div>
  )
}
