import { useMemo, useState, useEffect } from 'react'
import Sidebar from '../ReceptionSidebar'
import Header from '../../layouts/Header'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import MenuGrid from '../menu/MenuGrid'
import OrderPanel from '../order/OrderPanel'
import BookTableModal from '../modals/BookTableModal'
import { apiFetch } from '../../services/api'
import { io } from 'socket.io-client'
import { printBill } from '../utils/printBill'

export default function POSPage(){
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [cart, setCart] = useState([])
  const [orderId, setOrderId] = useState(()=>String(Date.now()).slice(-6))
  const [diningType, setDiningType] = useState('')
  const [table, setTable] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [drafts, setDrafts] = useState([])
  const [showDrafts, setShowDrafts] = useState(false)
  const [tables, setTables] = useState([])
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [salesToday, setSalesToday] = useState({ amount: 0, count: 0 })
  const [salesMonth, setSalesMonth] = useState({ amount: 0, count: 0 })
  const [popularRankById, setPopularRankById] = useState({})
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const computeSales = (orders) => {
      const list = Array.isArray(orders) ? orders : []
      const now = new Date()
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      let todayAmount = 0
      let monthAmount = 0
      let todayCount = 0
      let monthCount = 0

      for (const o of list) {
        if (!o) continue
        const status = String(o.status || '').toLowerCase()
        const isSold = status === 'paid' || status === 'completed'
        if (!isSold) continue
        const rawDate = o.createdAt || o.created_at || o.updatedAt || o.updated_at
        const dt =
          rawDate?.toDate ? rawDate.toDate() :
          rawDate instanceof Date ? rawDate :
          rawDate ? new Date(rawDate) :
          null
        if (!dt || Number.isNaN(dt.getTime())) continue
        const computedTotal = Array.isArray(o.items)
          ? o.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0)
          : 0
        const total = Number(o.total ?? computedTotal) || 0
        if (dt >= startMonth) {
          monthAmount += total
          monthCount += 1
        }
        if (dt >= startToday) {
          todayAmount += total
          todayCount += 1
        }
      }

      setSalesToday({ amount: todayAmount, count: todayCount })
      setSalesMonth({ amount: monthAmount, count: monthCount })
    }

    const computePopularItems = (orders) => {
      const list = Array.isArray(orders) ? orders : []
      const now = new Date()
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      const counts = new Map()
      for (const o of list) {
        if (!o) continue
        const status = String(o.status || '').toLowerCase()
        const isSold = status === 'paid' || status === 'completed'
        if (!isSold) continue
        const rawDate = o.createdAt || o.created_at || o.updatedAt || o.updated_at
        const dt =
          rawDate?.toDate ? rawDate.toDate() :
          rawDate instanceof Date ? rawDate :
          rawDate ? new Date(rawDate) :
          null
        if (!dt || Number.isNaN(dt.getTime())) continue
        if (dt < startToday) continue

        const items = Array.isArray(o.items) ? o.items : []
        for (const it of items) {
          const id = String(it?.id || '').trim()
          const qty = Number(it?.qty || 0) || 0
          if (!id || qty <= 0) continue
          counts.set(id, (counts.get(id) || 0) + qty)
        }
      }

      const top = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)

      const rankMap = {}
      top.forEach(([id], idx) => {
        rankMap[id] = idx + 1
      })
      setPopularRankById(rankMap)
    }

    const loadInitial = async () => {
      try {
        const [menuRes, ordersRes, tablesRes] = await Promise.all([
          apiFetch('/api/menu'),
          apiFetch('/api/orders'),
          apiFetch('/api/tables'),
        ])

        const menu = Array.isArray(menuRes.menu) ? menuRes.menu : []
        const orders = Array.isArray(ordersRes.orders) ? ordersRes.orders : []
        const tablesList = Array.isArray(tablesRes.tables) ? tablesRes.tables : []

        const mappedMenu = menu.map(m => {
          const category = m.category || 'General'
          const inferredBrand = String(category).toLowerCase().includes('drink') ? 'Drinks' : 'Food'
          return {
            id: m.id,
            ...m,
            name: m.name || '',
            category,
            brand: m.brand || inferredBrand,
            price: Number(m.price) || 0,
            image: m.image || m.image_url || null,
            available: m.available ?? m.is_active ?? true,
          }
        })

        setMenuItems(mappedMenu)

        const normalizedOrders = orders.map(o => {
          const createdAt =
            o.createdAt?.toDate?.() ||
            (typeof o.createdAt === 'string' || o.createdAt instanceof Date
              ? new Date(o.createdAt)
              : null)
          return { ...o, createdAt }
        })
        setDrafts(normalizedOrders.filter(o => o.status === 'draft'))
        computeSales(normalizedOrders)
        computePopularItems(normalizedOrders)

        const byId = new Map()
        tablesList.forEach(t => byId.set(t.id, { id: t.id, ...t }))
        const nextTables = Array.from({ length: 10 }).map((_, i) => {
          const id = `T${i + 1}`
          return byId.get(id) || { id, status: 'available' }
        })
        setTables(nextTables)
      } catch (e) {
        console.error('POS initial load error:', e)
      }
    }

    loadInitial()

    const s = io()
    setSocket(s)

    s.on('menu:update', (menu) => {
      const list = Array.isArray(menu) ? menu : []
      const mapped = list.map(m => {
        const category = m.category || 'General'
        const inferredBrand = String(category).toLowerCase().includes('drink') ? 'Drinks' : 'Food'
        return {
          id: m.id,
          ...m,
          name: m.name || '',
          category,
          brand: m.brand || inferredBrand,
          price: Number(m.price) || 0,
          image: m.image || m.image_url || null,
          available: m.available ?? m.is_active ?? true,
        }
      })
      setMenuItems(mapped)
    })

    s.on('orders:update', (orders) => {
      const list = Array.isArray(orders) ? orders : []
      const normalized = list.map(o => {
        const createdAt =
          o.createdAt?.toDate?.() ||
          (typeof o.createdAt === 'string' || o.createdAt instanceof Date
            ? new Date(o.createdAt)
            : null)
        return { ...o, createdAt }
      })
      setDrafts(normalized.filter(o => o.status === 'draft'))
      computeSales(normalized)
      computePopularItems(normalized)
    })

    s.on('tables:update', (tablesPayload) => {
      const tablesList = Array.isArray(tablesPayload) ? tablesPayload : []
      const byId = new Map()
      tablesList.forEach(t => byId.set(t.id, { id: t.id, ...t }))
      const nextTables = Array.from({ length: 10 }).map((_, i) => {
        const id = `T${i + 1}`
        return byId.get(id) || { id, status: 'available' }
      })
      setTables(nextTables)
    })

    return () => {
      s.close()
    }
  }, [])

  const categories = useMemo(()=>['All', ...Array.from(new Set(menuItems.map(m=>m.category)))],[menuItems])
  const brands = ['All','Food','Drinks']
  const filtered = menuItems.filter(m => 
    (category && category!=='All'? m.category===category:true) &&
    (brand && brand!=='All'? m.brand===brand : true) &&
    m.name.toLowerCase().includes(query.toLowerCase())
  )

  const filteredWithPopular = useMemo(() => {
    const rank = popularRankById || {}
    return filtered.map((m) => ({
      ...m,
      popularRank: rank[m.id] || 0,
    }))
  }, [filtered, popularRankById])

  const salesFormatter = useMemo(() => new Intl.NumberFormat('en-IN'), [])
  const monthExcludingToday = Math.max(0, (salesMonth.amount || 0) - (salesToday.amount || 0))
  const monthTotal = Math.max(0, salesMonth.amount || 0)

  const tableCounts = useMemo(() => {
    const list = Array.isArray(tables) ? tables : []
    const available = list.filter(t => (t.status || 'available') === 'available').length
    const reserved = list.filter(t => t.status === 'reserved').length
    const occupied = list.filter(t => t.status === 'occupied').length
    return { total: list.length, available, reserved, occupied }
  }, [tables])

  const SalesDonut = ({ today, restOfMonth, total, todayCount }) => {
    const r = 18
    const c = 2 * Math.PI * r
    const todayLen = total > 0 ? (today / total) * c : 0
    const restLen = total > 0 ? (restOfMonth / total) * c : 0

    return (
      <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
        <g transform="translate(28 28) rotate(-90)">
          <circle r={r} cx="0" cy="0" fill="transparent" stroke="#e2e8f0" strokeWidth="10" />
          {total > 0 && (
            <>
              <circle
                r={r}
                cx="0"
                cy="0"
                fill="transparent"
                stroke="#e11d48"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${todayLen} ${Math.max(0, c - todayLen)}`}
                strokeDashoffset="0"
              />
              <circle
                r={r}
                cx="0"
                cy="0"
                fill="transparent"
                stroke="#0f172a"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${restLen} ${Math.max(0, c - restLen)}`}
                strokeDashoffset={-todayLen}
              />
            </>
          )}
        </g>
        <text
          x="28"
          y="28"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-900 text-[12px] font-bold"
        >
          {Number(todayCount || 0)}
        </text>
        <text
          x="28"
          y="40"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-500 text-[8px] font-semibold"
        >
          sales today
        </text>
      </svg>
    )
  }

  function addItem(item){
    setCart(prev=>{
      const idx = prev.findIndex(x=>x.id===item.id)
      if (idx>-1){ const copy=[...prev]; copy[idx] = {...copy[idx], qty: copy[idx].qty+1}; return copy }
      return [...prev, { id:item.id, name:item.name, price:item.price, qty:1 }]
    })
  }
  function inc(id){ setCart(prev=>prev.map(x=>x.id===id?{...x,qty:x.qty+1}:x)) }
  function dec(id){ setCart(prev=>prev.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty-1)}:x)) }
  function removeItem(id){ setCart(prev=>prev.filter(x=>x.id!==id)) }
  function newOrder(){
    setCart([])
    setQuery('')
    setCategory('All')
    setBrand('All')
    setDiningType('')
    setTable('')
    setOrderId(String(Date.now()).slice(-6))
  }
  function onDiningChange(val){
    setDiningType(val)
    if (val !== 'Dine-in') setTable('')
  }

  async function onPlaceOrder(actionType, billMeta) {
    if (cart.length === 0) return alert('Cart is empty')
    if (!diningType) return alert('Select dining type')
    if (diningType === 'Dine-in' && !table) return alert('Select a table')

    let status = 'received'
    if (actionType === 'draft') status = 'draft'
    else if (actionType === 'kot') status = 'kot'
    else if (actionType === 'bill') status = 'billed'
    else if (actionType === 'print') status = 'paid'

    const localOrderId = orderId
    const orderPayload = {
      id: String(localOrderId),
      items: cart,
      type: diningType.toLowerCase(),
      status,
      table: diningType === 'Dine-in' ? table : null,
      bill: billMeta || undefined,
      source: 'reception',
      destination: 'kitchen',
    }

    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      })

      if (diningType === 'Dine-in' && table) {
        const nextTableStatus = status === 'draft' ? 'reserved' : 'occupied'
        await apiFetch(`/api/tables/${table}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextTableStatus,
            currentOrderId: status === 'draft' ? null : String(localOrderId),
          }),
        })
      }
      
      // Auto-print if the action implies billing
      if (actionType === 'print' || actionType === 'bill') {
        printBill(orderPayload)
      }
    } catch (err) {
      console.error(err)
    }

    newOrder()
    if (actionType === 'kot') alert('KOT Printed (Sent to Kitchen)')
    if (actionType === 'draft') alert('Order Saved to Drafts')
    if (actionType === 'print' || actionType === 'bill') alert('Bill Generated & Paid')
  }

  const bookTable = async ({ tableId, name, phone }) => {
    try {
      await apiFetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'reserved',
          reservedBy: name || null,
          phone: phone || null,
        }),
      })
      setIsBookModalOpen(false)
    } catch (e) {
      console.error('Failed to book table:', e)
      alert('Failed to book table.')
    }
  }

  function loadDraft(order) {
    setCart(order.items)
    setOrderId(order.id)
    setDiningType(order.type === 'dine-in' ? 'Dine-in' : 'Takeaway')
    setTable(order.table || '')
    setShowDrafts(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr_24rem] bg-slate-50">
      <Sidebar/>
      <div className="flex flex-col min-w-0">
        <Header
          title={<span>Reception <span className="text-rose-700">POS</span></span>}
        />

        <main className="p-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-500">Sales</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">
                    ₹{salesFormatter.format(salesToday.amount || 0)}
                    <span className="text-sm font-semibold text-slate-500"> today</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {salesToday.count || 0} finished orders today • ₹{salesFormatter.format(monthTotal)} this month
                  </div>
                </div>
                <SalesDonut today={salesToday.amount || 0} todayCount={salesToday.count || 0} restOfMonth={monthExcludingToday} total={monthTotal} />
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-rose-600" />
                  <span className="text-slate-600">Today</span>
                  <span className="font-semibold text-slate-900">₹{salesFormatter.format(salesToday.amount || 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-slate-900" />
                  <span className="text-slate-600">Month (excl. today)</span>
                  <span className="font-semibold text-slate-900">₹{salesFormatter.format(monthExcludingToday)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-500">Tables</div>
                <Button variant="outline" onClick={() => setIsBookModalOpen(true)}>Book Table</Button>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500">Total</div>
                  <div className="text-xl font-bold text-slate-900">{tableCounts.total}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-xs font-semibold text-emerald-700">Available</div>
                  <div className="text-xl font-bold text-emerald-800">{tableCounts.available}</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-xs font-semibold text-amber-700">Reserved</div>
                  <div className="text-xl font-bold text-amber-800">{tableCounts.reserved}</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <div className="text-xs font-semibold text-rose-700">Occupied</div>
                  <div className="text-xl font-bold text-rose-800">{tableCounts.occupied}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {tables.map(t => (
                  <div
                    key={t.id}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border ${
                      (t.status || 'available') === 'available'
                        ? 'bg-white border-slate-200 text-slate-900'
                        : t.status === 'reserved'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {t.id}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch justify-between mb-4">
            <Input placeholder="Search in products" value={query} onChange={e=>setQuery(e.target.value)} className="sm:max-w-xs" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setShowDrafts(!showDrafts)}>
                Active Tables ({drafts.length})
              </Button>
              <Select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</Select>
              <Select value={brand} onChange={e=>setBrand(e.target.value)}><option>All</option>{brands.slice(1).map(b=><option key={b}>{b}</option>)}</Select>
              <Button variant="secondary" onClick={newOrder}>New Order</Button>
            </div>
          </div>

          {showDrafts && (
            <div className="absolute top-20 right-6 left-6 bg-white shadow-xl border rounded-xl z-10 p-4 max-h-[80vh] overflow-auto">
              <h2 className="text-xl font-bold mb-4">Active Table Orders (Drafts)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drafts.length===0 && <div className="text-gray-500">No active drafts</div>}
                {drafts.map(d => (
                  <div key={d.id} className="border p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={()=>loadDraft(d)}>
                    <div className="font-bold flex justify-between">
                      <span>{d.table || 'Takeaway'}</span>
                      <span>#{d.id}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {d.items.length} items • ₹{d.total}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <MenuGrid items={filteredWithPopular} onAdd={addItem}/>
        </main>
      </div>
      <OrderPanel 
        orderId={orderId} 
        cart={cart} 
        onInc={inc} 
        onDec={dec} 
        onRemove={removeItem} 
        gstRate={0.05} 
        serviceChargeRate={0} 
        diningType={diningType} 
        onDiningChange={onDiningChange} 
        table={table} 
        onTableChange={setTable}
        onPlaceOrder={onPlaceOrder}
        tables={tables}
      />
      <BookTableModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        tables={tables}
        onBook={bookTable}
      />
    </div>
  )
}
