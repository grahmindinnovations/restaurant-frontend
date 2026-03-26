import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'

export default function StaffRoles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/staff/roles')
        if (!cancelled) setRoles(Array.isArray(res.roles) ? res.roles : [])
      } catch (e) {
        console.error('Failed to load staff roles', e)
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
      <h1 className="text-lg font-semibold text-slate-900">Staff Roles</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl">
        <CardContent className="p-4 space-y-2">
          {loading ? (
            <div className="text-sm text-slate-500">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-sm text-slate-500">
              No staff roles configured. Manage roles in Firestore collection
              <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">
                staff_roles
              </code>
              .
            </div>
          ) : (
            <ul className="space-y-1">
              {roles.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-800">
                    {r.name || r.id}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {(r.permissions && r.permissions.length) || 0} permissions
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

