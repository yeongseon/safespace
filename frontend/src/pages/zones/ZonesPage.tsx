import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useStore } from '@/app/store'
import { api } from '@/lib/simulator'
import { StatusBadge } from '@/components/common/StatusBadge'
import { MapPin, Radar } from 'lucide-react'
import { STATUS_GLOW } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ZONE_TYPE_LABELS: Record<string, string> = {
  paint_tank: '🚢 Paint Tank',
  cargo_hold: '📦 Cargo Hold',
  engine_room: '⚙️ Engine Room',
}

export function ZonesPage() {
  const setZones = useStore((s) => s.setZones)

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const z = await api.getZones()
      setZones(z)
      return z
    },
  })

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface px-5 py-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.08),transparent_40%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-bg-deep/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <Radar size={12} /> Zone Coverage
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">🏭 구역 모니터링 현황</h1>
            <p className="mt-1 text-sm text-slate-400">현장 구역별 위험 상태와 위치 정보를 빠르게 확인할 수 있도록 운영 시야를 정리했습니다.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-bg-deep/70 px-3 py-2 text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Coverage</div>
            <div className="mt-1 text-lg font-semibold text-slate-100">{zones.length}</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-600">⏳ Loading zones...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <motion.div
              key={zone.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className={cn(
                'bg-surface border border-border/50 rounded-xl p-5 flex flex-col gap-3 transition-all hover:border-safe/25 hover:shadow-[0_16px_40px_rgba(2,6,23,0.28)]',
                STATUS_GLOW[zone.status],
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{zone.name}</h3>
                  <span className="text-xs text-slate-500 capitalize">{ZONE_TYPE_LABELS[zone.type] ?? zone.type}</span>
                </div>
                <StatusBadge status={zone.status} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={11} />
                {zone.location_label}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
