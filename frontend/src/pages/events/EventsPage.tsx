import { useState } from 'react'
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
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">📋 Event Timeline</h1>
        <p className="text-sm text-slate-500 mt-1">🔔 {events.length} events</p>
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
              <div
                key={event.id}
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
