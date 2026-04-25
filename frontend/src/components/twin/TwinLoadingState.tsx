import { Loader2 } from 'lucide-react'

export function TwinLoadingState({ message = 'Loading digital twin…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-bg-deep gap-4">
      <Loader2 size={32} className="text-safe animate-spin" />
      <span className="text-sm text-slate-500">{message}</span>
    </div>
  )
}
