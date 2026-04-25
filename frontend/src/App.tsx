import { useEffect, useState } from 'react'
import { Providers } from '@/app/providers'
import { Router } from '@/app/router'
import { bootstrapRuntime } from '@/lib/runtime'

function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    bootstrapRuntime()
      .then((fn) => {
        cleanup = fn
        setReady(true)
      })
      .catch((e) => setError(String(e)))
    return () => cleanup?.()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-deep text-critical text-sm">
        Failed to initialize: {error}
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-deep text-slate-500 text-sm">
        Initializing…
      </div>
    )
  }

  return (
    <Providers>
      <Router />
    </Providers>
  )
}

export default App
