import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useCurrentZoneSensor } from '@/app/store'
import type { TwinSensorAnchor } from '@/features/types'
import type { TwinCanvasHandle } from './TwinCanvas'
import { SENSOR_RANGES } from '@/lib/constants'
import type { SensorData } from '@/features/types'

interface Props {
  anchors: TwinSensorAnchor[]
  handle: TwinCanvasHandle
}

const STATUS_COLORS: Record<string, string> = {
  safe: '#22c55e',
  caution: '#eab308',
  warning: '#f97316',
  critical: '#ef4444',
}

function getSensorStatus(key: string, value: number): string {
  const range = SENSOR_RANGES[key as keyof typeof SENSOR_RANGES]
  if (!range) return 'safe'
  // Min-based (oxygen): below warnMin → critical, below safeMin → warning
  if ('warnMin' in range && value < range.warnMin) return 'critical'
  if ('safeMin' in range && value < range.safeMin) return 'warning'
  // Max-based (h2s, co, voc, temp, humidity): above warnMax → critical, above safeMax → warning
  if ('warnMax' in range && value > range.warnMax) return 'critical'
  if ('safeMax' in range && value > range.safeMax) return 'warning'
  return 'safe'
}

export function TwinSensorAnchors({ anchors, handle }: Props) {
  const sensorData = useCurrentZoneSensor()
  const markerRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef(0)

  useEffect(() => {
    const vec = new THREE.Vector3()

    const update = () => {
      rafRef.current = requestAnimationFrame(update)
      const rect = handle.canvasRect()
      const { camera } = handle

      for (let i = 0; i < anchors.length; i++) {
        const el = markerRefs.current[i]
        if (!el) continue
        const anchor = anchors[i]

        vec.set(...anchor.position)
        vec.project(camera)

        const behindCamera = vec.z > 1
        const x = (vec.x * 0.5 + 0.5) * rect.width
        const y = (-vec.y * 0.5 + 0.5) * rect.height

        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
        el.style.opacity = behindCamera ? '0' : '1'
      }
    }

    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [anchors, handle])

  return (
    <>
      {anchors.map((anchor, i) => {
        const value = sensorData?.[anchor.sensorKey as keyof SensorData]
        const numValue = typeof value === 'number' ? value : 0
        const status = getSensorStatus(anchor.sensorKey, numValue)
        const color = STATUS_COLORS[status] ?? STATUS_COLORS.safe
        const range = SENSOR_RANGES[anchor.sensorKey as keyof typeof SENSOR_RANGES]

        return (
          <div
            key={anchor.id}
            ref={(el) => { markerRefs.current[i] = el }}
            className="absolute top-0 left-0 pointer-events-auto"
            style={{ willChange: 'transform' }}
          >
            <div
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border backdrop-blur-sm text-[10px] leading-tight"
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}40`,
                color,
              }}
            >
              <span className="font-medium">{anchor.label}</span>
              <span className="font-mono font-bold text-xs">
                {typeof value === 'number' ? value.toFixed(1) : '—'}
                {range ? ` ${range.unit}` : ''}
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}
