import { useQuery } from '@tanstack/react-query'
import { useStore } from '@/app/store'
import { api } from '@/lib/simulator'
import { StatusBadge } from '@/components/common/StatusBadge'
import { MapPin } from 'lucide-react'
import { STATUS_GLOW } from '@/lib/constants'
import { cn } from '@/lib/utils'

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
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Zone Overview</h1>
        <p className="text-sm text-slate-500 mt-1">{zones.length} monitored zones</p>
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-600">Loading zones...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={cn(
                'bg-surface border border-border/50 rounded-xl p-5 flex flex-col gap-3 transition-all',
                STATUS_GLOW[zone.status],
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{zone.name}</h3>
                  <span className="text-xs text-slate-500 capitalize">{zone.type}</span>
                </div>
                <StatusBadge status={zone.status} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={11} />
                {zone.location_label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
