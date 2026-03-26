import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'

export default function StaffList() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [staff, setStaff] = useState([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch('/api/staff')
        const list = Array.isArray(data?.staff) ? data.staff : []
        if (!cancelled) setStaff(list)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load staff')
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Staff List</h1>
        <p className="text-sm text-muted-foreground">Live data from backend staff API.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left font-bold text-slate-500">Name</th>
              <th className="px-5 py-3 text-left font-bold text-slate-500">Role</th>
              <th className="px-5 py-3 text-left font-bold text-slate-500">Email</th>
              <th className="px-5 py-3 text-left font-bold text-slate-500">Phone</th>
              <th className="px-5 py-3 text-right font-bold text-slate-500">Salary</th>
              <th className="px-5 py-3 text-center font-bold text-slate-500">Status</th>
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
              staff.map((s) => {
                const active = (s.status || 'active') === 'active'
                return (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-5 py-3 text-slate-600">{s.role}</td>
                    <td className="px-5 py-3 text-slate-600">{s.email || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{s.phone || '—'}</td>
                    <td className="px-5 py-3 text-right font-mono text-slate-800">
                      ₹{Number(s.salary || 0).toFixed(0)}
                    </td>
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
                  </tr>
                )
              })}
            {!loading && staff.length === 0 && (
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
