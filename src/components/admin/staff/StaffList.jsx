import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function StaffList() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await apiFetch('/api/staff')
        if (!cancelled) {
          setStaff(Array.isArray(data.staff) ? data.staff : [])
        }
      } catch (e) {
        console.error('Failed to load staff list', e)
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
      <h1 className="text-lg font-semibold text-slate-900">Staff List</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          {loading ? (
            <div className="text-sm text-slate-500">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="text-sm text-slate-500">No staff members found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Role
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Contact
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800 font-medium">
                        {member.name}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{member.role}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {member.email && <div>{member.email}</div>}
                        {member.phone && (
                          <div className="text-[11px] text-slate-400">
                            {member.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            'inline-flex px-2 py-1 rounded-full text-[11px] font-semibold border',
                            (member.status || 'active') === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200',
                          ].join(' ')}
                        >
                          {(member.status || 'active')
                            .charAt(0)
                            .toUpperCase() + (member.status || 'active').slice(1)}
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

