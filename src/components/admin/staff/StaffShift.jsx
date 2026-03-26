import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function StaffShift() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/staff/shifts')
        if (!cancelled) setShifts(Array.isArray(res.shifts) ? res.shifts : [])
      } catch (e) {
        console.error('Failed to load shifts', e)
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
      <h1 className="text-lg font-semibold text-slate-900">Staff Shift Management</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          {loading ? (
            <div className="text-sm text-slate-500">Loading shifts...</div>
          ) : shifts.length === 0 ? (
            <div className="text-sm text-slate-500">
              No shift schedules configured. Manage shifts in Firestore collection
              <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">
                staff_shifts
              </code>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Staff
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Shift
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">
                        {s.staffName || s.staffId}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {s.shiftName || s.type || 'Shift'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {s.startTime || ''} - {s.endTime || ''}
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

