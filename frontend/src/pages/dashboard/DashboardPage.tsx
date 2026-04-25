import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Radar, ShieldCheck } from 'lucide-react'
import { useStore, useCurrentZoneSensor } from '@/app/store'
import { SENSOR_RANGES, ZONE_LABELS } from '@/lib/constants'
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
  const [now, setNow] = useState(new Date())
  const currentZoneId = useStore((s) => s.currentZoneId)
  const sensorData = useCurrentZoneSensor()

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateTimeLabel = useMemo(() => now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }), [now])

  const activeZoneLabel = ZONE_LABELS[currentZoneId] ?? currentZoneId

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.04,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 min-h-0"
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface px-5 py-4"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_38%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-bg-deep/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <ShieldCheck size={12} className="text-safe" />
              Live Operations Summary
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">밀폐공간 안전 모니터링 시스템</h1>
            <p className="mt-2 text-sm text-slate-400">실시간 센서, 작업자 상태, 이벤트 로그를 하나의 운영 시야로 통합해 현장 이상 징후를 즉시 파악합니다.</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[420px]">
            <div className="rounded-xl border border-border/60 bg-bg-deep/70 px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <CalendarDays size={12} /> 현재 시각
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-100">{dateTimeLabel}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-bg-deep/70 px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <Radar size={12} /> 활성 구역
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-100">{activeZoneLabel}</div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div variants={itemVariants}>
        <AlertBanner />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-[220px_1fr_260px] gap-3 flex-1">
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
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
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <LiveTrendChart />
          <ZoneOverviewPanel />
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <VideoMonitorPanel />
          <ActionGuidePanel />
          <EventLogPanel />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
