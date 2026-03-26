import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'
import { apiFetch } from '../../../services/api'

const iconBySeverity = {
  info: Bell,
  warning: AlertTriangle,
  critical: XCircle,
}

const colorBySeverity = {
  info: 'text-sky-600 bg-sky-50 border-sky-100',
  warning: 'text-amber-700 bg-amber-50 border-amber-100',
  critical: 'text-rose-700 bg-rose-50 border-rose-100',
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/admin/notifications')
        if (!cancelled) setNotifications(res.notifications || [])
      } catch (e) {
        console.error('Failed to load notifications', e)
        if (!cancelled) setNotifications([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <aside className="w-full xl:w-80 xl:ml-4">
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Notification Center</h2>
              <p className="text-[11px] text-slate-500">
                Live alerts for low stock, staff and payments.
              </p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>

          {loading ? (
            <div className="text-xs text-slate-500">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="text-xs text-slate-400">No alerts at the moment.</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {notifications.map((n) => {
                const Icon = iconBySeverity[n.severity] || Bell
                const color = colorBySeverity[n.severity] || colorBySeverity.info
                return (
                  <div
                    key={n.id}
                    className={[
                      'flex items-start gap-2 rounded-xl px-3 py-2 border text-xs',
                      color,
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold">{n.title}</div>
                      <div className="text-[11px] opacity-90">{n.message}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}

