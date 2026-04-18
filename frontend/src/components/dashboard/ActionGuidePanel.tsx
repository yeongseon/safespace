import {
  CheckCircle,
  Wind,
  LogOut,
  StopCircle,
  UserX,
  Phone,
  AlertOctagon,
} from 'lucide-react'
import { useStore } from '@/app/store'

type ActionItem = { icon: React.ReactNode; text: string; urgent?: boolean }

const ACTIONS: Record<string, ActionItem[]> = {
  SAFE: [
    { icon: <CheckCircle size={13} />, text: '✅ All systems nominal' },
    { icon: <CheckCircle size={13} />, text: '✅ Continue normal operations' },
  ],
  CAUTION: [
    { icon: <Wind size={13} />, text: '🌬️ Monitor ventilation levels' },
    { icon: <CheckCircle size={13} />, text: '🔎 Increase check frequency' },
  ],
  WARNING: [
    { icon: <Wind size={13} />, text: '🌬️ Check ventilation immediately', urgent: true },
    { icon: <LogOut size={13} />, text: '🚪 Prepare for evacuation' },
    { icon: <Phone size={13} />, text: '📞 Alert supervisor' },
  ],
  CRITICAL: [
    { icon: <StopCircle size={13} />, text: '🛑 STOP ALL WORK', urgent: true },
    { icon: <LogOut size={13} />, text: '🚨 EVACUATE AREA NOW', urgent: true },
    { icon: <Wind size={13} />, text: '🌬️ Activate emergency ventilation', urgent: true },
    { icon: <UserX size={13} />, text: '⛔ Do NOT enter alone' },
    { icon: <Phone size={13} />, text: '📞 Contact supervisor immediately' },
    { icon: <AlertOctagon size={13} />, text: '📘 Follow emergency protocol' },
  ],
}

export function ActionGuidePanel() {
  const overallStatus = useStore((s) => s.overallStatus)
  const actions = ACTIONS[overallStatus] ?? ACTIONS.SAFE
  const isCritical = overallStatus === 'CRITICAL'

  return (
    <div className={`bg-surface border rounded-xl p-4 ${isCritical ? 'border-critical/40' : 'border-border/50'}`}>
      <span className="text-xs text-slate-500 uppercase tracking-widest font-medium block mb-3">🚨 Action Guide</span>
      <div className="flex flex-col gap-1.5">
        {actions.map((action, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
              action.urgent
                ? isCritical
                  ? 'bg-critical/10 border border-critical/30 text-critical font-semibold'
                  : 'bg-warning/10 border border-warning/30 text-warning font-medium'
                : 'text-slate-400'
            }`}
          >
            <span className={action.urgent ? '' : 'text-slate-600'}>{action.icon}</span>
            {action.text}
          </div>
        ))}
      </div>
    </div>
  )
}
