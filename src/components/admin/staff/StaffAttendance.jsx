import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function StaffAttendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/staff/attendance')
        if (!cancelled) {
          setRecords(Array.isArray(res.records) ? res.records : [])
        }
      } catch (e) {
        console.error('Failed to load attendance', e)
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
      <h1 className="text-sm font-semibold text-neutral-900">Staff Attendance</h1>
      <Card className="bg-white border border-neutral-200 rounded-lg">
        <CardContent className="p-3">
          {loading ? (
            <div className="text-sm text-neutral-500">Loading attendance...</div>
          ) : records.length === 0 ? (
            <div className="text-sm text-neutral-500">
              No attendance records found. Configure attendance tracking via backend / Firestore.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Staff
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-t border-neutral-100">
                      <td className="px-3 py-2 text-neutral-700">
                        {r.date || r.day || r.id}
                      </td>
                      <td className="px-3 py-2 text-neutral-600">{r.staffName || r.staffId}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-2 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {r.status || 'present'}
                        </span>
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

