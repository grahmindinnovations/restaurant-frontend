import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { apiFetch } from '../../../services/api'
import { uploadMenuImage } from '../../../services/uploadMenuImage'
import { resolveMenuImageUrl } from '../../../lib/menuImageUrl'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Select } from '../../ui/select'
import AdminNotice from '../components/AdminNotice'
import AdminModal, { AdminModalActions } from '../components/AdminModal'
import { adminCard } from '../components/adminUi'

const CATEGORIES = ['Main Course', 'Drinks', 'Snacks', 'Rice', 'General']
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'

const emptyForm = () => ({
  name: '',
  category: 'Main Course',
  price: '',
  cost_price: '',
  daily_quantity: '50',
  image_url: DEFAULT_IMAGE,
  available: true,
})

function normalizeItem(raw) {
  const available = raw.available ?? raw.is_active ?? true
  const qty = Number(raw.daily_quantity) || 0
  return {
    id: raw.id,
    name: raw.name || '',
    category: raw.category || 'General',
    price: Number(raw.price) || 0,
    cost_price: Number(raw.cost_price) || 0,
    daily_quantity: qty,
    image_url: raw.image_url || raw.image || '',
    available: available !== false && qty > 0,
    is_active: raw.is_active !== false,
  }
}

function statusLabel(item) {
  if (!item.available || item.daily_quantity <= 0) return 'Unavailable'
  if (item.daily_quantity < 20) return 'Low stock'
  return 'Available'
}

