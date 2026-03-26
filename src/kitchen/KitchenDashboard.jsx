import React, { useState, useEffect, useRef, useMemo } from 'react'
import tw, { styled, css } from 'twin.macro'
import { ClipboardList, ChevronDown, TrendingUp, AlertCircle, Package, Clock, CheckCircle } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useNavigate } from 'react-router-dom'

import Sidebar from './KitchenSidebar'
import Header from '../layouts/Header'
import OrderList from './OrderList'
import MenuManagement from './MenuManagement'
import AddDishModal from './modals/AddDishModal'
import EditDishModal from './modals/EditDishModal'
import ScheduleModal from './modals/ScheduleModal'
import { apiFetch } from '../services/api'
import { io } from 'socket.io-client'

const Container = styled.div(() => [
  tw`flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800`,
  css`
    background-image: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  `,
])

const Main = tw.main`flex-1 flex flex-col min-w-0 overflow-hidden relative`
const ContentScroll = tw.div`flex-1 overflow-y-auto p-8`

const DashboardGrid = tw.div`grid grid-cols-12 gap-8`
const Section = tw.section`col-span-12 lg:col-span-8 flex flex-col gap-6`
const SideSection = tw.aside`col-span-12 lg:col-span-4 flex flex-col gap-6`

const Card = tw.div`bg-white rounded-2xl border border-slate-200 shadow-sm p-6`
const CardHeader = tw.div`flex items-center justify-between mb-4`
const CardTitle = tw.h3`font-bold text-slate-800`

const StatsGrid = tw.div`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2`
const StatCard = styled.div(({ active }) => [
  tw`p-5 rounded-2xl border flex items-center justify-between shadow-sm transition-all cursor-pointer bg-white`,
  tw`hover:border-rose-200 hover:shadow-md`,
])
const StatInfo = tw.div``
const StatLabel = tw.p`text-sm text-slate-500 font-medium mb-1`
const StatValue = tw.h3`text-2xl font-bold text-slate-800`
const StatIcon = styled.div(({ color }) => [
  tw`w-10 h-10 rounded-xl flex items-center justify-center`,
  color === 'blue' && tw`bg-blue-50 text-blue-600`,
  color === 'rose' && tw`bg-rose-50 text-rose-600`,
  color === 'amber' && tw`bg-amber-50 text-amber-600`,
  color === 'emerald' && tw`bg-emerald-50 text-emerald-600`,
])

const mockOrders = [
  {
    id: '#1235',
    source: 'Reception',
    type: 'reception',
    items: [
      { name: 'Chicken Biryani', qty: 2 },
      { name: 'Butter Naan', qty: 2 },
      { name: 'Paneer Tikka', qty: 1 },
    ],
    time: '10 min ago',
    status: 'pending',
  },
  {
    id: '#1236',
    source: 'Table 5',
    type: 'table',
    items: [
      { name: 'Vegetable Fried Rice', qty: 1 },
      { name: 'Butter Naan', qty: 2 },
    ],
    time: '13 min ago',
    status: 'cooking',
  },
  {
    id: '#1237',
    source: 'Table 2',
    type: 'table',
    items: [
      { name: 'Chicken Tandoori', qty: 2 },
      { name: 'Prawn Curry', qty: 2 },
    ],
    time: '27 min ago',
    status: 'ready',
  },
  {
    id: '#1238',
    source: 'Online',
    type: 'reception',
    items: [
      { name: 'Veg Pizza', qty: 1 },
      { name: 'Coke', qty: 2 },
    ],
    time: '32 min ago',
    status: 'completed',
  }
]

