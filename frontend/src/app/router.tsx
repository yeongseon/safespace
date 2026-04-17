import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { DemoPage } from '@/pages/demo/DemoPage'
import { EventsPage } from '@/pages/events/EventsPage'
import { ZonesPage } from '@/pages/zones/ZonesPage'

export function Router() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/zones" element={<ZonesPage />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}
