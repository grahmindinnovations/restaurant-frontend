import { useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'

export default function StaffRegister() {
  const [form, setForm] = useState({
    name: '',
    role: 'Employee',
    email: '',
    phone: '',
    salary: '',
  })
  const [saving, setSaving] = useState(false)

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await apiFetch('/api/staff', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role.trim() || 'Employee',
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          salary: Number(form.salary) || 0,
          status: 'active',
        }),
      })
      setForm({
        name: '',
        role: 'Employee',
        email: '',
        phone: '',
        salary: '',
      })
      alert('Staff member created.')
    } catch (e) {
      console.error('Failed to register staff', e)
      alert('Failed to create staff member.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Staff Register</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl">
        <CardContent className="p-4 space-y-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
            />
            <Input
              placeholder="Role (e.g. Manager)"
              value={form.role}
              onChange={(e) => onChange('role', e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email (optional)"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
            />
            <Input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
            />
            <Input
              placeholder="Salary (monthly)"
              value={form.salary}
              onChange={(e) => onChange('salary', e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Create Staff'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

