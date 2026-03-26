import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, PackagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../ui/button'
import { apiFetch } from '../../services/api'

export default function StockAlerts() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch('/api/inventory/alerts')
        const raw = Array.isArray(res?.alerts) ? res.alerts : []
        const normalized = raw.map((a) => ({
          id: String(a.id),
          name: String(a.name || ''),
          remaining: Number(a.remaining) || 0,
          threshold: Number(a.threshold) || 0,
          category: String(a.category || ''),
        }))
        if (!cancelled) setAlerts(normalized)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load alerts')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function restock(id) {
    navigate(`/inventory/stock-entry?productId=${encodeURIComponent(id)}`)
  }

  function notifyAdmin(id) {
    setAlerts((prev) =>
      prev.map((x) => (x.id === id ? { ...x, notified: true } : x)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stock Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Low-stock items that need attention.
          </p>
        </div>
        <div className="rounded-xl border bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-900 shadow-sm">
          {loading ? 'Loading...' : `${alerts.length} low stock items`}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {alerts.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-amber-200 bg-amber-500/10 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{item.name}</div>
                <div className="mt-1 text-xs text-amber-900/80">
                  Remaining: <span className="font-semibold">{item.remaining}</span>{' '}
                  <span className="text-amber-900/60">•</span> Minimum:{' '}
                  <span className="font-semibold">{item.threshold}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-amber-500/15 p-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="rounded-xl bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => restock(item.id)}
              >
                <PackagePlus className="h-4 w-4" />
                Restock Now
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-amber-300 bg-white/60 hover:bg-white"
                onClick={() => notifyAdmin(item.id)}
                disabled={Boolean(item.notified)}
              >
                <Bell className="h-4 w-4" />
                {item.notified ? 'Admin Notified' : 'Notify Admin'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="mt-3 text-sm font-semibold">All caught up</div>
          <div className="mt-1 text-sm text-muted-foreground">
            No low-stock alerts right now.
          </div>
        </div>
      )}
    </div>
  )
}
