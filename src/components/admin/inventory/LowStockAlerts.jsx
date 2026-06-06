import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function LowStockAlerts() {
  const [items, setItems] = useState([])
  const [threshold, setThreshold] = useState(20)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/inventory/low-stock')
        if (!cancelled) {
          setItems(Array.isArray(res.items) ? res.items : [])
          setThreshold(res.lowThreshold ?? 20)
        }
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
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        Items with daily quantity below {threshold} (from Admin Settings). Edit quantities on the Menu items tab.
      </p>
      <Card className="bg-white border border-neutral-200 rounded-lg">
        <CardContent className="p-4 space-y-3">
          {loading ? (
            <div className="text-sm text-neutral-500">Checking inventory...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-neutral-900">
              All items are above the low stock threshold.
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-600">
                {items.length} menu items are below the configured low stock
                threshold.
              </p>
              <ul className="space-y-1 text-xs">
                {items.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between px-3 py-2 rounded-md border border-neutral-200 bg-neutral-50"
                  >
                    <span className="font-medium text-neutral-900">
                      {i.name || i.id}
                    </span>
                    <span className="text-[11px] text-neutral-600 tabular-nums">
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

