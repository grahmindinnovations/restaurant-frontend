import { useEffect, useMemo, useState } from 'react'
import { CloudUpload, PackagePlus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { apiFetch } from '../../services/api'

function normalizeKey(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

function formatProductName(value) {
  const raw = String(value || '').trim().replace(/\s+/g, ' ')
  if (!raw) return ''

  const parts = raw.split(' ')
  const out = []
  for (const part of parts) {
    if (!part) continue

    if (/^[A-Z0-9]+$/.test(part) && part.length <= 4) {
      out.push(part)
      continue
    }

    const numUnit = part.match(/^(\d+)([a-zA-Z]+)$/)
    if (numUnit) {
      const num = numUnit[1]
      const unit = numUnit[2]
      const unitFixed =
        unit.length <= 2
          ? unit.toUpperCase()
          : unit.slice(0, 1).toUpperCase() + unit.slice(1).toLowerCase()
      out.push(`${num}${unitFixed}`)
      continue
    }

    out.push(part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
  }
  return out.join(' ')
}

function toDateValue(val) {
  if (!val) return null
  if (val instanceof Date) return Number.isNaN(val.getTime()) ? null : val
  if (typeof val === 'string') {
    const d = new Date(val)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      const d = val.toDate()
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null
    }
    const sec = val.seconds ?? val._seconds
    const ns = val.nanoseconds ?? val._nanoseconds ?? 0
    if (typeof sec === 'number' && Number.isFinite(sec)) {
      const ms = sec * 1000 + Math.floor(Number(ns || 0) / 1e6)
      const d = new Date(ms)
      return Number.isNaN(d.getTime()) ? null : d
    }
  }
  return null
}

export default function StockEntry() {
  const [searchParams] = useSearchParams()
  const initialProductId = searchParams.get('productId') || ''
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [productQuery, setProductQuery] = useState('')
  const [productOpen, setProductOpen] = useState(false)
  const [form, setForm] = useState({
    supplierId: '',
    productId: initialProductId,
    date: new Date().toISOString().slice(0, 10),
    quantity: '',
    purchasePrice: '',
    invoiceFile: null,
  })
  const [entries, setEntries] = useState([])

  const productNameById = useMemo(() => {
    const map = new Map()
    for (const p of products) {
      if (!p?.id) continue
      map.set(String(p.id), String(p.name || ''))
    }
    return map
  }, [products])

  useEffect(() => {
    const pid = searchParams.get('productId') || ''
    if (!pid) return
    setForm((prev) => ({ ...prev, productId: pid }))
  }, [searchParams])

  useEffect(() => {
    if (!products.length) return
    const selected = products.find((p) => String(p.id) === String(form.productId))
    if (!selected) return
    setProductQuery((q) => (q ? q : selected.name))
  }, [products, form.productId])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [supRes, prodRes, entriesRes] = await Promise.all([
          apiFetch('/api/inventory/suppliers'),
          apiFetch('/api/inventory/products'),
          apiFetch('/api/inventory/stock-entries?limit=50'),
        ])

        const supRaw = Array.isArray(supRes?.suppliers) ? supRes.suppliers : []
        const prodRaw = Array.isArray(prodRes?.products) ? prodRes.products : []
        const entRaw = Array.isArray(entriesRes?.entries) ? entriesRes.entries : []

        const normalizedSup = supRaw.map((s) => ({ id: String(s.id), name: String(s.name || '') }))
        const normalizedProd = prodRaw.map((p) => ({
          id: String(p.id),
          name: String(p.name || ''),
          stock: Number(p.stock) || 0,
        }))
        const normalizedEntries = entRaw.map((e) => ({
          id: String(e.id),
          productId: String(e.product_id || ''),
          productName: String(e.product_name || ''),
          supplier: String(e.supplier_name || ''),
          quantity: Number(e.quantity) || 0,
          price: Number(e.purchase_price) || 0,
          date: toDateValue(e.date) || toDateValue(e.createdAt),
        }))

        if (cancelled) return
        setSuppliers(normalizedSup)
        setProducts(normalizedProd)
        setEntries(
          normalizedEntries.map((x) => ({
            ...x,
            dateText: x.date instanceof Date ? x.date.toISOString().slice(0, 10) : '',
          })),
        )

        setForm((prev) => ({
          ...prev,
          supplierId: prev.supplierId || normalizedSup[0]?.id || '',
          productId: prev.productId || normalizedProd[0]?.id || '',
          date: prev.date || new Date().toISOString().slice(0, 10),
        }))
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load stock entry data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handler = async () => {
      try {
        const [productsRes, entriesRes] = await Promise.all([
          apiFetch('/api/inventory/products'),
          apiFetch('/api/inventory/stock-entries?limit=50'),
        ])

        const prodRaw = Array.isArray(productsRes?.products) ? productsRes.products : []
        setProducts(
          prodRaw.map((p) => ({
            id: String(p.id),
            name: String(p.name || ''),
            stock: Number(p.stock) || 0,
          })),
        )

        const entRaw = Array.isArray(entriesRes?.entries) ? entriesRes.entries : []
        const normalizedEntries = entRaw.map((e) => ({
          id: String(e.id),
          productId: String(e.product_id || ''),
          productName: String(e.product_name || ''),
          supplier: String(e.supplier_name || ''),
          quantity: Number(e.quantity) || 0,
          price: Number(e.purchase_price) || 0,
          date: toDateValue(e.date) || toDateValue(e.createdAt),
        }))
        setEntries(
          normalizedEntries.map((x) => ({
            ...x,
            dateText: x.date instanceof Date ? x.date.toISOString().slice(0, 10) : '',
          })),
        )
      } catch {
      }
    }
    window.addEventListener('inventory:products-updated', handler)
    return () => window.removeEventListener('inventory:products-updated', handler)
  }, [])

  function onChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function onProductQueryChange(e) {
    const value = e.target.value
    setProductQuery(value)
    const matchKey = normalizeKey(value)
    const match = products.find((p) => normalizeKey(p.name) === matchKey)
    setForm((prev) => ({ ...prev, productId: match?.id || '' }))
  }

  function onFileChange(e) {
    const file = e.target.files?.[0] ?? null
    setForm((prev) => ({ ...prev, invoiceFile: file }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (submitting) return
    const qty = Number(form.quantity)
    const price = Number(form.purchasePrice)
    const typedName = formatProductName(productQuery)
    setProductQuery(typedName)
    const match = products.find((p) => normalizeKey(p.name) === normalizeKey(typedName))
    const productIdToSend = match?.id ? String(match.id) : ''

    if (!productIdToSend && !typedName) {
      setError('Please enter a product name.')
      return
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Quantity must be greater than 0.')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Purchase price must be 0 or greater.')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const createRes = await apiFetch('/api/inventory/stock-entries', {
        method: 'POST',
        body: JSON.stringify({
          productId: productIdToSend,
          productName: typedName,
          supplierId: form.supplierId,
          quantity: qty,
          purchasePrice: price,
          date: form.date,
        }),
      })

      const [entriesRes, productsRes] = await Promise.all([
        apiFetch('/api/inventory/stock-entries?limit=50'),
        apiFetch('/api/inventory/products'),
      ])

      const entRaw = Array.isArray(entriesRes?.entries) ? entriesRes.entries : []
      const normalizedEntries = entRaw.map((e) => ({
        id: String(e.id),
        productId: String(e.product_id || ''),
        productName: String(e.product_name || ''),
        supplier: String(e.supplier_name || ''),
        quantity: Number(e.quantity) || 0,
        price: Number(e.purchase_price) || 0,
        date: toDateValue(e.date) || toDateValue(e.createdAt),
      }))
      setEntries(
        normalizedEntries.map((x) => ({
          ...x,
          dateText: x.date instanceof Date ? x.date.toISOString().slice(0, 10) : '',
        })),
      )

      const prodRaw = Array.isArray(productsRes?.products) ? productsRes.products : []
      setProducts(
        prodRaw.map((p) => ({
          id: String(p.id),
          name: String(p.name || ''),
          stock: Number(p.stock) || 0,
        })),
      )

      setForm((prev) => ({
        ...prev,
        quantity: '',
        purchasePrice: '',
        invoiceFile: null,
      }))

      const savedId = String(createRes?.id || '')
      setSuccess(savedId ? `Saved to Firebase (ID: ${savedId})` : 'Saved to Firebase')
      setTimeout(() => setSuccess(null), 3500)
    } catch (e2) {
      setError(e2?.message || 'Failed to create stock entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock Entry</h1>
        <p className="text-sm text-muted-foreground">
          Add incoming inventory and keep quantities up to date.
        </p>
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

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Add New Inventory Item</div>
            <div className="text-xs text-muted-foreground">
              Fill the form and submit to create a stock entry.
            </div>
          </div>
          <div className="hidden rounded-xl border bg-background px-2 py-1 text-xs text-muted-foreground md:block">
            Invoice optional
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <select
              id="supplier"
              value={form.supplierId}
              onChange={onChange('supplierId')}
              disabled={loading}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {suppliers.length === 0 && <option value="">No suppliers</option>}
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryDate">Date</Label>
            <Input
              id="entryDate"
              type="date"
              value={form.date}
              onChange={onChange('date')}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productSearch">Product</Label>
            <div className="relative">
              <Input
                id="productSearch"
                value={productQuery}
                onChange={onProductQueryChange}
                onFocus={() => setProductOpen(true)}
                onBlur={() => {
                  const next = formatProductName(productQuery)
                  setProductQuery(next)
                  const match = products.find((p) => normalizeKey(p.name) === normalizeKey(next))
                  setForm((prev) => ({ ...prev, productId: match?.id ? String(match.id) : '' }))
                  setTimeout(() => setProductOpen(false), 150)
                }}
                placeholder="Type product name"
                disabled={loading}
                required
              />

              {productOpen && products.length > 0 && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-white shadow-lg">
                  <div className="max-h-60 overflow-auto p-1">
                    {products
                      .filter((p) =>
                        normalizeKey(p.name).includes(normalizeKey(productQuery)),
                      )
                      .slice(0, 12)
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={(ev) => {
                            ev.preventDefault()
                            setForm((prev) => ({ ...prev, productId: p.id }))
                            setProductQuery(p.name)
                            setProductOpen(false)
                          }}
                          className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          {p.name}
                        </button>
                      ))}

                    {products.filter((p) => normalizeKey(p.name).includes(normalizeKey(productQuery)))
                      .length === 0 && (
                      <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity
              {(() => {
                const selected = products.find((p) => String(p.id) === String(form.productId))
                if (!selected) return null
                return (
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">
                    Current stock: {Number(selected.stock) || 0}
                  </span>
                )
              })()}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={onChange('quantity')}
              placeholder="e.g. 50"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              value={form.purchasePrice}
              onChange={onChange('purchasePrice')}
              placeholder="e.g. 110.00"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice Upload</Label>
            <div className="flex items-center gap-3">
              <Input id="invoice" type="file" onChange={onFileChange} />
              <div className="hidden items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground md:flex">
                <CloudUpload className="h-4 w-4" />
                {form.invoiceFile ? form.invoiceFile.name : 'No file selected'}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button
              type="submit"
              className="rounded-xl"
              disabled={loading || submitting}
            >
              <PackagePlus className="h-4 w-4" />
              {submitting ? 'Saving...' : 'Submit'}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Recent Stock Entries</div>
            <div className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : 'Live data'}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {(() => {
                      const id = String(entry.productId || '')
                      const live = id ? productNameById.get(id) : null
                      if (live) return live
                      if (id) return `${String(entry.productName || '')} (Deleted)`
                      return String(entry.productName || '')
                    })()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{entry.supplier}</TableCell>
                  <TableCell className="text-right tabular-nums">{entry.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    ₹{entry.price}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{entry.dateText}</TableCell>
                </TableRow>
              ))}

              {!loading && entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No entries yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
