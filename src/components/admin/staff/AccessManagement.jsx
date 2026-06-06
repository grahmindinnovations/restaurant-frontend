import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Select } from '../../ui/select'
import AdminNotice from '../components/AdminNotice'
import { adminCard } from '../components/adminUi'

const APP_ROLES = [
  { id: 'admin', label: 'Admin — dashboard, menu, staff' },
  { id: 'reception', label: 'Reception — POS, tables, billing, reports' },
  { id: 'kitchen', label: 'Kitchen — KOT queue' },
  { id: 'manager', label: 'Manager — inventory module' },
  { id: 'employee', label: 'Employee — HR self-service' },
]

const emptyForm = () => ({
  name: '',
  email: '',
  password: '',
  role: 'reception',
})

export default function AccessManagement() {
  const [users, setUsers] = useState([])
  const [roleSlots, setRoleSlots] = useState({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/admin/access-users')
      setUsers(Array.isArray(res.users) ? res.users : [])
      setRoleSlots(res.roleSlots && typeof res.roleSlots === 'object' ? res.roleSlots : {})
    } catch (e) {
      console.error('Failed to load access users', e)
      setNotice('Failed to load app access list.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createUser = async (e) => {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (!email || !form.password || form.password.length < 8) {
      setNotice('Email and password (min 8 chars) are required.')
      return
    }
    setSaving(true)
    setNotice(null)
    try {
      await apiFetch('/api/admin/access-users', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: form.password,
          name: form.name.trim() || email.split('@')[0],
          role: form.role,
        }),
      })
      setForm(emptyForm())
      setNotice(`Login created for ${email} (${form.role}). They can sign in now.`)
      await load()
    } catch (e) {
      console.error('Create access user failed', e)
      setNotice(e?.message?.includes('API') ? 'Failed to create login.' : String(e.message))
    } finally {
      setSaving(false)
    }
  }

  const setUserStatus = async (uid, status) => {
    setNotice(null)
    try {
      await apiFetch(`/api/admin/access-users/${uid}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await load()
      setNotice(status === 'disabled' ? 'User disabled.' : 'User re-enabled.')
    } catch (e) {
      console.error('Update user failed', e)
      setNotice('Failed to update user.')
    }
  }

  return (
    <div className="space-y-3">
      <AdminNotice message={notice} />

      <Card className={adminCard}>
        <CardContent className="p-3">
          <h2 className="text-xs font-semibold text-neutral-900 mb-2">Grant app login</h2>
          <p className="text-[11px] text-neutral-500 mb-3">
            Creates a Firebase login + assigns a system role. Example: give{' '}
            <span className="font-medium">arjunwitcher@gmail.com</span> the Kitchen role so they can
            open /kitchen.
          </p>
          <form onSubmit={createUser} className="grid gap-2 sm:grid-cols-2 max-w-2xl">
            <Input
              placeholder="Full name"
              className="h-8 text-xs"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="Email *"
              className="h-8 text-xs"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="Temp password (min 8) *"
              className="h-8 text-xs"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
            <Select
              className="h-8 text-xs"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              {APP_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" className="h-8 text-xs" disabled={saving}>
                {saving ? 'Creating…' : 'Create login & access'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className={adminCard}>
        <CardContent className="p-3">
          <h2 className="text-xs font-semibold text-neutral-900 mb-2">Users with app access</h2>
          {loading ? (
            <p className="text-xs text-neutral-500">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-neutral-500">No users in the access list yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">Email</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">App role</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">Status</th>
                    <th className="px-3 py-2 text-right font-semibold text-neutral-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : []
                    const rowKey = u.uid || u.email
                    return (
                      <tr key={rowKey} className="border-t border-neutral-100">
                        <td className="px-3 py-2 font-medium text-neutral-900">{u.name || '—'}</td>
                        <td className="px-3 py-2 text-neutral-600">{u.email}</td>
                        <td className="px-3 py-2 text-neutral-600 capitalize">
                          {roles.length > 0 ? roles.join(', ') : '—'}
                        </td>
                        <td className="px-3 py-2 capitalize">{u.status || 'active'}</td>
                        <td className="px-3 py-2 text-right">
                          {u.uid ? (
                            u.status === 'disabled' ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px]"
                                onClick={() => setUserStatus(u.uid, 'active')}
                              >
                                Enable
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px]"
                                onClick={() => setUserStatus(u.uid, 'disabled')}
                              >
                                Disable
                              </Button>
                            )
                          ) : (
                            <span className="text-[10px] text-neutral-400">Role slot only</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(roleSlots).length > 0 && (
        <p className="text-[10px] text-neutral-400">
          Includes demo users from Firebase Auth and roles/* allowlist (seed:auth).
        </p>
      )}
    </div>
  )
}
