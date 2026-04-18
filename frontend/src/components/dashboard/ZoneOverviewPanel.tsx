import { useStore } from '@/app/store'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ZONE_LABELS } from '@/lib/constants'

export function ZoneOverviewPanel() {
  const { zones, currentZoneId } = useStore()

  return (
    <div className="bg-surface border border-border/50 rounded-xl p-4">
      <span className="text-xs text-slate-500 uppercase tracking-widest font-medium block mb-3">🏭 Zones</span>
      <div className="flex flex-col gap-2">
        {zones.length === 0
          ? Object.entries(ZONE_LABELS).map(([id, label]) => (
              <div
                key={id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                  id === currentZoneId ? 'bg-bg-deep border-border' : 'border-transparent'
                }`}
              >
                <span className="text-xs text-slate-400">{label}</span>
                <StatusBadge status="SAFE" />
              </div>
            ))
          : zones.map((zone) => (
              <div
                key={zone.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                  zone.id === currentZoneId ? 'bg-bg-deep border-border' : 'border-transparent'
                }`}
              >
                <div>
                  <span className="text-xs text-slate-300">{zone.name}</span>
                  <span className="text-xs text-slate-600 ml-2">{zone.location_label}</span>
                </div>
                <StatusBadge status={zone.status} />
              </div>
            ))}
      </div>
    </div>
  )
}
