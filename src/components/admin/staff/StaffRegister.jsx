import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { Select } from '../../ui/select'
import { Button } from '../../ui/button'
import AdminNotice from '../components/AdminNotice'
import { adminCard } from '../components/adminUi'

const JOB_TITLES = [
  'Chef',
  'Kitchen',
  'Receptionist',
  'Manager',
  'Server',
  'Cashier',
  'Housekeeping',
  'Security',
  'Employee',
]

const inputClass = 'h-8 text-xs border-neutral-200'

const emptyForm = () => ({
  name: '',
  role: 'Chef',
  email: '',
  phone: '',
  salary: '',
})

export default function StaffRegister() {
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setNotice('Full name is required.')
      return
    }
    setSaving(true)
    setNotice(null)
    try {
      await apiFetch('/api/staff', {
        method: 'POST',
        body: JSON.stringify({
          name,
          role: form.role,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          salary: Number(form.salary) || 0,
          status: 'active',
        }),
      })
      setForm(emptyForm())
      setNotice('Team member added. Grant app login under App access if needed.')
    } catch (err) {
      console.error('Failed to register staff', err)
      setNotice('Failed to save team member.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <AdminNotice message={notice} />

      <Card className={adminCard}>
        <CardContent className="p-3">
          <h2 className="text-xs font-semibold text-neutral-900 mb-2">Add team member</h2>
          <p className="text-[11px] text-neutral-500 mb-3">
            HR record for payroll and attendance. Job title is not app login — use{' '}
            <Link to="/admin/staff/access" className="underline text-neutral-700">
              App access
            </Link>{' '}
            for POS / kitchen sign-in.
          </p>

          <form
            onSubmit={onSubmit}
            className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            <Input
              placeholder="Full name *"
              className={inputClass}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              autoComplete="name"
              required
            />
            <Select
              className={inputClass}
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              aria-label="Job title"
            >
              {JOB_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </Select>
            <Input
              type="email"
              placeholder="Email (optional)"
              className={inputClass}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
            <Input
              type="tel"
              placeholder="Phone (optional)"
              className={inputClass}
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              autoComplete="tel"
            />
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="Salary / month (₹)"
              className={inputClass}
              value={form.salary}
              onChange={(e) => set('salary', e.target.value)}
            />

            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5 flex flex-wrap items-center gap-2 pt-1">
              <Button type="submit" size="sm" className="h-8 text-xs" disabled={saving}>
                {saving ? 'Saving…' : 'Save team member'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={saving}
                onClick={() => {
                  setForm(emptyForm())
                  setNotice(null)
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
