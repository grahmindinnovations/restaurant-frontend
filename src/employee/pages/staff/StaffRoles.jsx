import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../../services/api'

export default function StaffRoles() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [staff, setStaff] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])

  const [query, setQuery] = useState('')
  const [pendingRoleByStaffId, setPendingRoleByStaffId] = useState({})
  const [savingId, setSavingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [staffRes, rolesRes] = await Promise.all([apiFetch('/api/staff'), apiFetch('/api/staff/roles')])
      const staffList = Array.isArray(staffRes?.staff) ? staffRes.staff : []
      const roleDefs = Array.isArray(rolesRes?.roles) ? rolesRes.roles : []
      const roleNames = roleDefs
        .map((r) => String(r?.name || '').trim())
        .filter(Boolean)

      const defaults = ['Employee', 'Waiter', 'Chef', 'Cashier', 'Reception', 'Manager', 'Kitchen']
      const merged = Array.from(new Set([...roleNames, ...defaults])).sort((a, b) => a.localeCompare(b))

      setStaff(staffList)
      setAvailableRoles(merged)
      setPendingRoleByStaffId({})
    } catch (e) {
      setError(e?.message || 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredStaff = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    if (!q) return staff
    return staff.filter((s) => {
      const name = String(s?.name || '').toLowerCase()
      const email = String(s?.email || '').toLowerCase()
      const phone = String(s?.phone || '').toLowerCase()
      const role = String(s?.role || '').toLowerCase()
      return name.includes(q) || email.includes(q) || phone.includes(q) || role.includes(q)
    })
  }, [query, staff])

  const getDisplayedRole = (s) => {
    const id = String(s?.id || '')
    if (pendingRoleByStaffId[id] !== undefined) return pendingRoleByStaffId[id]
    return String(s?.role || 'Employee')
  }

  const changeRole = (staffId, nextRole) => {
    setPendingRoleByStaffId((prev) => ({
      ...prev,
      [staffId]: nextRole,
    }))
  }

  const saveOne = async (staffId) => {
    const nextRole = pendingRoleByStaffId[staffId]
    if (nextRole === undefined) return
    setSavingId(staffId)
    setError(null)
    try {
      await apiFetch(`/api/staff/${encodeURIComponent(staffId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      })
      setStaff((prev) =>
        prev.map((s) => (String(s.id) === String(staffId) ? { ...s, role: nextRole } : s))
      )
      setPendingRoleByStaffId((prev) => {
        const copy = { ...prev }
        delete copy[staffId]
        return copy
      })
    } catch (e) {
      setError(e?.message || 'Failed to update role')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assign Staff Roles</h1>
          <p className="text-sm text-muted-foreground">Pick a role for each staff member.</p>
        </div>
        <button type="button" onClick={load} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border bg-white shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Staff</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role, email, phone..."
            className="h-10 w-full md:w-80 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left font-bold text-slate-500">Name</th>
              <th className="px-5 py-3 text-left font-bold text-slate-500">Role</th>
              <th className="px-5 py-3 text-left font-bold text-slate-500">Email</th>
              <th className="px-5 py-3 text-left font-bold text-slate-500">Phone</th>
              <th className="px-5 py-3 text-center font-bold text-slate-500">Status</th>
              <th className="px-5 py-3 text-right font-bold text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              filteredStaff.map((s) => {
                const id = String(s.id)
                const active = (s.status || 'active') === 'active'
                const currentRole = getDisplayedRole(s)
                const dirty = pendingRoleByStaffId[id] !== undefined && pendingRoleByStaffId[id] !== String(s.role || 'Employee')
                return (
                  <tr key={id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-5 py-3">
                      <select
                        value={currentRole}
                        onChange={(e) => changeRole(id, e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                      >
                        {availableRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {dirty && <div className="text-xs text-rose-600 font-semibold mt-1">Not saved</div>}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.email || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{s.phone || '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={
                          active
                            ? 'inline-flex px-2 py-1 rounded-full border text-xs font-bold bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'inline-flex px-2 py-1 rounded-full border text-xs font-bold bg-slate-100 text-slate-600 border-slate-200'
                        }
                      >
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => saveOne(id)}
                        disabled={!dirty || savingId === id}
                        className="rounded-xl bg-rose-600 text-white px-4 py-2 text-xs font-semibold hover:bg-rose-700 disabled:opacity-60"
                      >
                        {savingId === id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            {!loading && filteredStaff.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No staff found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
