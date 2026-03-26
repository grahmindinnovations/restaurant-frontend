import { useEffect, useState } from 'react'
import Sidebar from '../../reception/ReceptionSidebar'
import Header from '../../layouts/Header'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { apiFetch } from '../../services/api'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    role: 'Waiter',
    email: '',
    phone: '',
    salary: '',
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await apiFetch('/api/staff')
        if (!cancelled) {
          setStaff(Array.isArray(data.staff) ? data.staff : [])
        }
      } catch (e) {
        console.error('Failed to load staff:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const onChangeForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addStaff = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('Name is required')
      return
    }
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim() || 'Employee',
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        status: 'active',
        salary: Number(form.salary) || 0,
      }
      const res = await apiFetch('/api/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setStaff(prev => [...prev, { id: res.id, ...payload }])
      setForm({
        name: '',
        role: 'Waiter',
        email: '',
        phone: '',
        salary: '',
      })
    } catch (e) {
      console.error('Failed to create staff:', e)
      alert('Failed to create staff member.')
    }
  }

  const updateStaff = async (id, patch) => {
    setSavingId(id)
    try {
      await apiFetch(`/api/staff/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      setStaff(prev =>
        prev.map(s => (s.id === id ? { ...s, ...patch } : s))
      )
    } catch (e) {
      console.error('Failed to update staff:', e)
      alert('Failed to update staff member.')
    } finally {
      setSavingId(null)
    }
  }

  const changeStatus = (member) => {
    const next = member.status === 'active' ? 'inactive' : 'active'
    updateStaff(member.id, { status: next })
  }

  const changeSalary = (member) => {
    const input = prompt('Enter new salary:', String(member.salary || 0))
    if (input == null) return
    const value = Number(input)
    if (!Number.isFinite(value) || value < 0) {
      alert('Please enter a valid non-negative number.')
      return
    }
    updateStaff(member.id, { salary: value })
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr] bg-slate-50">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Header
          title={<span>Staff <span className="text-rose-700">Management</span></span>}
        />

        <main className="p-6 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Add Staff Member</h2>
            <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" onSubmit={addStaff}>
              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={e => onChangeForm('name', e.target.value)}
              />
              <Input
                placeholder="Role (e.g. Waiter)"
                value={form.role}
                onChange={e => onChangeForm('role', e.target.value)}
              />
              <Input
                placeholder="Email (optional)"
                type="email"
                value={form.email}
                onChange={e => onChangeForm('email', e.target.value)}
              />
              <Input
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={e => onChangeForm('phone', e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Salary"
                  value={form.salary}
                  onChange={e => onChangeForm('salary', e.target.value)}
                  className="w-full"
                />
                <Button type="submit" variant="primary">
                  Add
                </Button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Team Members</h2>
              <p className="text-xs text-slate-500">
                Total: {staff.length}
              </p>
            </div>

            {loading ? (
              <div className="text-slate-500 text-sm">Loading staff...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-500">Name</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-500">Role</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-500">Contact</th>
                      <th className="px-4 py-2 text-right font-semibold text-slate-500">Salary</th>
                      <th className="px-4 py-2 text-center font-semibold text-slate-500">Status</th>
                      <th className="px-4 py-2 text-right font-semibold text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(member => {
                      const active = (member.status || 'active') === 'active'
                      const statusClass = active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                      return (
                        <tr key={member.id} className="border-t border-slate-100">
                          <td className="px-4 py-2 font-medium text-slate-800">{member.name}</td>
                          <td className="px-4 py-2 text-slate-500">{member.role}</td>
                          <td className="px-4 py-2 text-slate-500">
                            {member.email && <div>{member.email}</div>}
                            {member.phone && <div className="text-xs text-slate-400">{member.phone}</div>}
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            ₹{Number(member.salary || 0).toFixed(0)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${statusClass}`}>
                              {active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={savingId === member.id}
                              onClick={() => changeStatus(member)}
                            >
                              {savingId === member.id ? 'Saving...' : active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={savingId === member.id}
                              onClick={() => changeSalary(member)}
                            >
                              Edit Salary
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                    {staff.length === 0 && !loading && (
                      <tr>
                        <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                          No staff members yet. Use the form above to add someone.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

