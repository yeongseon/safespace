import type { TwinSceneManifest } from '@/features/types'
import type { TwinCanvasHandle } from './TwinCanvas'
import { TwinSensorAnchors } from './TwinSensorAnchors'
import { TwinWorkerMarker } from './TwinWorkerMarker'
import { TwinEventOverlay } from './TwinEventOverlay'
import { TwinLegend } from './TwinLegend'

interface Props {
  manifest: TwinSceneManifest
  handle: TwinCanvasHandle
}

export function TwinHud({ manifest, handle }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <TwinSensorAnchors anchors={manifest.anchors.sensors} handle={handle} />
      <TwinWorkerMarker anchor={manifest.anchors.worker} handle={handle} />
      <TwinEventOverlay />
      <TwinLegend />
    </div>
  )
}
