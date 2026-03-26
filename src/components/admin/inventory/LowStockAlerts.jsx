import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function LowStockAlerts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/inventory/low-stock')
        if (!cancelled) setItems(Array.isArray(res.items) ? res.items : [])
      } catch (e) {
        console.error('Failed to load low stock items', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4 space-y-3">
          {loading ? (
            <div className="text-sm text-slate-500">Checking inventory...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-emerald-600">
              All items are above the low stock threshold.
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                {items.length} menu items are below the configured low stock
                threshold.
              </p>
              <ul className="space-y-1 text-xs">
                {items.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 border border-amber-100"
                  >
                    <span className="font-semibold text-amber-900">
                      {i.name || i.id}
                    </span>
                    <span className="text-[11px] text-amber-800">
                      {i.daily_quantity} remaining
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

