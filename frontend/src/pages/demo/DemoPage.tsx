import { motion } from 'framer-motion'
import {
  Shield,
  Wind,
  Flame,
  UserX,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { useStore } from '@/app/store'
import { api } from '@/lib/simulator'
import type { Scenario } from '@/features/types'

const SCENARIOS: {
  id: Scenario
  icon: React.ReactNode
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

  const handleScenario = (scenario: Scenario) => {
    setActiveScenario(scenario)
    api.runScenario(scenario).catch(() => void 0)
  }

  return (
    <div className="max-w-3xl mx-auto py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">🎮 Simulation Control</h1>
        <p className="text-sm text-slate-500 mt-1">▶️ Trigger predefined scenarios to demonstrate SafeSpace monitoring capabilities.</p>
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
              className={`w-full text-left bg-surface border rounded-xl p-5 flex items-center gap-5 transition-all cursor-pointer ${
                isActive
                  ? `${cls.activeBorder} ${cls.activeBg}`
                  : `${cls.border} ${cls.bg}`
              }`}
            >
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

      <div className="border-t border-border/50 pt-4">
        <button
          onClick={() => handleScenario('safe')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw size={13} />
          ⏹️ Reset to Safe Baseline
        </button>
      </div>
    </div>
  )
}
