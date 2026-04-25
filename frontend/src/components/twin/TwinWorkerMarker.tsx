import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useCurrentZoneWorker } from '@/app/store'
import type { TwinWorkerAnchor } from '@/features/types'
import type { TwinCanvasHandle } from './TwinCanvas'
import { User, AlertTriangle } from 'lucide-react'

interface Props {
  anchor: TwinWorkerAnchor
  handle: TwinCanvasHandle
}

export function TwinWorkerMarker({ anchor, handle }: Props) {
  const workerState = useCurrentZoneWorker()
  const markerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const vec = new THREE.Vector3()

    const update = () => {
      rafRef.current = requestAnimationFrame(update)
      const el = markerRef.current
      if (!el) return

      const rect = handle.canvasRect()
      vec.set(...anchor.position)
      vec.project(handle.camera)

      const behindCamera = vec.z > 1
      const x = (vec.x * 0.5 + 0.5) * rect.width
      const y = (-vec.y * 0.5 + 0.5) * rect.height

      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
      el.style.opacity = behindCamera ? '0' : '1'
    }

    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [anchor, handle])

  const isFall = workerState?.worker_status === 'fall_suspected'
  const isInactive = workerState?.worker_status === 'inactive'

  return (
    <div
      ref={markerRef}
      className="absolute top-0 left-0 pointer-events-auto"
      style={{ willChange: 'transform' }}
    >
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border backdrop-blur-sm text-[10px] leading-tight ${
          isFall
            ? 'bg-critical/15 border-critical/40 text-critical'
            : isInactive
            ? 'bg-slate-700/30 border-slate-600 text-slate-400'
            : 'bg-safe/15 border-safe/40 text-safe'
        }`}
      >
        {isFall ? <AlertTriangle size={10} /> : <User size={10} />}
        <span className="font-medium">{anchor.label}</span>
        <span className="font-mono text-xs">
          {isFall ? 'FALL' : isInactive ? 'Idle' : 'Active'}
        </span>
      </div>
    </div>
  )
}
