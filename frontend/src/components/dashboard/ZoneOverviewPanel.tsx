import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/store'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ZONE_LABELS } from '@/lib/constants'
import { Boxes } from 'lucide-react'

export function ZoneOverviewPanel() {
  const { zones, currentZoneId, setCurrentZoneId } = useStore()
  const navigate = useNavigate()

  const goToTwin = (zoneId: string) => {
    setCurrentZoneId(zoneId)
    navigate('/twin')
  }

  return (
    <div className="bg-surface border border-border/50 rounded-xl p-4">
      <span className="text-xs text-slate-500 uppercase tracking-widest font-medium block mb-3">Zones</span>
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
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                  zone.id === currentZoneId ? 'bg-bg-deep border-border' : 'border-transparent'
                }`}
              >
                <button
                  type="button"
                  className="flex-1 text-left hover:opacity-80 transition-opacity"
                  onClick={() => setCurrentZoneId(zone.id)}
                >
                  <span className="text-xs text-slate-300">{zone.name}</span>
                  <span className="text-xs text-slate-600 ml-2">{zone.location_label}</span>
                </button>
                <div className="flex items-center gap-2">
                  <StatusBadge status={zone.status} />
                  <button
                    type="button"
                    onClick={() => goToTwin(zone.id)}
                    className="text-slate-600 hover:text-safe transition-colors"
                    title="Open Twin"
                    aria-label={`Open Twin for ${zone.name}`}
                  >
                    <Boxes size={13} />
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
