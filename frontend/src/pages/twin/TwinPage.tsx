import { useStore, useCurrentZoneManifest } from '@/app/store'
import { TwinPageInner } from './TwinPageInner'
import { TwinLoadingState } from '@/components/twin/TwinLoadingState'
import { useEffect, useState } from 'react'
import { loadTwinManifest } from '@/lib/twin-loader'

export function TwinPage() {
  const currentZoneId = useStore((s) => s.currentZoneId)
  const manifest = useCurrentZoneManifest()
  const [errorForZone, setErrorForZone] = useState<{ zone: string; message: string } | null>(null)

  useEffect(() => {
    if (useStore.getState().twinManifestByZone[currentZoneId]) return
    let cancelled = false
    loadTwinManifest(currentZoneId)
      .catch((e) => { if (!cancelled) setErrorForZone({ zone: currentZoneId, message: String(e) }) })
    return () => { cancelled = true }
  }, [currentZoneId])

  const error = errorForZone?.zone === currentZoneId && !manifest ? errorForZone.message : null

  if (error) return <div className="flex items-center justify-center h-full text-critical text-sm">{error}</div>
  if (!manifest) return <TwinLoadingState />

  return <TwinPageInner key={currentZoneId} manifest={manifest} />
}

export default TwinPage
