import { useEffect, useRef, useCallback, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark'
import { AlertTriangle } from 'lucide-react'
import type { TwinSceneManifest } from '@/features/types'

export interface TwinCanvasHandle {
  camera: THREE.PerspectiveCamera
  canvasRect: () => DOMRect
}

interface Props {
  manifest: TwinSceneManifest
  handleRef: MutableRefObject<TwinCanvasHandle | null>
  onReady?: (handle: TwinCanvasHandle | null) => void
}

export function TwinCanvas({ manifest, handleRef, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [splatError, setSplatError] = useState<string | null>(null)
  const [splatProgress, setSplatProgress] = useState<number | null>(manifest.splatUrl ? 0 : null)

  const manifestRef = useRef(manifest)
  manifestRef.current = manifest

    const setup = useCallback((container: HTMLDivElement) => {
    setSplatError(null)
    setSplatProgress(manifestRef.current.splatUrl ? 0 : null)

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0e1a)

    const cam = manifest.defaultCamera
    const camera = new THREE.PerspectiveCamera(
      cam.fov ?? 60,
      container.clientWidth / container.clientHeight,
      0.1,
      500,
    )
    camera.position.set(...cam.position)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(...cam.target)
    controls.enableDamping = true
    controls.dampingFactor = 0.12
    controls.update()

    const spark = new SparkRenderer({ renderer })
    scene.add(spark)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    handleRef.current = {
      camera,
      canvasRect: () => container.getBoundingClientRect(),
    }
    onReady?.(handleRef.current)

    let splatMesh: SplatMesh | null = null

    if (manifestRef.current.splatUrl) {
      try {
        splatMesh = new SplatMesh({
          url: manifestRef.current.splatUrl,
          onProgress: (e: ProgressEvent) => {
            if (e.lengthComputable && e.total > 0) {
              setSplatProgress(Math.round((e.loaded / e.total) * 100))
            }
          },
          onLoad: () => {
            setSplatProgress(null)
          },
        })
        scene.add(splatMesh)
      } catch {
        setSplatProgress(null)
        setSplatError('3D scene file not available. Sensor overlay is still active.')
      }
    }

    const grid = new THREE.GridHelper(10, 20, 0x1a2744, 0x111827)
    scene.add(grid)

    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      controls.update()
      spark.render(scene, camera)
    }
    animate()

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      controls.dispose()
      if (splatMesh) {
        scene.remove(splatMesh)
        splatMesh.dispose()
      }
      scene.remove(grid)
      scene.remove(spark)
      spark.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      handleRef.current = null
      onReady?.(null)
    }
  }, [handleRef, manifest.defaultCamera, onReady])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    return setup(container)
  }, [setup])

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {splatProgress !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-deep/80 backdrop-blur-sm z-20 pointer-events-none">
          <div className="w-48 flex flex-col items-center gap-3">
            <span className="text-xs text-slate-400">Loading 3D scene…</span>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-safe rounded-full transition-[width] duration-200 ease-out"
                style={{ width: `${splatProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 tabular-nums">{splatProgress}%</span>
          </div>
        </div>
      )}
      {splatError && (
        <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none z-10">
          <div className="inline-flex items-center gap-2 bg-surface/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 pointer-events-auto">
            <AlertTriangle size={14} className="text-caution shrink-0" />
            <span className="text-xs text-slate-400">{splatError}</span>
          </div>
        </div>
      )}
    </div>
  )
}
