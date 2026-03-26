import { useState } from 'react'
import { apiFetch } from '../../../services/api'

export default function StaffAdd() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState({
    name: '',
    role: 'Employee',
    email: '',
    phone: '',
    salary: '',
  })

  const onChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const name = String(form.name || '').trim()
    if (!name) {
      setError('Name is required')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        name,
        role: String(form.role || '').trim() || 'Employee',
        email: String(form.email || '').trim() || null,
        phone: String(form.phone || '').trim() || null,
        status: 'active',
        salary: Number(form.salary) || 0,
      }
      await apiFetch('/api/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSuccess('Staff member added')
      setForm({
        name: '',
        role: 'Employee',
        email: '',
        phone: '',
        salary: '',
      })
      setTimeout(() => setSuccess(null), 2500)
    } catch (e2) {
      setError(e2?.message || 'Failed to add staff')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Staff Registry</h1>
        <p className="text-sm text-muted-foreground">Add a new staff member.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-700">Full Name</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              value={form.name}
              onChange={onChange('name')}
              placeholder="Enter name"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-700">Role</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              value={form.role}
              onChange={onChange('role')}
              placeholder="Employee"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-700">Email</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              value={form.email}
              onChange={onChange('email')}
              type="email"
              placeholder="Email (optional)"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-700">Phone</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              value={form.phone}
              onChange={onChange('phone')}
              placeholder="Phone (optional)"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-700">Salary</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              value={form.salary}
              onChange={onChange('salary')}
              placeholder="0"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