function KitchenInventoryView() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [draft, setDraft] = useState({})

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await apiFetch('/api/inventory/items')
        if (!cancelled) {
          const list = Array.isArray(data.items) ? data.items : []
          setItems(list)
          setDraft((prev) => {
            const next = { ...prev }
            for (const it of list) {
              const id = String(it?.id || '')
              if (!id) continue
              if (next[id]) continue
              next[id] = {
                qty: Number(it.daily_quantity) || 0,
                cost: Number(it.cost_price) || 0,
              }
            }
            return next
          })
        }
      } catch (e) {
        console.error('Inventory load error:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const adjustDraftQty = (id, delta) => {
    setDraft((prev) => {
      const current = prev[String(id)] || { qty: 0, cost: 0 }
      const nextQty = Math.max(0, (Number(current.qty) || 0) + delta)
      return {
        ...prev,
        [String(id)]: {
          ...current,
          qty: nextQty,
        },
      }
    })
  }

  const saveItem = async (item) => {
    const id = String(item?.id || '')
    if (!id) return
    const d = draft[id]
    const nextQty = Number(d?.qty)
    const nextCost = Number(d?.cost)
    if (!Number.isFinite(nextQty) || nextQty < 0) {
      alert('Please enter a valid non-negative quantity.')
      return
    }
    if (!Number.isFinite(nextCost) || nextCost < 0) {
      alert('Please enter a valid non-negative cost price.')
      return
    }
    setSavingId(id)
    try {
      await apiFetch(`/api/inventory/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          daily_quantity: nextQty,
          cost_price: nextCost,
          available: nextQty > 0,
        }),
      })
      setItems((prev) =>
        prev.map((it) =>
          String(it.id) === id
            ? { ...it, daily_quantity: nextQty, cost_price: nextCost, available: nextQty > 0 }
            : it,
        ),
      )
    } catch (e) {
      console.error('Failed to update inventory item:', e)
      alert('Failed to update item. Please try again.')
    } finally {
      setSavingId(null)
    }
  }

  const resetItem = (item) => {
    const id = String(item?.id || '')
    if (!id) return
    setDraft((prev) => ({
      ...prev,
      [id]: {
        qty: Number(item.daily_quantity) || 0,
        cost: Number(item.cost_price) || 0,
      },
    }))
  }

  const counts = useMemo(() => {
    const list = Array.isArray(items) ? items : []
    let inStock = 0
    let low = 0
    let out = 0
    for (const it of list) {
      const qty = Number(it?.daily_quantity) || 0
      if (qty === 0) out += 1
      else if (qty > 0 && qty < 20) low += 1
      else inStock += 1
    }
    return { total: list.length, inStock, low, out }
  }, [items])

  const visibleItems = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    return (Array.isArray(items) ? items : [])
      .filter((it) => {
        if (!it) return false
        const name = String(it.name || '').toLowerCase()
        const cat = String(it.category || '').toLowerCase()
        if (q && !name.includes(q) && !cat.includes(q)) return false
        const qty = Number(it.daily_quantity) || 0
        if (filter === 'out') return qty === 0
        if (filter === 'low') return qty > 0 && qty < 20
        if (filter === 'in') return qty >= 20
        return true
      })
      .sort((a, b) => {
        const aq = Number(a?.daily_quantity) || 0
        const bq = Number(b?.daily_quantity) || 0
        return aq - bq
      })
  }, [filter, items, query])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        Loading inventory...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Inventory Management</h3>
        <div className="text-xs text-slate-500 flex flex-wrap gap-2 justify-end">
          <span className="px-2 py-1 rounded-full border border-slate-200 bg-slate-50">
            Total: {counts.total}
          </span>
          <span className="px-2 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
            In stock: {counts.inStock}
          </span>
          <span className="px-2 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
            Low: {counts.low}
          </span>
          <span className="px-2 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700">
            Out: {counts.out}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-500">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by item or category..."
            className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="text-xs font-semibold text-slate-500">Filter</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          >
            <option value="all">All items</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-500">Item</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-500">Category</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-500">Price</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-500">Cost</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-500">Daily Qty</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-500">Status</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const qty = Number(item.daily_quantity) || 0
              const cost = Number(item.cost_price) || 0
              const low = qty > 0 && qty < 20
              const statusLabel = qty === 0 ? 'Out of stock' : low ? 'Low' : 'In stock'
              const statusClass =
                qty === 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : low
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              return (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-2 text-slate-500">{item.category}</td>
                  <td className="px-4 py-2 text-right text-slate-700">₹{Number(item.price || 0).toFixed(0)}</td>
                  <td className="px-4 py-2 text-right text-slate-700">
                    <div className="inline-flex items-center justify-end gap-2">
                      <span className="text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft[String(item.id)]?.cost ?? cost}
                        onChange={(e) => {
                          const v = e.target.value
                          setDraft((prev) => ({
                            ...prev,
                            [String(item.id)]: {
                              ...(prev[String(item.id)] || { qty, cost }),
                              cost: v === '' ? '' : Number(v),
                            },
                          }))
                        }}
                        className="w-24 h-9 rounded-lg border border-slate-200 bg-white px-2 text-right text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                        disabled={savingId === item.id}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => adjustDraftQty(item.id, -5)}
                        disabled={savingId === item.id}
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => adjustDraftQty(item.id, -1)}
                        disabled={savingId === item.id}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draft[String(item.id)]?.qty ?? qty}
                        onChange={(e) => {
                          const v = e.target.value
                          setDraft((prev) => ({
                            ...prev,
                            [String(item.id)]: {
                              ...(prev[String(item.id)] || { qty, cost }),
                              qty: v === '' ? '' : Number(v),
                            },
                          }))
                        }}
                        className="w-20 h-9 rounded-lg border border-slate-200 bg-white px-2 text-right font-mono text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                        disabled={savingId === item.id}
                      />
                      <button
                        type="button"
                        className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => adjustDraftQty(item.id, 1)}
                        disabled={savingId === item.id}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => adjustDraftQty(item.id, 5)}
                        disabled={savingId === item.id}
                      >
                        +5
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => resetItem(item)}
                        disabled={savingId === item.id}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                        onClick={() => saveItem(item)}
                        disabled={savingId === item.id}
                      >
                        {savingId === item.id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {visibleItems.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KitchenProductInventoryView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState(['All'])
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [consumeDraft, setConsumeDraft] = useState({})
  const [consumingId, setConsumingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [catsRes, productsRes] = await Promise.all([
          apiFetch('/api/inventory/categories'),
          apiFetch('/api/inventory/products?deleted=exclude'),
        ])

        const cats = Array.isArray(catsRes?.categories) ? catsRes.categories : []
        const normalizedCats = ['All', ...cats.filter((c) => c && c !== 'All')]
        const raw = Array.isArray(productsRes?.products) ? productsRes.products : []
        const normalizedProducts = raw.map((p) => ({
          id: String(p.id),
          name: String(p.name || ''),
          category: String(p.category || 'General'),
          stock: Number(p.stock) || 0,
          unitPrice: Number(p.unit_price ?? p.unitPrice) || 0,
          isDeleted: Boolean(p.is_deleted),
        }))

        if (!cancelled) {
          setCategories(normalizedCats)
          setProducts(normalizedProducts)
          setConsumeDraft((prev) => {
            const next = { ...prev }
            for (const p of normalizedProducts) {
              if (!p?.id) continue
              if (next[p.id] != null) continue
              next[p.id] = 1
            }
            return next
          })
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load inventory products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleProducts = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    return (Array.isArray(products) ? products : [])
      .filter((p) => {
        if (!p) return false
        if (p.isDeleted) return false
        if (category && category !== 'All' && String(p.category) !== String(category)) return false
        if (!q) return true
        const name = String(p.name || '').toLowerCase()
        const cat = String(p.category || '').toLowerCase()
        return name.includes(q) || cat.includes(q)
      })
      .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
  }, [category, products, query])

  const counts = useMemo(() => {
    const list = Array.isArray(visibleProducts) ? visibleProducts : []
    let inStock = 0
    let low = 0
    let out = 0
    for (const p of list) {
      const stock = Number(p?.stock) || 0
      if (stock <= 0) out += 1
      else if (stock <= 10) low += 1
      else inStock += 1
    }
    return { total: list.length, inStock, low, out }
  }, [visibleProducts])

  const adjustConsume = (id, delta) => {
    setConsumeDraft((prev) => {
      const current = Number(prev[String(id)] ?? 1)
      const next = Math.max(1, current + delta)
      return { ...prev, [String(id)]: next }
    })
  }

  const consume = async (p) => {
    const id = String(p?.id || '')
    if (!id) return
    const qty = Number(consumeDraft[id] ?? 1)
    if (!Number.isFinite(qty) || qty <= 0) {
      alert('Enter a valid quantity to use.')
      return
    }
    setConsumingId(id)
    try {
      const out = await apiFetch(`/api/inventory/products/${encodeURIComponent(id)}/consume`, {
        method: 'POST',
        body: JSON.stringify({ quantity: qty }),
      })
      const nextStock = Number(out?.stock)
      if (Number.isFinite(nextStock)) {
        setProducts((prev) => prev.map((x) => (String(x.id) === id ? { ...x, stock: nextStock } : x)))
      } else {
        setProducts((prev) =>
          prev.map((x) =>
            String(x.id) === id ? { ...x, stock: Math.max(0, (Number(x.stock) || 0) - qty) } : x,
          ),
        )
      }
      window.dispatchEvent(new CustomEvent('inventory:products-updated'))
    } catch (e) {
      console.error('Failed to consume stock:', e)
      alert(e?.message || 'Failed to update stock.')
    } finally {
      setConsumingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        Loading inventory products...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Inventory Products</h3>
        <div className="text-xs text-slate-500 flex flex-wrap gap-2 justify-end">
          <span className="px-2 py-1 rounded-full border border-slate-200 bg-slate-50">
            Total: {counts.total}
          </span>
          <span className="px-2 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
            In stock: {counts.inStock}
          </span>
          <span className="px-2 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
            Low: {counts.low}
          </span>
          <span className="px-2 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700">
            Out: {counts.out}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-500">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product or category..."
            className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          />
        </div>
        <div className="w-full md:w-56">
          <label className="text-xs font-semibold text-slate-500">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-500">Product</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-500">Category</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-500">Stock</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-500">Unit Price</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-500">Status</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-500">Use Qty</th>
              <th className="px-4 py-2 text-right font-semibold text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((p) => {
              const stock = Number(p.stock) || 0
              const statusLabel = stock <= 0 ? 'Out of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock'
              const statusClass =
                stock <= 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : stock <= 10
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              const draftQty = consumeDraft[String(p.id)] ?? 1
              const busy = consumingId === String(p.id)
              return (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-2 text-slate-500">{p.category}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-800">{stock}</td>
                  <td className="px-4 py-2 text-right text-slate-700">₹{Number(p.unitPrice || 0).toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        className="h-9 w-11 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => adjustConsume(p.id, -1)}
                        disabled={busy}
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={draftQty}
                        onChange={(e) => {
                          const v = e.target.value
                          setConsumeDraft((prev) => ({
                            ...prev,
                            [String(p.id)]: v === '' ? '' : Number(v),
                          }))
                        }}
                        className="w-20 h-9 rounded-lg border border-slate-200 bg-white px-2 text-right font-mono text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                        disabled={busy}
                      />
                      <button
                        type="button"
                        className="h-9 w-11 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => adjustConsume(p.id, 1)}
                        disabled={busy}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        className="h-9 w-11 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => adjustConsume(p.id, 5)}
                        disabled={busy}
                      >
                        +5
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                      onClick={() => consume(p)}
                      disabled={busy}
                    >
                      {busy ? 'Saving...' : 'Use'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {visibleProducts.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KitchenInventoryTab() {
  const [view, setView] = useState('products')

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            view === 'products' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setView('products')}
        >
          Inventory
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            view === 'menu' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setView('menu')}
        >
          Menu Stock
        </button>
      </div>

      {view === 'products' ? <KitchenProductInventoryView /> : <KitchenInventoryView />}
    </div>
  )
}

export default function KitchenDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const isSigningOutRef = useRef(false)
  const lastScheduleAutoSetAtRef = useRef(0)
  const kitchenConfigRef = useRef(null)
  
  const [kitchenConfig, setKitchenConfig] = useState({
    status: 'online',
    opening_time: '10:00',
    closing_time: '23:00'
  })
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [newDish, setNewDish] = useState({
    name: '',
    category: '',
    price: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
    daily_quantity: '50',
    size: 'Regular'
  })

  const menuItemsWithCounts = useMemo(() => {
    const active = (orders || []).filter(o => o && o.status !== 'completed' && o.status !== 'paid' && o.status !== 'draft')
    const counts = new Map()
    for (const order of active) {
      const lines = Array.isArray(order.items) ? order.items : []
      for (const line of lines) {
        const id = line?.id
        const qty = Number(line?.qty) || 0
        if (!id || qty <= 0) continue
        counts.set(String(id), (counts.get(String(id)) || 0) + qty)
      }
    }
    return (menuItems || []).map(item => ({
      ...item,
      pending_orders_count: counts.get(String(item.id)) || 0,
    }))
  }, [menuItems, orders])

  useEffect(() => {
    kitchenConfigRef.current = kitchenConfig
  }, [kitchenConfig])

  useEffect(() => {
    if (!auth?.currentUser) return

    const parseTimeToMinutes = (hhmm) => {
      const v = String(hhmm || '').trim()
      const [h, m] = v.split(':')
      const hh = Number(h)
      const mm = Number(m)
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
      if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null
      return hh * 60 + mm
    }

    const tick = () => {
      const cfg = kitchenConfigRef.current || kitchenConfig
      const opening = parseTimeToMinutes(cfg?.opening_time)
      const closing = parseTimeToMinutes(cfg?.closing_time)
      if (opening == null || closing == null) return

      const now = new Date()
      const nowMins = now.getHours() * 60 + now.getMinutes()
      const crossesMidnight = closing < opening
      const within = crossesMidnight ? nowMins >= opening || nowMins < closing : nowMins >= opening && nowMins < closing

      if (within) return
      if (String(cfg?.status || '').toLowerCase() !== 'online') return

      const nowMs = Date.now()
      if (nowMs - lastScheduleAutoSetAtRef.current < 60_000) return
      lastScheduleAutoSetAtRef.current = nowMs

      apiFetch('/api/kitchen/config', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'offline' }),
      }).catch((e) => {
        console.error('Failed to auto-set kitchen offline:', e)
      })
    }

    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [kitchenConfig?.opening_time, kitchenConfig?.closing_time, kitchenConfig?.status])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const cfg = await apiFetch('/api/kitchen/config')
        if (!cancelled) {
          setKitchenConfig((prev) => ({
            ...prev,
            ...(cfg || {}),
          }))
        }
      } catch (e) {
        console.error('Failed to load kitchen config:', e)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const reloadMenuAndOrders = async () => {
    const [menuRes, ordersRes] = await Promise.all([
      apiFetch('/api/menu'),
      apiFetch('/api/orders'),
    ])

    const menu = Array.isArray(menuRes.menu) ? menuRes.menu : []
    const orders = Array.isArray(ordersRes.orders) ? ordersRes.orders : []

    setMenuItems(menu)

    const mappedOrders = orders.map((o) => {
      const createdAt =
        o.createdAt?.toDate?.() ||
        (typeof o.createdAt === 'string' || o.createdAt instanceof Date
          ? new Date(o.createdAt)
          : null)
      const time = createdAt
        ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : ''
      const tableId = o.table || null
      return {
        id: o.id,
        source: tableId ? `Table ${tableId}` : 'Reception',
        type: o.source === 'reception' ? 'reception' : 'table',
        items: Array.isArray(o.items) ? o.items : [],
        table: tableId,
        status: o.status || 'received',
        time,
        raw: o,
      }
    })
    setOrders(mappedOrders)
  }

  useEffect(() => {
    const load = async () => {
      try {
        await reloadMenuAndOrders()
      } catch (e) {
        console.error('KitchenDashboard initial load error:', e)
      }
    }

    load()

    const s = io()
    s.on('menu:update', (menu) => {
      setMenuItems(Array.isArray(menu) ? menu : [])
    })
    s.on('orders:update', (ordersPayload) => {
      const list = Array.isArray(ordersPayload) ? ordersPayload : []
      const mapped = list.map((o) => {
        const createdAt =
          o.createdAt?.toDate?.() ||
          (typeof o.createdAt === 'string' || o.createdAt instanceof Date
            ? new Date(o.createdAt)
            : null)
        const time = createdAt
          ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''
        const tableId = o.table || null
        return {
          id: o.id,
          source: tableId ? `Table ${tableId}` : 'Reception',
          type: o.source === 'reception' ? 'reception' : 'table',
          items: Array.isArray(o.items) ? o.items : [],
          table: tableId,
          status: o.status || 'received',
          time,
          raw: o,
        }
      })
      setOrders(mapped)
    })

    return () => {
      s.close()
    }
  }, [])

  const handleLogout = async () => {
    isSigningOutRef.current = true
    try {
      // no-op: listeners now come from Socket.IO
    } catch (e) {
      console.error('Error stopping listeners:', e)
    }
    await signOut(auth)
    navigate('/', { replace: true })
  }

  const toggleKitchenStatus = async () => {
    const newStatus = kitchenConfig.status === 'online' ? 'offline' : 'online'
    try {
      const cfg = await apiFetch('/api/kitchen/config', {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setKitchenConfig((prev) => ({ ...prev, ...(cfg || {}), status: newStatus }))
    } catch (err) {
      console.error('Failed to toggle status', err)
    }
  }

  const saveSchedule = async () => {
    try {
      const cfg = await apiFetch('/api/kitchen/config', {
        method: 'PATCH',
        body: JSON.stringify({
          opening_time: kitchenConfig.opening_time,
          closing_time: kitchenConfig.closing_time,
        }),
      })
      setKitchenConfig((prev) => ({ ...prev, ...(cfg || {}) }))
      setIsScheduleModalOpen(false)
    } catch (err) {
      console.error('Failed to save schedule', err)
    }
  }

  const handleAddDish = async () => {
    if (!newDish.name) {
        alert("Please enter a dish name")
        return
    }
    
    try {
      await apiFetch('/api/menu', {
        method: 'POST',
        body: JSON.stringify({
          name: newDish.name,
          category: newDish.category || 'Main Course',
          price: Number(newDish.price) || 0,
          image_url: newDish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
          daily_quantity: Number(newDish.daily_quantity) || 50,
          size: newDish.size || 'Regular',
        }),
      })
      
      setIsAddModalOpen(false)
      setNewDish({
        name: '',
        category: '',
        price: '',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
        daily_quantity: '50',
        size: 'Regular'
      })
      alert("Dish added successfully!")
    } catch (error) {
      console.error("Error adding dish: ", error)
      alert(`Failed to add dish: ${error.message}`)
    }
  }

  const openEditDish = (dish) => {
    if (!dish) return
    setEditingDish({
      id: dish.id,
      name: dish.name || '',
      image_url: dish.image_url || '',
      size: dish.size || 'Regular',
    })
    setIsEditModalOpen(true)
  }

  const saveEditedDish = async () => {
    if (!editingDish?.id) return
    try {
      await apiFetch(`/api/menu/${editingDish.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          image_url: editingDish.image_url || null,
          size: editingDish.size || 'Regular',
        }),
      })
      setIsEditModalOpen(false)
      setEditingDish(null)
    } catch (e) {
      console.error('Failed to save dish:', e)
      alert('Failed to save dish changes.')
    }
  }

  const handleDeleteDish = async (id) => {
    if (confirm('Are you sure you want to delete this dish?')) {
      try {
        await apiFetch(`/api/menu/${id}`, { method: 'DELETE' })
      } catch (error) {
        console.error("Error deleting dish: ", error)
      }
    }
  }

  const handleUpdateQuantity = async (id, currentQty) => {
    const newQty = prompt('Enter new daily quantity:', String(currentQty))
    if (newQty !== null) {
      try {
        await apiFetch(`/api/inventory/items/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ daily_quantity: Number(newQty) || 0 }),
        })
      } catch (error) {
        console.error("Error updating quantity: ", error)
      }
    }
  }

  const finishOrder = async (order) => {
    if (!order) return
    if (order.status === 'completed' || order.status === 'paid') return
    const docId = order?.raw?._id || order?.id
    if (!docId) return
    try {
      await apiFetch(`/api/kitchen/orders/${docId}/finish`, {
        method: 'POST',
      })
      await reloadMenuAndOrders()
    } catch (e) {
      console.error('Failed to finish order:', e)
      alert(e?.message || 'Failed to complete order.')
    }
  }

  const setOrderStage = async (order, stage) => {
    if (!order) return
    if (stage === 'completed' || stage === 'finished') return finishOrder(order)
    if (stage === 'cooking' && order.status === 'cooking') return
    if (stage === 'pending' && order.status === 'pending') return
    const docId = order?.raw?._id || order?.id
    if (!docId) return
    const nextStatus = stage === 'cooking' ? 'cooking' : 'pending'
    try {
      await apiFetch(`/api/orders/${docId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      if (order.table) {
        await apiFetch(`/api/tables/${order.table}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'occupied' }),
        })
      }
    } catch (e) {
      console.error('Failed to update order stage:', e)
    }
  }

  const DashboardView = () => {
    const visibleOrders = orders.length > 0 ? orders : mockOrders
    const totalOrders = visibleOrders.length
    const pendingOrders = visibleOrders.filter(o => o.status === 'received' || o.status === 'pending').length
    const cookingOrders = visibleOrders.filter(o => o.status === 'kot' || o.status === 'cooking').length
    const lowStockItems = menuItems.filter(i => i.daily_quantity < 20)

    return (
      <div className="space-y-6">
        <StatsGrid>
          <StatCard>
            <StatInfo>
              <StatLabel>Pending Orders</StatLabel>
              <StatValue>{pendingOrders}</StatValue>
            </StatInfo>
            <StatIcon color="rose"><ClipboardList size={20} /></StatIcon>
          </StatCard>
          <StatCard>
            <StatInfo>
              <StatLabel>Cooking Now</StatLabel>
              <StatValue>{cookingOrders}</StatValue>
            </StatInfo>
            <StatIcon color="amber"><Clock size={20} /></StatIcon>
          </StatCard>
          <StatCard>
            <StatInfo>
              <StatLabel>Completed Today</StatLabel>
              <StatValue>{totalOrders - pendingOrders - cookingOrders}</StatValue>
            </StatInfo>
            <StatIcon color="emerald"><CheckCircle size={20} /></StatIcon>
          </StatCard>
          <StatCard>
            <StatInfo>
              <StatLabel>Low Stock Items</StatLabel>
              <StatValue>{lowStockItems.length}</StatValue>
            </StatInfo>
            <StatIcon color="blue"><AlertCircle size={20} /></StatIcon>
          </StatCard>
        </StatsGrid>

        <DashboardGrid>
          <Section>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Live Orders Feed</CardTitle>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-rose-600 font-medium hover:underline"
                >
                  View All
                </button>
              </CardHeader>
              <OrderList
                title="Orders"
                orders={visibleOrders.filter(o => o.status !== 'completed' && o.status !== 'paid').slice(0, 3)}
                onStageChange={setOrderStage}
              />
            </Card>
          </Section>
          
          <SideSection>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Kitchen Status</h3>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${kitchenConfig.status === 'online' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {kitchenConfig.status}
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Opening Time</span>
                  <span className="text-white font-mono">{kitchenConfig.opening_time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Closing Time</span>
                  <span className="text-white font-mono">{kitchenConfig.closing_time}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsScheduleModalOpen(true)}
                className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors"
              >
                Manage Schedule
              </button>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-500" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {lowStockItems.length === 0 && <p className="text-sm text-slate-500">All items are well stocked.</p>}
                {lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[140px]">{item.name}</span>
                    <span className="font-mono font-bold text-rose-600">{item.daily_quantity} left</span>
                  </div>
                ))}
              </div>
              {lowStockItems.length > 0 && (
                 <button 
                  onClick={() => setActiveTab('menu')}
                  className="w-full mt-4 text-xs text-center text-slate-500 hover:text-rose-600"
                 >
                   Manage Inventory
                 </button>
              )}
            </Card>
          </SideSection>
        </DashboardGrid>
      </div>
    )
  }

  const InventoryView = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState(null)
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState('all')
    const [draft, setDraft] = useState({})

    useEffect(() => {
      let cancelled = false
      const load = async () => {
        try {
          const data = await apiFetch('/api/inventory/items')
          if (!cancelled) {
            const list = Array.isArray(data.items) ? data.items : []
            setItems(list)
            setDraft((prev) => {
              const next = { ...prev }
              for (const it of list) {
                const id = String(it?.id || '')
                if (!id) continue
                if (next[id]) continue
                next[id] = {
                  qty: Number(it.daily_quantity) || 0,
                  cost: Number(it.cost_price) || 0,
                }
              }
              return next
            })
          }
        } catch (e) {
          console.error('Inventory load error:', e)
        } finally {
          if (!cancelled) setLoading(false)
        }
      }
      load()
      return () => {
        cancelled = true
      }
    }, [])

    const adjustDraftQty = (id, delta) => {
      setDraft((prev) => {
        const current = prev[String(id)] || { qty: 0, cost: 0 }
        const nextQty = Math.max(0, (Number(current.qty) || 0) + delta)
        return {
          ...prev,
          [String(id)]: {
            ...current,
            qty: nextQty,
          },
        }
      })
    }

    const saveItem = async (item) => {
      const id = String(item?.id || '')
      if (!id) return
      const d = draft[id]
      const nextQty = Number(d?.qty)
      const nextCost = Number(d?.cost)
      if (!Number.isFinite(nextQty) || nextQty < 0) {
        alert('Please enter a valid non-negative quantity.')
        return
      }
      if (!Number.isFinite(nextCost) || nextCost < 0) {
        alert('Please enter a valid non-negative cost price.')
        return
      }
      setSavingId(id)
      try {
        await apiFetch(`/api/inventory/items/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            daily_quantity: nextQty,
            cost_price: nextCost,
            available: nextQty > 0,
          }),
        })
        setItems((prev) =>
          prev.map((it) =>
            String(it.id) === id
              ? { ...it, daily_quantity: nextQty, cost_price: nextCost, available: nextQty > 0 }
              : it,
          ),
        )
      } catch (e) {
        console.error('Failed to update inventory item:', e)
        alert('Failed to update item. Please try again.')
      } finally {
        setSavingId(null)
      }
    }

    const resetItem = (item) => {
      const id = String(item?.id || '')
      if (!id) return
      setDraft((prev) => ({
        ...prev,
        [id]: {
          qty: Number(item.daily_quantity) || 0,
          cost: Number(item.cost_price) || 0,
        },
      }))
    }

    const counts = useMemo(() => {
      const list = Array.isArray(items) ? items : []
      let inStock = 0
      let low = 0
      let out = 0
      for (const it of list) {
        const qty = Number(it?.daily_quantity) || 0
        if (qty === 0) out += 1
        else if (qty > 0 && qty < 20) low += 1
        else inStock += 1
      }
      return { total: list.length, inStock, low, out }
    }, [items])

    const visibleItems = useMemo(() => {
      const q = String(query || '').trim().toLowerCase()
      return (Array.isArray(items) ? items : [])
        .filter((it) => {
          if (!it) return false
          const name = String(it.name || '').toLowerCase()
          const cat = String(it.category || '').toLowerCase()
          if (q && !name.includes(q) && !cat.includes(q)) return false
          const qty = Number(it.daily_quantity) || 0
          if (filter === 'out') return qty === 0
          if (filter === 'low') return qty > 0 && qty < 20
          if (filter === 'in') return qty >= 20
          return true
        })
        .sort((a, b) => {
          const aq = Number(a?.daily_quantity) || 0
          const bq = Number(b?.daily_quantity) || 0
          return aq - bq
        })
    }, [filter, items, query])

    if (loading) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          Loading inventory...
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Inventory Management</h3>
          <div className="text-xs text-slate-500 flex flex-wrap gap-2 justify-end">
            <span className="px-2 py-1 rounded-full border border-slate-200 bg-slate-50">
              Total: {counts.total}
            </span>
            <span className="px-2 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
              In stock: {counts.inStock}
            </span>
            <span className="px-2 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
              Low: {counts.low}
            </span>
            <span className="px-2 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700">
              Out: {counts.out}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by item or category..."
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="text-xs font-semibold text-slate-500">Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            >
              <option value="all">All items</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-500">Item</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-500">Category</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-500">Price</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-500">Cost</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-500">Daily Qty</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-500">Status</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map(item => {
                const qty = Number(item.daily_quantity) || 0
                const cost = Number(item.cost_price) || 0
                const low = qty > 0 && qty < 20
                const statusLabel =
                  qty === 0 ? 'Out of stock' : low ? 'Low' : 'In stock'
                const statusClass =
                  qty === 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : low
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-2 text-slate-500">{item.category}</td>
                    <td className="px-4 py-2 text-right text-slate-700">
                      ₹{Number(item.price || 0).toFixed(0)}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-700">
                      <div className="inline-flex items-center justify-end gap-2">
                        <span className="text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft[String(item.id)]?.cost ?? cost}
                          onChange={(e) => {
                            const v = e.target.value
                            setDraft((prev) => ({
                              ...prev,
                              [String(item.id)]: {
                                ...(prev[String(item.id)] || { qty, cost }),
                                cost: v === '' ? '' : Number(v),
                              },
                            }))
                          }}
                          className="w-24 h-9 rounded-lg border border-slate-200 bg-white px-2 text-right text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                          disabled={savingId === item.id}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                          onClick={() => adjustDraftQty(item.id, -5)}
                          disabled={savingId === item.id}
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                          onClick={() => adjustDraftQty(item.id, -1)}
                          disabled={savingId === item.id}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={draft[String(item.id)]?.qty ?? qty}
                          onChange={(e) => {
                            const v = e.target.value
                            setDraft((prev) => ({
                              ...prev,
                              [String(item.id)]: {
                                ...(prev[String(item.id)] || { qty, cost }),
                                qty: v === '' ? '' : Number(v),
                              },
                            }))
                          }}
                          className="w-20 h-9 rounded-lg border border-slate-200 bg-white px-2 text-right font-mono text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                          disabled={savingId === item.id}
                        />
                        <button
                          type="button"
                          className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                          onClick={() => adjustDraftQty(item.id, 1)}
                          disabled={savingId === item.id}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                          onClick={() => adjustDraftQty(item.id, 5)}
                          disabled={savingId === item.id}
                        >
                          +5
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                          onClick={() => resetItem(item)}
                          disabled={savingId === item.id}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                          onClick={() => saveItem(item)}
                          disabled={savingId === item.id}
                        >
                          {savingId === item.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {visibleItems.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <Container>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        kitchenStatus={kitchenConfig.status}
        onToggleStatus={toggleKitchenStatus}
      />

      <Main>
        <Header 
          title={
            <span>
              Kitchen <span className="text-rose-700">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'orders' ? 'Orders' : 
                 activeTab === 'menu' ? 'Menu' : 
                 activeTab === 'inventory' ? 'Inventory' : 'Portal'}
              </span>
            </span>
          }
          kitchenStatus={kitchenConfig.status}
          onToggleStatus={toggleKitchenStatus}
          onOpenSchedule={() => setIsScheduleModalOpen(true)}
        />

        <ContentScroll>
          {activeTab === 'dashboard' && <DashboardView />}
          
          {activeTab === 'orders' && (
             <div className="max-w-4xl mx-auto">
                <OrderList
                  orders={(orders.length > 0 ? orders : mockOrders)}
                  onStageChange={setOrderStage}
                />
             </div>
          )}
          
          {activeTab === 'menu' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
              <MenuManagement 
                menuItems={menuItemsWithCounts}
                onAddDish={() => setIsAddModalOpen(true)}
                onEditDish={openEditDish}
                onDeleteDish={handleDeleteDish}
                onUpdateQuantity={handleUpdateQuantity}
                onRefresh={reloadMenuAndOrders}
              />
            </div>
          )}

          {activeTab === 'inventory' && <KitchenInventoryTab />}
        </ContentScroll>
      </Main>

      <AddDishModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDish}
        newDish={newDish}
        setNewDish={setNewDish}
      />

      <EditDishModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingDish(null)
        }}
        dish={editingDish}
        setDish={setEditingDish}
        onSave={saveEditedDish}
      />

      <ScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={saveSchedule}
        config={kitchenConfig}
        setConfig={setKitchenConfig}
      />
    </Container>
  )
}