export default function ItemsDatabase() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const clearImagePick = useCallback(() => {
    setImageFile(null)
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  useEffect(() => () => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/menu')
      const list = Array.isArray(res.menu) ? res.menu.map(normalizeItem) : []
      setItems(list)
    } catch (e) {
      console.error('Failed to load menu', e)
      setNotice('Failed to load menu items.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const socket = io()
    socket.on('menu:update', (menu) => {
      const list = Array.isArray(menu) ? menu.map(normalizeItem) : []
      setItems(list)
    })
    return () => socket.close()
  }, [load])

  const openAdd = () => {
    clearImagePick()
    setForm(emptyForm())
    setModal('add')
  }

  const openEdit = (item) => {
    clearImagePick()
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      cost_price: String(item.cost_price),
      daily_quantity: String(item.daily_quantity),
      image_url: item.image_url || DEFAULT_IMAGE,
      available: item.available,
    })
    setPreviewUrl(resolveMenuImageUrl(item.image_url) || null)
    setModal({ type: 'edit', id: item.id })
  }

  const onPickImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      setNotice('Use a JPEG, PNG, or WebP image (max 3 MB).')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setNotice('Image must be 3 MB or smaller.')
      return
    }
    setNotice(null)
    setImageFile(file)
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const closeModal = () => {
    if (saving) return
    clearImagePick()
    setModal(null)
  }

  const saveForm = async () => {
    const name = form.name.trim()
    if (!name) {
      setNotice('Name is required.')
      return
    }
    const price = Number(form.price)
    const cost = Number(form.cost_price)
    const qty = Number(form.daily_quantity)
    if (!Number.isFinite(price) || price < 0) {
      setNotice('Enter a valid sell price.')
      return
    }
    if (!Number.isFinite(qty) || qty < 0) {
      setNotice('Enter a valid daily quantity.')
      return
    }

    setSaving(true)
    setNotice(null)
    try {
      let imageUrl = form.image_url?.trim() || DEFAULT_IMAGE
      if (imageFile) {
        imageUrl = await uploadMenuImage(imageFile)
      } else if (modal === 'add' && !form.image_url?.trim()) {
        imageUrl = DEFAULT_IMAGE
      }

      const payload = {
        name,
        category: form.category,
        price,
        cost_price: Number.isFinite(cost) && cost >= 0 ? cost : Math.round(price * 0.4),
        daily_quantity: qty,
        image_url: imageUrl,
        available: form.available && qty > 0,
        is_active: form.available && qty > 0,
      }

      if (modal === 'add') {
        await apiFetch('/api/menu', { method: 'POST', body: JSON.stringify(payload) })
        setNotice(`Added ${name}.`)
      } else if (modal?.type === 'edit') {
        await apiFetch(`/api/menu/${modal.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setNotice(`Updated ${name}.`)
      }
      closeModal()
      await load()
    } catch (e) {
      console.error('Save menu item failed', e)
      setNotice(e?.message?.includes('Upload') ? e.message : 'Failed to save menu item.')
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailable = async (item) => {
    const next = !item.available
    setTogglingId(item.id)
    setNotice(null)
    try {
      const qty = next ? Math.max(item.daily_quantity, 1) : 0
      await apiFetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          available: next,
          is_active: next,
          daily_quantity: qty,
        }),
      })
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, available: next, daily_quantity: qty, is_active: next }
            : it,
        ),
      )
    } catch (e) {
      console.error('Toggle availability failed', e)
      setNotice('Failed to update availability.')
    } finally {
      setTogglingId(null)
    }
  }

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This removes it from POS and kitchen.`)) return
    setNotice(null)
    try {
      await apiFetch(`/api/menu/${item.id}`, { method: 'DELETE' })
      setNotice(`Deleted ${item.name}.`)
      await load()
    } catch (e) {
      console.error('Delete failed', e)
      setNotice('Failed to delete item.')
    }
  }

  const missingCostCount = useMemo(
    () => items.filter((i) => !(Number(i.cost_price) > 0)).length,
    [items],
  )

  const backfillCosts = async () => {
    setNotice(null)
    try {
      const res = await apiFetch('/api/menu/backfill-cost-prices', {
        method: 'POST',
        body: JSON.stringify({ ratio: 0.4 }),
      })
      await load()
      setNotice(
        res.updated > 0
          ? `Set default food cost on ${res.updated} item(s).`
          : 'All items already have food cost.',
      )
    } catch (e) {
      console.error('Backfill failed', e)
      setNotice('Failed to apply default costs.')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          Food cost drives Reports → COGS. Daily qty 0 marks item unavailable on POS.
        </p>
        <div className="flex flex-wrap gap-2">
          {missingCostCount > 0 && (
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={backfillCosts}>
              Default cost ({missingCostCount})
            </Button>
          )}
          <Button type="button" size="sm" className="h-7 text-xs gap-1" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" />
            Add item
          </Button>
        </div>
      </div>

      <AdminNotice message={notice} />

      <Card className={adminCard}>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-3 text-xs text-neutral-500">Loading menu…</p>
          ) : items.length === 0 ? (
            <p className="p-3 text-xs text-neutral-500">
              No menu items yet. Click Add item to create your first dish.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500 w-14" />
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">Category</th>
                    <th className="px-3 py-2 text-right font-semibold text-neutral-500">Sell</th>
                    <th className="px-3 py-2 text-right font-semibold text-neutral-500">Cost</th>
                    <th className="px-3 py-2 text-right font-semibold text-neutral-500">Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-500">Status</th>
                    <th className="px-3 py-2 text-right font-semibold text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const margin =
                      item.price > 0
                        ? Math.round(((item.price - item.cost_price) / item.price) * 100)
                        : 0
                    const status = statusLabel(item)
                    return (
                      <tr key={item.id} className="border-t border-neutral-100">
                        <td className="px-3 py-2">
                          <div className="h-10 w-10 rounded-md border border-neutral-200 bg-neutral-100 overflow-hidden">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-2 font-medium text-neutral-900">{item.name}</td>
                        <td className="px-3 py-2 text-neutral-600">{item.category}</td>
                        <td className="px-3 py-2 text-right tabular-nums">₹{item.price}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-neutral-600">
                          ₹{item.cost_price}
                          {item.price > 0 && (
                            <span className="text-neutral-400 ml-1">({margin}%)</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{item.daily_quantity}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              status === 'Available'
                                ? 'text-neutral-700'
                                : status === 'Low stock'
                                  ? 'text-neutral-900 font-medium'
                                  : 'text-neutral-400'
                            }
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] px-2"
                              disabled={togglingId === item.id}
                              onClick={() => toggleAvailable(item)}
                            >
                              {item.available ? 'Mark unavailable' : 'Mark available'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => openEdit(item)}
                              aria-label={`Edit ${item.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => deleteItem(item)}
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      {modal && (
        <AdminModal
          title={modal === 'add' ? 'Add menu item' : 'Edit menu item'}
          onClose={closeModal}
          footer={
            <AdminModalActions
              onCancel={closeModal}
              onSave={saveForm}
              saving={saving}
              saveLabel={modal === 'add' ? 'Add' : 'Save'}
            />
          }
        >
          <label className="block text-xs font-medium text-neutral-700">
            Name
            <Input
              className="mt-1 h-8 text-xs"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="block text-xs font-medium text-neutral-700">
            Category
            <Select
              className="mt-1 h-8 text-xs"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-neutral-700">
              Sell price (₹)
              <Input
                type="number"
                min="0"
                className="mt-1 h-8 text-xs"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-neutral-700">
              Food cost (₹)
              <Input
                type="number"
                min="0"
                className="mt-1 h-8 text-xs"
                value={form.cost_price}
                onChange={(e) => setForm((f) => ({ ...f, cost_price: e.target.value }))}
              />
            </label>
          </div>
          <label className="block text-xs font-medium text-neutral-700">
            Daily quantity (0 = unavailable on POS)
            <Input
              type="number"
              min="0"
              className="mt-1 h-8 text-xs"
              value={form.daily_quantity}
              onChange={(e) => setForm((f) => ({ ...f, daily_quantity: e.target.value }))}
            />
          </label>
          <div className="block text-xs font-medium text-neutral-700">
            Photo
            <div className="mt-1 flex flex-wrap items-start gap-3">
              <div className="h-24 w-24 rounded-md border border-neutral-200 bg-neutral-100 overflow-hidden shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                    No photo
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onPickImage}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {imageFile ? 'Change image' : 'Upload image'}
                </Button>
                <p className="text-[10px] text-neutral-500">JPEG, PNG or WebP · max 3 MB</p>
                {imageFile && (
                  <button
                    type="button"
                    className="text-[10px] text-neutral-600 underline"
                    onClick={clearImagePick}
                  >
                    Remove new image
                  </button>
                )}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-neutral-700">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
            />
            Available on POS
          </label>
        </AdminModal>
      )}
    </div>
  )
}
