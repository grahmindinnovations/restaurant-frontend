import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'
import { apiFetch } from '../../../services/api'
import { adminCard } from '../components/adminUi'

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
    <aside className="w-full">
      <Card className={adminCard}>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-900">Alerts</h2>
          </div>
          <p className="text-xs text-neutral-500">Low stock, staff, and payment issues.</p>

          {loading ? (
            <p className="text-xs text-neutral-500">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-neutral-400">No alerts right now.</p>
          ) : (
            <ul className="space-y-1.5 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs"
                >
                  <div className="font-medium text-neutral-900">{n.title}</div>
                  {n.message && <div className="text-neutral-600 mt-0.5">{n.message}</div>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}
