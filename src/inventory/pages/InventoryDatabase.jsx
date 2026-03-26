import { useEffect, useMemo, useState } from 'react'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { Badge } from '../ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { apiFetch } from '../../services/api'

function getStatus(stock) {
  if (stock <= 0) return { label: 'Out of Stock', variant: 'destructive' }
  if (stock <= 10) return { label: 'Low Stock', variant: 'warning' }
  return { label: 'In Stock', variant: 'success' }
}

export default function InventoryDatabase() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [deletedMode, setDeletedMode] = useState('exclude')
  const [categories, setCategories] = useState(['All'])
  const [products, setProducts] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    category: 'General',
    stock: '',
    unitPrice: '',
  })

  const productCategories = useMemo(
    () => categories.filter((c) => c !== 'All'),
    [categories],
  )

  useEffect(() => {
    const params = new URLSearchParams(location.search || '')
    const nextCategory = params.get('category')
    const nextSearch = params.get('search')
    const nextDeleted = params.get('deleted')
    if (nextCategory) setCategory(nextCategory)
    if (nextSearch != null) setSearch(nextSearch)
    if (nextDeleted) setDeletedMode(nextDeleted)
  }, [location.search])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [catsRes, productsRes] = await Promise.all([
          apiFetch('/api/inventory/categories'),
          apiFetch(
            `/api/inventory/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&deleted=${encodeURIComponent(deletedMode)}`,
          ),
        ])

        const cats = Array.isArray(catsRes?.categories) ? catsRes.categories : []
        const normalizedCats = ['All', ...cats.filter((c) => c && c !== 'All')]
        if (!cancelled) setCategories(normalizedCats)

        const raw = Array.isArray(productsRes?.products) ? productsRes.products : []
        const normalizedProducts = raw.map((p) => ({
          id: String(p.id),
          name: String(p.name || ''),
          category: String(p.category || 'General'),
          stock: Number(p.stock) || 0,
          unitPrice: Number(p.unit_price ?? p.unitPrice) || 0,
          isDeleted: Boolean(p.is_deleted),
        }))
        if (!cancelled) setProducts(normalizedProducts)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [category, search, deletedMode])

  const editingProduct = useMemo(
    () => products.find((p) => p.id === editingId) ?? null,
    [editingId, products],
  )

  const filteredProducts = products

  function openEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name ?? '',
      category: product.category ?? (productCategories[0] ?? 'General'),
      stock: String(product.stock ?? ''),
      unitPrice: String(product.unitPrice ?? ''),
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
    if (!editingProduct) return

    const stock = Number(form.stock)
    const unitPrice = Number(form.unitPrice)

    setError(null)
    try {
      await apiFetch(`/api/inventory/products/${encodeURIComponent(editingProduct.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          stock: Number.isFinite(stock) ? stock : 0,
          unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        }),
      })
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: form.name.trim(),
                category: form.category,
                stock: Number.isFinite(stock) ? stock : 0,
                unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
              }
            : p,
        ),
      )
      window.dispatchEvent(new CustomEvent('inventory:products-updated'))
      closeDialog()
    } catch (e2) {
      setError(e2?.message || 'Failed to update product')
    }
  }

  async function onDelete(id) {
    setError(null)
    try {
      await apiFetch(`/api/inventory/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      setProducts((prev) => prev.filter((p) => p.id !== id))
      window.dispatchEvent(new CustomEvent('inventory:products-updated'))
    } catch (e) {
      setError(e?.message || 'Failed to delete product')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory Database</h1>
        <p className="text-sm text-muted-foreground">
          Search, filter, and review current stock levels.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>View</Label>
            <Select value={deletedMode} onValueChange={setDeletedMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exclude">Active</SelectItem>
                <SelectItem value="only">Deleted</SelectItem>
                <SelectItem value="include">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Products</div>
            <div className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : 'Live data'}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{filteredProducts.length} items</div>
        </div>

        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => {
                const status = getStatus(p.stock)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.stock}</TableCell>
                    <TableCell className="text-right tabular-nums">₹{p.unitPrice}</TableCell>
                    <TableCell>
                      {p.isDeleted ? <Badge variant="destructive">Deleted</Badge> : <Badge variant={status.variant}>{status.label}</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          disabled={p.isDeleted}
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={p.isDeleted}
                          onClick={() => onDelete(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No products match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product details and stock values.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={form.name}
                  onChange={onChange('name')}
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Level</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={onChange('stock')}
                  placeholder="e.g. 25"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={onChange('unitPrice')}
                  placeholder="e.g. 110.00"
                  required
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
