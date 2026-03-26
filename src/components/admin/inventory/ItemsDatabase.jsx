import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function ItemsDatabase() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/inventory/items')
        if (!cancelled) setItems(Array.isArray(res.items) ? res.items : [])
      } catch (e) {
        console.error('Failed to load items', e)
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
      <h1 className="text-lg font-semibold text-slate-900">Items Database</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          {loading ? (
            <div className="text-sm text-slate-500">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-slate-500">
              No items found. Manage menu items via existing modules.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Category
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      Price
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      Daily Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800 font-medium">{i.name}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {i.category || 'General'}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-900 font-semibold">
                        ₹{Number(i.price || 0).toFixed(0)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {Number(i.daily_quantity || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

