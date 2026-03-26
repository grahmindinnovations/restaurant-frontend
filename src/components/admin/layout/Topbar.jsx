import { useEffect, useState } from 'react'
import { Bell, CalendarDays, Clock } from 'lucide-react'

export default function Topbar({ adminUser }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const name =
    adminUser?.profile?.name ||
    adminUser?.firebase?.displayName ||
    adminUser?.profile?.email ||
    adminUser?.firebase?.email ||
    'Admin'

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
          Admin Dashboard
        </div>
        <div className="text-sm font-semibold text-slate-900">
          Welcome back, <span className="text-rose-700">{name}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          <span>{now.toLocaleDateString()}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <button className="relative p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 border border-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-rose-600/10 text-rose-700 flex items-center justify-center text-xs font-semibold">
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}

