import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore, useCurrentZoneManifest } from '@/app/store'
import { loadTwinManifest } from '@/lib/twin-loader'
import { TwinCanvas, type TwinCanvasHandle } from '@/components/twin/TwinCanvas'
import { TwinHud } from '@/components/twin/TwinHud'
import { TwinLoadingState } from '@/components/twin/TwinLoadingState'

export function TwinPage() {
  const currentZoneId = useStore((s) => s.currentZoneId)
  const manifest = useCurrentZoneManifest()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handleRef = useRef<TwinCanvasHandle | null>(null)
  const [handle, setHandle] = useState<TwinCanvasHandle | null>(null)

  useEffect(() => {
    setHandle(null)
    handleRef.current = null
    setError(null)

    if (manifest) return
    let cancelled = false
    setLoading(true)
    setError(null)
    loadTwinManifest(currentZoneId)
      .catch((e) => { if (!cancelled) setError(String(e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [currentZoneId, manifest])

  const onCanvasReady = useCallback((h: TwinCanvasHandle | null) => {
    handleRef.current = h
    setHandle(h)
  }, [])

  if (loading) return <TwinLoadingState />
  if (error) return <div className="flex items-center justify-center h-full text-critical text-sm">{error}</div>
  if (!manifest) return <TwinLoadingState message="Preparing scene…" />

  return (
    <div className="relative w-full h-full overflow-hidden bg-bg-deep">
      <TwinCanvas manifest={manifest} handleRef={handleRef} onReady={onCanvasReady} />
      {handle && <TwinHud manifest={manifest} handle={handle} />}

      <div className="absolute top-3 left-3 bg-surface/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-1.5 pointer-events-auto">
        <span className="text-xs text-slate-400">{manifest.title}</span>
      </div>
    </div>
  )
}

export default TwinPage
