import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import AdminNotice from '../components/AdminNotice'
import { adminCard, adminMuted } from '../components/adminUi'
import { cn } from '../../../lib/utils'

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'billing', label: 'Billing & receipts' },
  { id: 'operations', label: 'Operations' },
]

const inputClass = 'h-8 text-xs border-neutral-200'
const selectClass = 'flex h-8 w-full rounded-lg border border-neutral-200 bg-white px-3 text-xs'

const emptyForm = {
  restaurantName: '',
  tagline: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  gstin: '',
  currency: 'INR',
  gstPercent: 5,
  gstEnabled: true,
  serviceChargeEnabled: true,
  serviceChargeAmount: 150,
  serviceChargeDineInOnly: true,
  lowStockThreshold: 20,
  receiptFooter: 'Thank you. Visit again!',
  showGstOnReceipt: true,
  kitchenStatus: 'online',
  openingTime: '10:00',
  closingTime: '23:00',
}

function Field({ label, hint, children, className }) {
  return (
    <label className={cn('space-y-1 block min-w-0', className)}>
      <span className="text-[11px] font-medium text-neutral-600">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-neutral-400 block leading-tight">{hint}</span>}
    </label>
  )
}

function Toggle({ label, checked, onChange, className }) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 cursor-pointer min-w-0',
        className,
      )}
    >
      <span className="text-[11px] font-medium text-neutral-800 truncate">{label}</span>
      <input
        type="checkbox"
        className="h-3.5 w-3.5 rounded border-neutral-300 accent-neutral-900 shrink-0"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

function ReceiptPreview({ form }) {
  const address = [form.address, form.city].filter(Boolean).join(', ')
  const sub = 420
  const service = form.serviceChargeEnabled ? Number(form.serviceChargeAmount) || 0 : 0
  const gstRate = form.gstEnabled ? (Number(form.gstPercent) || 0) / 100 : 0
  const gst = Math.round((sub + service) * gstRate)
  const total = sub + service + gst

  return (
    <Card className={cn(adminCard, 'bg-neutral-50 h-full')}>
      <CardContent className="p-3 font-mono text-[10px] text-neutral-800 space-y-0.5">
        <p className="text-center font-bold text-xs text-neutral-900">
          {form.restaurantName || 'Restaurant name'}
        </p>
        {form.tagline && <p className="text-center text-neutral-500">{form.tagline}</p>}
        {address && <p className="text-center text-neutral-500">{address}</p>}
        {form.phone && <p className="text-center text-neutral-500">{form.phone}</p>}
        {form.gstin && <p className="text-center text-neutral-500">GSTIN: {form.gstin}</p>}
        <div className="border-t border-dashed border-neutral-300 my-1.5" />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{sub}</span>
        </div>
        {service > 0 && (
          <div className="flex justify-between">
            <span>Service</span>
            <span>₹{service}</span>
          </div>
        )}
        {form.showGstOnReceipt && gst > 0 && (
          <div className="flex justify-between">
            <span>GST ({form.gstPercent}%)</span>
            <span>₹{gst}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-neutral-900">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        <div className="border-t border-dashed border-neutral-300 my-1.5" />
        <p className="text-center text-neutral-500">{form.receiptFooter}</p>
      </CardContent>
    </Card>
  )
}

function formatWhen(iso) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return null
  }
}

