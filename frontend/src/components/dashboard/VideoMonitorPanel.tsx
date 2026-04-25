import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Activity } from 'lucide-react'
import { useCurrentZoneWorker } from '@/app/store'

export function VideoMonitorPanel() {
  const workerState = useCurrentZoneWorker()
  const isFall = workerState?.worker_status === 'fall_suspected'

  return (
    <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Camera size={13} className="text-slate-500" />
          <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Camera Feed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse" />
          <span className="text-xs text-critical font-medium">LIVE</span>
        </div>
      </div>

      <div className="relative aspect-video bg-bg-deep overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 31px)',
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-slate-700 text-xs">No feed — simulation mode</div>
        </div>

        {workerState && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="bg-black/60 backdrop-blur-sm border border-border/50 rounded px-2.5 py-1 flex items-center gap-2">
              <Activity size={10} className={isFall ? 'text-critical' : 'text-safe'} />
              <span className={`text-xs font-medium ${isFall ? 'text-critical' : 'text-safe'}`}>
                {isFall ? 'FALL DETECTED' : workerState.worker_status === 'inactive' ? 'No Motion' : 'Worker Active'}
              </span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm border border-border/50 rounded px-2.5 py-1">
               <span className="text-xs text-slate-400">{Math.round(workerState.confidence * 100)}% conf.</span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isFall && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-critical"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
