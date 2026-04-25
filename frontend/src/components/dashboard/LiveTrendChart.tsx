import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useCurrentZoneHistory } from '@/app/store'
import { formatTime } from '@/lib/utils'

export function LiveTrendChart() {
  const sensorHistory = useCurrentZoneHistory()
  const data = sensorHistory.slice(-60).map((d) => ({
    time: formatTime(d.timestamp),
    oxygen: d.oxygen,
    h2s: d.h2s,
    co: d.co,
    voc: d.voc,
  }))

  return (
    <div className="bg-surface border border-border/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Sensor Trend</span>
        <span className="text-xs text-slate-600">Last 60 readings</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            domain={[15, 23]}
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 'auto']}
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: 11,
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 10, color: '#64748b' }}
          />
          <ReferenceLine yAxisId="left" y={19.5} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} />
          <ReferenceLine yAxisId="left" y={18.0} stroke="#f97316" strokeDasharray="4 2" strokeWidth={1} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="oxygen"
            name="O₂"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="h2s"
            name="H₂S"
            stroke="#f97316"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="co"
            name="CO"
            stroke="#ef4444"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="voc"
            name="VOC"
            stroke="#eab308"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
