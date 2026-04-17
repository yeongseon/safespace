import { useEffect } from 'react'
import { useStore } from '@/app/store'
import { api } from '@/lib/simulator'
import { SENSOR_RANGES } from '@/lib/constants'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { OverallRiskCard } from '@/components/dashboard/OverallRiskCard'
import { SensorMetricCard } from '@/components/dashboard/SensorMetricCard'
import { LiveTrendChart } from '@/components/dashboard/LiveTrendChart'
import { ZoneOverviewPanel } from '@/components/dashboard/ZoneOverviewPanel'
import { VideoMonitorPanel } from '@/components/dashboard/VideoMonitorPanel'
import { WorkerStatusCard } from '@/components/dashboard/WorkerStatusCard'
import { EventLogPanel } from '@/components/dashboard/EventLogPanel'
import { ActionGuidePanel } from '@/components/dashboard/ActionGuidePanel'

const SENSOR_KEYS = ['oxygen', 'h2s', 'co', 'voc', 'temperature', 'humidity'] as const

export function DashboardPage() {
  const { sensorData, setSensorData, appendSensorHistory, setRiskState, setEvents, setZones, setWorkerState } = useStore()

  useEffect(() => {
    api.getSensorsLatest().then(setSensorData).catch(() => void 0)
    api.getSensorHistory(10).then((h) => h.forEach(appendSensorHistory)).catch(() => void 0)
    api.getDashboardSummary().then((s) => {
      setRiskState({ overall_status: s.overall_status, risk_score: s.risk_score, summary: s.summary, timestamp: s.timestamp })
    }).catch(() => void 0)
    api.getEvents({ limit: 50 }).then(setEvents).catch(() => void 0)
    api.getZones().then(setZones).catch(() => void 0)
    api.getWorkerStatus().then(setWorkerState).catch(() => void 0)
  }, [setSensorData, appendSensorHistory, setRiskState, setEvents, setZones, setWorkerState])

  return (
    <div className="flex flex-col gap-3 min-h-0">
      <AlertBanner />

      <div className="grid grid-cols-[220px_1fr_260px] gap-3 flex-1">
        <div className="flex flex-col gap-3">
          <OverallRiskCard />
          <div className="grid grid-cols-2 gap-2">
            {SENSOR_KEYS.map((key) => {
              const range = SENSOR_RANGES[key]
              const value = sensorData?.[key] ?? 0
              return (
                <SensorMetricCard
                  key={key}
                  label={range.label}
                  value={value}
                  unit={range.unit}
                  sensorKey={key}
                  safeMin={'safeMin' in range ? range.safeMin : undefined}
                  safeMax={'safeMax' in range ? range.safeMax : undefined}
                  warnMin={'warnMin' in range ? range.warnMin : undefined}
                  warnMax={'warnMax' in range ? range.warnMax : undefined}
                />
              )
            })}
          </div>
          <WorkerStatusCard />
        </div>

        <div className="flex flex-col gap-3">
          <LiveTrendChart />
          <ZoneOverviewPanel />
        </div>

        <div className="flex flex-col gap-3">
          <VideoMonitorPanel />
          <ActionGuidePanel />
          <EventLogPanel />
        </div>
      </div>
    </div>
  )
}
