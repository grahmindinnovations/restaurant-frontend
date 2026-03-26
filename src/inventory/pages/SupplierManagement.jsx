import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
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
import { Textarea } from '../ui/textarea'
import { apiFetch } from '../../services/api'

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplierId, setEditingSupplierId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gst: '',
  })

  const editingSupplier = useMemo(
    () => suppliers.find((s) => s.id === editingSupplierId) ?? null,
    [editingSupplierId, suppliers],
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch('/api/inventory/suppliers')
        const raw = Array.isArray(res?.suppliers) ? res.suppliers : []
        const normalized = raw.map((s) => ({
          id: String(s.id),
          name: String(s.name || ''),
          phone: s.phone ? String(s.phone) : '',
          email: s.email ? String(s.email) : '',
          address: s.address ? String(s.address) : '',
          gst: s.gst ? String(s.gst) : '',
        }))
        if (!cancelled) setSuppliers(normalized)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load suppliers')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function openAdd() {
    setEditingSupplierId(null)
    setForm({ name: '', phone: '', email: '', address: '', gst: '' })
    setDialogOpen(true)
  }

  function openEdit(supplier) {
    setEditingSupplierId(supplier.id)
    setForm({
      name: supplier.name ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      gst: supplier.gst ?? '',
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
  }

  function onChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const next = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      gst: form.gst.trim(),
    }

    setError(null)
    if (editingSupplier) {
      try {
        await apiFetch(`/api/inventory/suppliers/${encodeURIComponent(editingSupplier.id)}`, {
          method: 'PATCH',
          body: JSON.stringify(next),
        })
        setSuppliers((prev) =>
          prev.map((s) => (s.id === editingSupplier.id ? { ...s, ...next } : s)),
        )
        closeDialog()
        return
      } catch (e2) {
        setError(e2?.message || 'Failed to update supplier')
        return
      }
    }

    try {
      const res = await apiFetch('/api/inventory/suppliers', {
        method: 'POST',
        body: JSON.stringify(next),
      })
      const id = String(res?.id || `sup-${Math.random().toString(16).slice(2, 8)}`)
      setSuppliers((prev) => [{ id, ...next }, ...prev])
      closeDialog()
    } catch (e2) {
      setError(e2?.message || 'Failed to create supplier')
    }
  }

  async function onDelete(id) {
    setError(null)
    try {
      await apiFetch(`/api/inventory/suppliers/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      setSuppliers((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError(e?.message || 'Failed to delete supplier')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Supplier Management</h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, and manage supplier records.
          </p>
        </div>

        <Button className="rounded-xl" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        {error && (
          <div className="m-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>GST</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.phone}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.email}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {supplier.gst}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => openEdit(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!loading && suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No suppliers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
              <DialogDescription>
                {editingSupplier
                  ? 'Update the supplier details.'
                  : 'Fill in the supplier details to add a new supplier.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={form.name}
                  onChange={onChange('name')}
                  placeholder="e.g. FreshFarm Distributors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={onChange('phone')}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={onChange('email')}
                  placeholder="orders@example.com"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={onChange('address')}
                  placeholder="Supplier address"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="gst">GST Number</Label>
                <Input
                  id="gst"
                  value={form.gst}
                  onChange={onChange('gst')}
                  placeholder="29ABCDE1234F1Z5"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                {editingSupplier ? 'Save Changes' : 'Add Supplier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
