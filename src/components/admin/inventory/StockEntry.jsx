import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function StockEntry() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/inventory/stock-entries')
        if (!cancelled) setEntries(Array.isArray(res.entries) ? res.entries : [])
      } catch (e) {
        console.error('Failed to load stock entries', e)
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
      <h1 className="text-lg font-semibold text-slate-900">Stock Entry</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          {loading ? (
            <div className="text-sm text-slate-500">Loading stock entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-sm text-slate-500">
              No stock entries found. Record entries in Firestore collection
              <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">
                stock_entries
              </code>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Item
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Quantity
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Supplier
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800 font-medium">
                        {e.itemName || e.itemId}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {e.quantity || 0} {e.unit || ''}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {e.supplierName || e.supplierId || '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {e.createdAt || e.date || ''}
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

