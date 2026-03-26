import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, Clock } from 'lucide-react'

const titleMap = [
  ['/employee/dashboard', 'Dashboard'],
  ['/employee/staff/list', 'Staff List'],
  ['/employee/staff/add', 'Staff Registry'],
  ['/employee/staff/attendance', 'Staff Attendance'],
  ['/employee/staff/payroll', 'Staff Payroll'],
  ['/employee/staff/roles', 'Staff Roles'],
  ['/employee/staff/shift', 'Staff Shift'],
]

export default function Topbar() {
  const location = useLocation()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const title = useMemo(() => {
    const hit = titleMap.find(([path]) => location.pathname === path || location.pathname.startsWith(`${path}/`))
    return hit ? hit[1] : 'Dashboard'
  }, [location.pathname])

  const dateText = now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })
  const timeText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div className="min-w-0">
        <div className="text-sm text-gray-400 font-semibold">
          <Link to="/" className="hover:text-gray-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Employee</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 truncate">{title}</h1>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700">
          <Calendar size={16} className="text-gray-400" />
          {dateText}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700">
          <Clock size={16} className="text-gray-400" />
          {timeText}
        </div>
      </div>
    </header>
  )
}
