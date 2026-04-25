import { useStore } from '@/app/store'
import type { TwinSceneManifest } from '@/features/types'

interface TwinIndex {
  zones: string[]
}

const BASE = import.meta.env.BASE_URL + 'twin'

export async function loadTwinIndex(): Promise<TwinIndex> {
  const res = await fetch(`${BASE}/index.json`)
  if (!res.ok) throw new Error(`Failed to load twin index: ${res.status}`)
  return res.json()
}

export async function loadTwinManifest(zoneId: string): Promise<TwinSceneManifest> {
  const cached = useStore.getState().twinManifestByZone[zoneId]
  if (cached) return cached

  const res = await fetch(`${BASE}/${zoneId}/manifest.json`)
  if (!res.ok) throw new Error(`Failed to load twin manifest for ${zoneId}: ${res.status}`)

  const manifest: TwinSceneManifest = await res.json()

  // Resolve relative splatUrl to absolute
  if (manifest.splatUrl.startsWith('./')) {
    manifest.splatUrl = `${BASE}/${zoneId}/${manifest.splatUrl.slice(2)}`
  }
  if (manifest.thumbnailUrl?.startsWith('./')) {
    manifest.thumbnailUrl = `${BASE}/${zoneId}/${manifest.thumbnailUrl.slice(2)}`
  }

  useStore.getState().setTwinManifest(zoneId, manifest)
  return manifest
}
