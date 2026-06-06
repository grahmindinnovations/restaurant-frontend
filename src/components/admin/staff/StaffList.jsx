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
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        HR directory only — job titles like Chef or Kitchen. Does not grant POS or kitchen login.
        Use <strong>App access</strong> tab to assign sign-in roles.
      </p>
      <Card className="bg-white border border-neutral-200 rounded-lg">
        <CardContent className="p-3">
          {loading ? (
            <div className="text-sm text-neutral-500">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="text-sm text-neutral-500">No staff members found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Role
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Contact
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-t border-neutral-100">
                      <td className="px-3 py-2 text-neutral-800 font-medium">
                        {member.name}
                      </td>
                      <td className="px-3 py-2 text-neutral-600">{member.role}</td>
                      <td className="px-3 py-2 text-neutral-600">
                        {member.email && <div>{member.email}</div>}
                        {member.phone && (
                          <div className="text-[11px] text-neutral-400">
                            {member.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            'inline-flex px-2 py-1 rounded-full text-[11px] font-semibold border',
                            (member.status || 'active') === 'active'
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200',
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

