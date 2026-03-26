import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/inventory/suppliers')
        if (!cancelled) setSuppliers(Array.isArray(res.suppliers) ? res.suppliers : [])
      } catch (e) {
        console.error('Failed to load suppliers', e)
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
      <h1 className="text-lg font-semibold text-slate-900">Suppliers</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          {loading ? (
            <div className="text-sm text-slate-500">Loading suppliers...</div>
          ) : suppliers.length === 0 ? (
            <div className="text-sm text-slate-500">
              No suppliers found. Create supplier documents in Firestore collection
              <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">
                suppliers
              </code>
              .
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
                      Contact
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800 font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {s.email && <div>{s.email}</div>}
                        {s.phone && (
                          <div className="text-[11px] text-slate-400">{s.phone}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {s.category || 'General'}
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