export default function Settings() {
  const [tab, setTab] = useState('general')
  const [form, setForm] = useState(emptyForm)
  const [savedForm, setSavedForm] = useState(emptyForm)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await apiFetch('/api/admin/settings')
        if (cancelled) return
        const s = res?.settings || {}
        const k = res?.kitchen || {}
        const next = {
          restaurantName: s.restaurantName || '',
          tagline: s.tagline || '',
          phone: s.phone || '',
          email: s.email || '',
          address: s.address || '',
          city: s.city || '',
          gstin: s.gstin || '',
          currency: s.currency || 'INR',
          gstPercent: s.gstPercent ?? 5,
          gstEnabled: s.gstEnabled !== false,
          serviceChargeEnabled: s.serviceChargeEnabled !== false,
          serviceChargeAmount: s.serviceChargeAmount ?? 150,
          serviceChargeDineInOnly: s.serviceChargeDineInOnly !== false,
          lowStockThreshold: s.lowStockThreshold ?? 20,
          receiptFooter: s.receiptFooter || 'Thank you. Visit again!',
          showGstOnReceipt: s.showGstOnReceipt !== false,
          kitchenStatus: k.status || 'online',
          openingTime: k.opening_time || '10:00',
          closingTime: k.closing_time || '23:00',
        }
        setForm(next)
        setSavedForm(next)
        setUpdatedAt(res.updatedAt || null)
      } catch (e) {
        console.error('Settings load failed', e)
        if (!cancelled) setNotice({ variant: 'error', message: 'Failed to load settings.' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedForm), [form, savedForm])
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    setNotice(null)
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          restaurantName: form.restaurantName,
          tagline: form.tagline,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          gstin: form.gstin,
          currency: form.currency,
          gstPercent: Number(form.gstPercent),
          gstEnabled: form.gstEnabled,
          serviceChargeEnabled: form.serviceChargeEnabled,
          serviceChargeAmount: Number(form.serviceChargeAmount),
          serviceChargeDineInOnly: form.serviceChargeDineInOnly,
          lowStockThreshold: Number(form.lowStockThreshold),
          receiptFooter: form.receiptFooter,
          showGstOnReceipt: form.showGstOnReceipt,
          kitchen: {
            status: form.kitchenStatus,
            opening_time: form.openingTime,
            closing_time: form.closingTime,
          },
        }),
      })
      const s = res?.settings || {}
      const k = res?.kitchen || {}
      const next = {
        ...form,
        restaurantName: s.restaurantName ?? form.restaurantName,
        gstPercent: s.gstPercent ?? form.gstPercent,
        lowStockThreshold: s.lowStockThreshold ?? form.lowStockThreshold,
        kitchenStatus: k.status || form.kitchenStatus,
        openingTime: k.opening_time || form.openingTime,
        closingTime: k.closing_time || form.closingTime,
      }
      setForm(next)
      setSavedForm(next)
      setUpdatedAt(res.updatedAt || new Date().toISOString())
      setNotice({
        variant: 'success',
        message: 'Settings saved. POS, receipts, and notifications updated.',
      })
    } catch (e) {
      console.error('Settings save failed', e)
      setNotice({ variant: 'error', message: 'Failed to save settings.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <h1 className="text-sm font-semibold text-neutral-900">Settings</h1>
        <p className={adminMuted}>Loading…</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-sm font-semibold text-neutral-900">Settings</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Restaurant profile, POS billing, receipts, and alerts.
            {updatedAt && (
              <span className="text-neutral-400"> · Last saved {formatWhen(updatedAt)}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dirty && (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
              Unsaved
            </span>
          )}
          <Button size="sm" className="h-8 text-xs" disabled={saving || !dirty} onClick={save}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>

      {notice && <AdminNotice message={notice.message} variant={notice.variant} />}

      <nav className="flex flex-wrap gap-1 border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800',
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'general' && (
        <Card className={adminCard}>
          <CardContent className="p-3">
            <h2 className="text-xs font-semibold text-neutral-900 mb-1">Restaurant profile</h2>
            <p className="text-[11px] text-neutral-500 mb-3">
              Printed on bills from reception POS.
            </p>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              <Field label="Restaurant name" className="col-span-2 sm:col-span-2 lg:col-span-2">
                <Input
                  className={inputClass}
                  value={form.restaurantName}
                  onChange={(e) => update('restaurantName', e.target.value)}
                  placeholder="Spice Garden"
                />
              </Field>
              <Field label="Tagline" className="col-span-2 sm:col-span-2 lg:col-span-2">
                <Input
                  className={inputClass}
                  value={form.tagline}
                  onChange={(e) => update('tagline', e.target.value)}
                  placeholder="Fresh food, fast service"
                />
              </Field>
              <Field label="Phone">
                <Input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </Field>
              <Field label="City">
                <Input
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </Field>
              <Field label="Currency">
                <Input
                  className={inputClass}
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value)}
                />
              </Field>
              <Field label="Address" className="col-span-2 sm:col-span-3 lg:col-span-3">
                <Input
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
              </Field>
              <Field label="GSTIN" hint="On printed bills" className="col-span-2 sm:col-span-3">
                <Input
                  className={inputClass}
                  value={form.gstin}
                  onChange={(e) => update('gstin', e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'billing' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-3 items-start">
          <Card className={adminCard}>
            <CardContent className="p-3 space-y-3">
              <div>
                <h2 className="text-xs font-semibold text-neutral-900">Billing & receipts</h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Live on reception POS and printed bills.
                </p>
              </div>

              <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                <Toggle
                  label="Enable GST"
                  checked={form.gstEnabled}
                  onChange={(v) => update('gstEnabled', v)}
                />
                <Toggle
                  label="Service charge"
                  checked={form.serviceChargeEnabled}
                  onChange={(v) => update('serviceChargeEnabled', v)}
                />
                <Toggle
                  label="Dine-in only"
                  checked={form.serviceChargeDineInOnly}
                  onChange={(v) => update('serviceChargeDineInOnly', v)}
                />
                <Toggle
                  label="GST on receipt"
                  checked={form.showGstOnReceipt}
                  onChange={(v) => update('showGstOnReceipt', v)}
                />
              </div>

              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                <Field label="GST rate (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass}
                    value={form.gstPercent}
                    onChange={(e) => update('gstPercent', e.target.value)}
                    disabled={!form.gstEnabled}
                  />
                </Field>
                <Field label="Service charge (₹)">
                  <Input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.serviceChargeAmount}
                    onChange={(e) => update('serviceChargeAmount', e.target.value)}
                    disabled={!form.serviceChargeEnabled}
                  />
                </Field>
                <Field label="Receipt footer" className="col-span-2 sm:col-span-2 lg:col-span-3">
                  <Input
                    className={inputClass}
                    value={form.receiptFooter}
                    onChange={(e) => update('receiptFooter', e.target.value)}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-neutral-600">Receipt preview</p>
            <ReceiptPreview form={form} />
          </div>
        </div>
      )}

      {tab === 'operations' && (
        <Card className={adminCard}>
          <CardContent className="p-3">
            <h2 className="text-xs font-semibold text-neutral-900 mb-3">Operations</h2>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              <Field label="Low stock threshold" hint="Notifications & inventory">
                <Input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.lowStockThreshold}
                  onChange={(e) => update('lowStockThreshold', e.target.value)}
                />
              </Field>
              <Field label="Kitchen status">
                <select
                  className={selectClass}
                  value={form.kitchenStatus}
                  onChange={(e) => update('kitchenStatus', e.target.value)}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </Field>
              <Field label="Opens">
                <Input
                  type="time"
                  className={inputClass}
                  value={form.openingTime}
                  onChange={(e) => update('openingTime', e.target.value)}
                />
              </Field>
              <Field label="Closes">
                <Input
                  type="time"
                  className={inputClass}
                  value={form.closingTime}
                  onChange={(e) => update('closingTime', e.target.value)}
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-neutral-400">
        Applies to: POS billing · printed receipts · notifications · low stock inventory
      </p>
    </div>
  )
}
