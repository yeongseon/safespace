import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Play, Clock, Map, Boxes } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Boxes, label: 'Twin', to: '/twin' },
  { icon: Play, label: 'Demo', to: '/demo' },
  { icon: Clock, label: 'Events', to: '/events' },
  { icon: Map, label: 'Zones', to: '/zones' },
]

export function Sidebar() {
  return (
    <aside className="w-16 bg-bg-deep border-r border-border flex flex-col items-center py-4 gap-2 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-safe/20 border border-safe/40 flex items-center justify-center mb-4">
        <span className="text-safe text-xs font-bold">SS</span>
      </div>
      {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          title={label}
          aria-label={label}
          className={({ isActive }) =>
            cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative overflow-hidden',
              isActive
                ? 'bg-safe/15 text-safe border border-safe/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-surface',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-safe shadow-[0_0_16px_rgba(34,197,94,0.55)]"
                />
              )}
              <Icon size={18} />
              <span className="absolute left-full ml-2 px-2 py-1 bg-surface border border-border rounded text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
      <div className="mt-auto rounded-full border border-border/60 bg-surface px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
        v1.0
      </div>
    </aside>
  )
}
