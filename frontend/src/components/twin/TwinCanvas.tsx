import { useEffect, useRef, useCallback, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark'
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

  const manifestRef = useRef(manifest)
  manifestRef.current = manifest

  const setup = useCallback((container: HTMLDivElement) => {
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
      splatMesh = new SplatMesh({
        url: manifestRef.current.splatUrl,
      })
      scene.add(splatMesh)
    }

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

  return <div ref={containerRef} className="w-full h-full" />
}
