import { User, AlertTriangle } from 'lucide-react'
import { useStore } from '@/app/store'
import { cn } from '@/lib/utils'

export function WorkerStatusCard() {
  const workerState = useStore((s) => s.workerState)
  const isFall = workerState?.worker_status === 'fall_suspected'
  const isInactive = workerState?.worker_status === 'inactive'

  return (
    <div
      className={cn(
        'bg-surface border rounded-xl p-4 flex items-center gap-4 transition-all',
        isFall ? 'border-critical/40 glow-critical' : 'border-border/50',
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center border-2',
          isFall
            ? 'bg-critical/10 border-critical/50 text-critical'
            : isInactive
            ? 'bg-slate-700/30 border-slate-700 text-slate-500'
            : 'bg-safe/10 border-safe/40 text-safe',
        )}
      >
        {isFall ? <AlertTriangle size={18} /> : <User size={18} />}
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Worker Status</span>
        <span
          className={cn(
            'text-sm font-semibold',
            isFall ? 'text-critical' : isInactive ? 'text-slate-500' : 'text-safe',
          )}
        >
          {isFall ? 'Fall Suspected' : isInactive ? 'Inactive' : 'Normal'}
        </span>
      </div>

      {workerState && (
        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500">Confidence</div>
          <div className="text-sm font-mono text-slate-300">
            {Math.round(workerState.confidence * 100)}%
          </div>
          <div className="text-xs text-slate-600">
            {workerState.last_motion_seconds}s ago
          </div>
        </div>
      )}
    </div>
  )
}
