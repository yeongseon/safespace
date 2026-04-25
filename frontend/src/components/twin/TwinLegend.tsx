const LEVELS = [
  { color: '#22c55e', label: 'Safe' },
  { color: '#eab308', label: 'Caution' },
  { color: '#f97316', label: 'Warning' },
  { color: '#ef4444', label: 'Critical' },
]

export function TwinLegend() {
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1 bg-surface/80 backdrop-blur-sm border border-border/50 rounded-lg px-2.5 py-2 pointer-events-auto">
      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-medium mb-0.5">Risk Level</span>
      {LEVELS.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[10px] text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  )
}
