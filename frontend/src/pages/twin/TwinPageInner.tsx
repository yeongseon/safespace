import { useState, useRef, useCallback } from 'react'
import { TwinCanvas, type TwinCanvasHandle } from '@/components/twin/TwinCanvas'
import { TwinHud } from '@/components/twin/TwinHud'
import type { TwinSceneManifest } from '@/features/types'

export function TwinPageInner({ manifest }: { manifest: TwinSceneManifest }) {
  const handleRef = useRef<TwinCanvasHandle | null>(null)
  const [handle, setHandle] = useState<TwinCanvasHandle | null>(null)

  const onCanvasReady = useCallback((h: TwinCanvasHandle | null) => {
    handleRef.current = h
    setHandle(h)
  }, [])

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
