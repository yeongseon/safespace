import { useState } from 'react'
import { motion } from 'framer-motion'
import { BellRing } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/simulator'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDateTime } from '@/lib/utils'
import type { Status } from '@/features/types'
import { ZONE_LABELS } from '@/lib/constants'

const SEVERITIES: (Status | 'ALL')[] = ['ALL', 'SAFE', 'CAUTION', 'WARNING', 'CRITICAL']

const SEVERITY_LABELS: Record<Status | 'ALL', string> = {
  ALL: '📋 ALL',
  SAFE: '✅ SAFE',
  CAUTION: '⚠️ CAUTION',
  WARNING: '🔶 WARNING',
  CRITICAL: '🔴 CRITICAL',
}

export function EventsPage() {
  const [severityFilter, setSeverityFilter] = useState<Status | 'ALL'>('ALL')
  const [zoneFilter, setZoneFilter] = useState<string>('ALL')

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', severityFilter, zoneFilter],
    queryFn: () =>
      api.getEvents({
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
        zone_id: zoneFilter !== 'ALL' ? zoneFilter : undefined,
        limit: 200,
      }),
  })

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface px-5 py-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_38%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-bg-deep/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <BellRing size={12} /> Event Intelligence
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">📋 이벤트 타임라인</h1>
            <p className="mt-1 text-sm text-slate-400">센서 이상, 작업자 상태 변화, 시스템 경보를 시간순으로 검토해 현장 흐름을 빠르게 파악합니다.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-bg-deep/70 px-3 py-2 text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Live Count</div>
            <div className="mt-1 text-lg font-semibold text-slate-100">{events.length}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                severityFilter === s
                  ? 'bg-slate-700 border-slate-500 text-slate-100'
                  : 'border-border/50 text-slate-500 hover:text-slate-300'
              }`}
            >
              {SEVERITY_LABELS[s]}
            </button>
          ))}
        </div>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="bg-surface border border-border text-slate-300 text-xs rounded px-2 py-1 focus:outline-none"
        >
          <option value="ALL">🏭 All Zones</option>
          {Object.entries(ZONE_LABELS).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-600">⏳ Loading events...</div>
      ) : (
        <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
          {events.length === 0 ? (
             <div className="px-4 py-8 text-center text-sm text-slate-600">📭 No events match the current filters.</div>
          ) : (
            events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: Math.min(i * 0.025, 0.2) }}
                className={`flex items-start gap-3 px-4 py-3 border-border/30 hover:bg-surface-hover transition-colors ${i < events.length - 1 ? 'border-b' : ''}`}
              >
                <span className="text-xs text-slate-600 font-mono mt-0.5 shrink-0 w-36">
                  {formatDateTime(event.timestamp)}
                </span>
                <StatusBadge status={event.severity} className="shrink-0" />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-xs text-slate-300">{event.message}</span>
                  <span className="text-xs text-slate-600">{ZONE_LABELS[event.zone_id] ?? event.zone_id} · {event.source}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
