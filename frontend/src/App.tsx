import { useEffect } from 'react'
import { Providers } from '@/app/providers'
import { Router } from '@/app/router'
import { startSimulator } from '@/lib/simulator'

function App() {
  useEffect(() => {
    startSimulator()
  }, [])

  return (
    <Providers>
      <Router />
    </Providers>
  )
}

export default App
