import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function StaffPayroll() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/staff/payroll')
        if (!cancelled) setRecords(Array.isArray(res.records) ? res.records : [])
      } catch (e) {
        console.error('Failed to load payroll', e)
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
      <h1 className="text-sm font-semibold text-neutral-900">Staff Payroll</h1>
      <Card className="bg-white border border-neutral-200 rounded-lg">
        <CardContent className="p-3">
          {loading ? (
            <div className="text-sm text-neutral-500">Loading payroll...</div>
          ) : records.length === 0 ? (
            <div className="text-sm text-neutral-500">
              No payroll records. Configure payroll data in Firestore collection
              <code className="ml-1 px-1.5 py-0.5 bg-neutral-100 rounded text-[11px]">
                staff_payroll
              </code>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Month
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Staff
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-neutral-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-t border-neutral-100">
                      <td className="px-3 py-2 text-neutral-700">{r.month || r.id}</td>
                      <td className="px-3 py-2 text-neutral-600">{r.staffName || r.staffId}</td>
                      <td className="px-3 py-2 text-right text-neutral-900 font-semibold">
                        ₹{Number(r.amount || 0).toFixed(0)}
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

