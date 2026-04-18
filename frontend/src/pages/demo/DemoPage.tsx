import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  Shield,
  Wind,
  Flame,
  UserX,
  AlertTriangle,
  RotateCcw,
  Activity,
  Sparkles,
} from 'lucide-react'
import { useStore } from '@/app/store'
import { api } from '@/lib/simulator'
import type { Scenario } from '@/features/types'

const SCENARIOS: {
  id: Scenario
  icon: ReactNode
  title: string
  description: string
  color: string
}[] = [
  {
    id: 'safe',
    icon: <Shield size={24} />,
    title: '✅ Safe Baseline',
    description: '🟢 Normal operating conditions. All sensors within safe parameters.',
    color: 'safe',
  },
  {
    id: 'oxygen_drop',
    icon: <Wind size={24} />,
    title: '🫁 Oxygen Depletion',
    description: '⚠️ O₂ levels dropping below safe threshold (19.5%). Ventilation failure scenario.',
    color: 'warning',
  },
  {
    id: 'gas_leak',
    icon: <Flame size={24} />,
    title: '☠️ Gas Leak',
    description: '🚨 H₂S and CO levels rising. Toxic gas infiltration from adjacent area.',
    color: 'critical',
  },
  {
    id: 'worker_collapse',
    icon: <UserX size={24} />,
    title: '👷 Worker Collapse',
    description: '🚨 Worker motion ceases — fall or incapacitation detected by camera system.',
    color: 'critical',
  },
  {
    id: 'multi_risk',
    icon: <AlertTriangle size={24} />,
    title: '🚨 Multi-Risk Event',
    description: '⚠️ Combined scenario: gas leak, low oxygen, and worker distress simultaneously.',
    color: 'critical',
  },
]

const COLOR_CLASSES: Record<string, { border: string; bg: string; text: string; activeBorder: string; activeBg: string }> = {
  safe: {
    border: 'border-border/50 hover:border-safe/30',
    bg: 'hover:bg-safe/5',
    text: 'text-safe',
    activeBorder: 'border-safe/50',
    activeBg: 'bg-safe/10',
  },
  warning: {
    border: 'border-border/50 hover:border-warning/30',
    bg: 'hover:bg-warning/5',
    text: 'text-warning',
    activeBorder: 'border-warning/50',
    activeBg: 'bg-warning/10',
  },
  critical: {
    border: 'border-border/50 hover:border-critical/30',
    bg: 'hover:bg-critical/5',
    text: 'text-critical',
    activeBorder: 'border-critical/50',
    activeBg: 'bg-critical/10',
  },
}

export function DemoPage() {
  const { activeScenario, setActiveScenario } = useStore()
  const activeScenarioMeta = SCENARIOS.find((scenario) => scenario.id === activeScenario) ?? SCENARIOS[0]
  const isScenarioRunning = activeScenario !== 'safe'

  const handleScenario = (scenario: Scenario) => {
    setActiveScenario(scenario)
    api.runScenario(scenario).catch(() => void 0)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 flex flex-col gap-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface px-6 py-5"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_38%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_34%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-safe/20 bg-safe/10 px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-safe/90 uppercase">
              <Sparkles size={12} />
              Demo Mission Control
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">🎮 시뮬레이션 제어센터</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              작업자 이상, 가스 누출, 산소 저하 등 주요 위험 시나리오를 즉시 실행해 대시보드의 반응과 경보 흐름을 실시간으로 확인합니다.
            </p>
          </div>

          <div className="min-w-[220px] rounded-2xl border border-border/60 bg-bg-deep/70 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              <Activity size={12} />
              Live Status
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full ${isScenarioRunning ? 'bg-critical/50' : 'bg-safe/40'} animate-ping`} />
                <span className={`relative inline-flex h-3 w-3 rounded-full ${isScenarioRunning ? 'bg-critical' : 'bg-safe'}`} />
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-100">{activeScenarioMeta.title}</div>
                <div className="text-xs text-slate-500">{isScenarioRunning ? '위험 시나리오 활성화' : '기준 안전 상태 유지 중'}</div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {isScenarioRunning && (
                <motion.div
                  key={activeScenario}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-critical/30 bg-critical/10 px-3 py-1 text-xs font-medium text-critical"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-critical/60 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-critical" />
                  </span>
                  시나리오 실행 중...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
        className="rounded-2xl border border-border/50 bg-bg-deep/40 p-3"
      >
        <div className="mb-3 flex items-center justify-between px-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">시나리오 프리셋</h2>
            <p className="mt-1 text-xs text-slate-500">각 카드는 동일한 시뮬레이터 호출을 유지하며 데모 상태만 시각적으로 강조합니다.</p>
          </div>
          <div className="hidden text-[11px] uppercase tracking-[0.2em] text-slate-600 md:block">Operational Deck</div>
        </div>

        <div className="flex flex-col gap-3">
        {SCENARIOS.map((s) => {
          const cls = COLOR_CLASSES[s.color]
          const isActive = activeScenario === s.id
          return (
            <motion.button
              key={s.id}
              onClick={() => handleScenario(s.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05 }}
              className={`relative overflow-hidden w-full text-left bg-surface border rounded-xl p-5 flex items-center gap-5 transition-all cursor-pointer ${
                isActive
                  ? `${cls.activeBorder} ${cls.activeBg}`
                  : `${cls.border} ${cls.bg}`
              }`}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    key={`${s.id}-flash`}
                    initial={{ opacity: 0.45, scale: 0.96 }}
                    animate={{ opacity: [0.24, 0, 0.16], scale: [0.98, 1.02, 1] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className={`pointer-events-none absolute inset-0 ${cls.activeBg}`}
                  />
                )}
              </AnimatePresence>
              <span className={cls.text}>{s.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-100">{s.title}</span>
                  {isActive && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls.text} ${cls.activeBorder} ${cls.activeBg}`}>
                      ▶️ Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{s.description}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
      </motion.div>

      <div className="rounded-2xl border border-border/50 bg-surface/50 px-4 py-4">
        <button
          onClick={() => handleScenario('safe')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw size={13} />
          ⏹️ 안전 기준 상태로 재설정
        </button>
      </div>
    </div>
  )
}
