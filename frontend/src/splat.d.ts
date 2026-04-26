declare module '@dvt3d/splat-mesh' {
  import type { Mesh } from 'three'

  export class SplatMesh extends Mesh {
    constructor()
    setVertexCount(count: number): this
    attachWorker(worker: SplatWorker): this
    detachWorker(): this
    setDataFromBuffer(buffer: ArrayBuffer): Promise<this>
    setDataFromSpz(data: {
      positions: Float32Array
      scales: Float32Array
      rotations: Float32Array
      colors: Uint8ClampedArray
      numSplats: number
    }): Promise<this>
    computeBounds(): Promise<this>
    dispose(): void
  }

  export class SplatWorker {
    constructor(baseUrl: string, options?: { timeout?: number })
    init(): Promise<boolean>
    call(fn: string, ...args: unknown[]): Promise<unknown>
    dispose(): this
  }
}

declare module '3dgs-loader' {
  interface LoaderOptions {
    onProgress?: (progress: number) => void
  }

  interface SplatAttributes {
    numSplats: number
    positions: Float32Array
    scales: Float32Array
    rotations: Float32Array
    colors: Uint8ClampedArray
  }

  export class SpzLoader {
    loadAsAttributes(url: string, options?: LoaderOptions): Promise<SplatAttributes>
    dispose(): void
  }

  export class PlyLoader {
    loadAsAttributes(url: string, options?: LoaderOptions): Promise<SplatAttributes>
    dispose(): void
  }

  export class SplatLoader {
    load(url: string, options?: LoaderOptions): Promise<{ numSplats: number; buffer: ArrayBuffer }>
    dispose(): void
  }
}
