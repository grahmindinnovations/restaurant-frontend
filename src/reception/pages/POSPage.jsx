import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseReady } from '../../services/firebase'
import Sidebar from '../ReceptionSidebar'
import Header from '../../layouts/Header'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import MenuGrid from '../menu/MenuGrid'
import OrderPanel from '../order/OrderPanel'
import BookTableModal from '../modals/BookTableModal'
import { apiFetch } from '../../services/api'
import { createSocket } from '../../services/socket'
import { printBill } from '../utils/printBill'
import PageNotice from '../components/PageNotice'
import { refreshReceptionNotifications } from '../utils/refreshNotifications'
import { refreshReceptionTables } from '../utils/refreshTables'
import { resolveMenuImageUrl } from '../../lib/menuImageUrl'
import { normalizeTablesFromApi } from '../utils/normalizeTables'
import { orderLineTotal } from '../utils/orderTotals'
import { canContinueOrder, cartItemsFromOrder } from '../utils/orderContinue'
import { useRestaurantSettings } from '../../hooks/useRestaurantSettings'

export default function POSPage(){
  const navigate = useNavigate()
  const location = useLocation()
  const { settings: restaurantSettings } = useRestaurantSettings()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [cart, setCart] = useState([])
  const [orderId, setOrderId] = useState(()=>String(Date.now()).slice(-6))
  const [diningType, setDiningType] = useState('')
  const [table, setTable] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [drafts, setDrafts] = useState([])
  const [openOrders, setOpenOrders] = useState([])
  const [continuingOrder, setContinuingOrder] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [tables, setTables] = useState([])
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [salesToday, setSalesToday] = useState({ amount: 0, count: 0 })
  const [popularRankById, setPopularRankById] = useState({})
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', message: string }
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const computeSales = (orders) => {
      const list = Array.isArray(orders) ? orders : []
      const now = new Date()
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      let todayAmount = 0
      let todayCount = 0

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
        const total = orderLineTotal(o)
        if (dt >= startToday) {
          todayAmount += total
          todayCount += 1
        }
      }

      setSalesToday({ amount: todayAmount, count: todayCount })
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
      setDataLoading(true)
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
            image: resolveMenuImageUrl(m.image || m.image_url),
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
        setOpenOrders(normalizedOrders.filter((o) => canContinueOrder(o)))
        computeSales(normalizedOrders)
        computePopularItems(normalizedOrders)

        setTables(normalizeTablesFromApi(tablesList))
      } catch (e) {
        console.error('POS initial load error:', e)
        const msg = String(e?.message || '')
        if (msg.includes('401') || msg.includes('Missing Authorization')) {
          setNotice({ type: 'error', message: 'Session expired. Please sign in again.' })
          navigate('/login', { replace: true })
        } else {
          setNotice({ type: 'error', message: 'Could not load menu. Check backend and refresh.' })
        }
      } finally {
        setDataLoading(false)
      }
    }

    if (!firebaseReady || !auth) {
      navigate('/login', { replace: true })
      return undefined
    }

    let socket = null
    let didLoadForSession = false
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        didLoadForSession = false
        if (socket) {
          socket.close()
          socket = null
        }
        navigate('/login', { replace: true })
        return
      }
      if (!didLoadForSession) {
        didLoadForSession = true
        loadInitial()
      }
      if (!socket) {
        socket = createSocket()
        socket.on('menu:update', (menu) => {

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
              image: resolveMenuImageUrl(m.image || m.image_url),
              available: m.available ?? m.is_active ?? true,
            }
          })
          setMenuItems(mapped)
        })

        socket.on('orders:update', (orders) => {
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
          setOpenOrders(normalized.filter((o) => canContinueOrder(o)))
          computeSales(normalized)
          computePopularItems(normalized)
        })

        socket.on('tables:update', (payload) => {
          setTables(normalizeTablesFromApi(payload))
        })

        const onTablesRefresh = async () => {
          try {
            const tablesRes = await apiFetch('/api/tables')
            setTables(normalizeTablesFromApi(tablesRes.tables))
          } catch (e) {
            console.error('POS tables refresh error:', e)
          }
        }
        window.addEventListener('reception:tables-refresh', onTablesRefresh)
        socket._tablesRefreshHandler = onTablesRefresh
      }
    })

    return () => {
      unsubAuth()
      if (socket) {
        if (socket._tablesRefreshHandler) {
          window.removeEventListener('reception:tables-refresh', socket._tablesRefreshHandler)
        }
        socket.close()
      }
    }
  }, [navigate])

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

  const tableCounts = useMemo(() => {
    const list = Array.isArray(tables) ? tables : []
    const available = list.filter(t => (t.status || 'available') === 'available').length
    const reserved = list.filter(t => t.status === 'reserved').length
    const occupied = list.filter(t => t.status === 'occupied').length
    return { total: list.length, available, reserved, occupied }
  }, [tables])

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
    setContinuingOrder(false)
  }
  function onDiningChange(val){
    setDiningType(val)
    if (val !== 'Dine-in') setTable('')
  }

  async function onPlaceOrder(actionType, billMeta) {
    setNotice(null)
    if (cart.length === 0) {
      setNotice({ type: 'error', message: 'Cart is empty. Add at least one item.' })
      return
    }
    if (!diningType) {
      setNotice({ type: 'error', message: 'Please select dining type.' })
      return
    }
    if (diningType === 'Dine-in' && !table) {
      setNotice({ type: 'error', message: 'Please select a table for dine-in orders.' })
      return
    }

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
            ...(status === 'draft' ? {} : { reservedBy: null, phone: null }),
          }),
        })
        refreshReceptionTables()
      }
      
      // Auto-print if the action implies billing
      if (actionType === 'print' || actionType === 'bill') {
        printBill(orderPayload, restaurantSettings)
      }
    } catch (err) {
      console.error(err)
      setNotice({ type: 'error', message: 'Could not save the order. Please try again.' })
      return
    }

    newOrder()
    if (actionType === 'kot') {
      setNotice({
        type: 'success',
        message: continuingOrder
          ? 'Additional items sent to kitchen.'
          : 'KOT sent to kitchen.',
      })
    }
    if (actionType === 'draft') {
      setNotice({
        type: 'success',
        message: diningType === 'Dine-in' && table
          ? `Order saved. Table ${table} stays reserved until you send KOT.`
          : 'Order saved.',
      })
    }
    if (actionType === 'print' || actionType === 'bill') setNotice({ type: 'success', message: 'Bill generated.' })
    refreshReceptionNotifications()
  }

  const bookTable = async ({ tableId, name, phone }) => {
    setNotice(null)
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
      setNotice({ type: 'success', message: `Table ${tableId} booked.` })
      refreshReceptionTables()
      refreshReceptionNotifications()
    } catch (e) {
      console.error('Failed to book table:', e)
      setNotice({ type: 'error', message: 'Failed to book table. Please try again.' })
    }
  }

  const reservedTables = useMemo(
    () => (Array.isArray(tables) ? tables : []).filter((t) => t.status === 'reserved'),
    [tables],
  )

  const continueOrder = useCallback((order) => {
    if (!order?.id || !canContinueOrder(order)) {
      setNotice({ type: 'error', message: 'This order cannot be edited on POS.' })
      return
    }
    setCart(cartItemsFromOrder(order))
    setOrderId(String(order.id))
    setDiningType(order.type === 'dine-in' ? 'Dine-in' : 'Takeaway')
    setTable(order.table || '')
    setContinuingOrder(true)
    setShowDrafts(false)
    setNotice({
      type: 'success',
      message: `Order #${order.id} — add items, then Send more to KOT.`,
    })
  }, [])

  useEffect(() => {
    const order = location.state?.continueOrder
    if (!order?.id) return
    continueOrder(order)
    navigate('/pos', { replace: true, state: null })
  }, [location.state, continueOrder, navigate])

  async function continueTableOrder(tableRow) {
    const oid = String(tableRow?.currentOrderId || '')
    if (!oid) {
      setNotice({ type: 'error', message: 'No active order on this table.' })
      return
    }
    let order = openOrders.find((o) => String(o.id) === oid)
    if (!order) {
      try {
        const data = await apiFetch('/api/orders')
        const list = Array.isArray(data.orders) ? data.orders : []
        order = list.find((o) => String(o.id) === oid)
      } catch (e) {
        console.error('Load order for table:', e)
        setNotice({ type: 'error', message: 'Could not load order. Try again.' })
        return
      }
    }
    if (!order || !canContinueOrder(order)) {
      setNotice({ type: 'error', message: 'Order not found or already paid.' })
      return
    }
    continueOrder(order)
  }

  function startReservedTable(t) {
    setCart([])
    setOrderId(String(Date.now()).slice(-6))
    setDiningType('Dine-in')
    setTable(t.id)
    setContinuingOrder(false)
    setShowDrafts(false)
    const guest = [t.reservedBy, t.phone].filter(Boolean).join(' · ')
    setNotice({
      type: 'success',
      message: guest
        ? `Table ${t.id} (${guest}) — add items, then Send KOT when the customer is seated.`
        : `Table ${t.id} — add items, then Send KOT when the customer is seated.`,
    })
  }

  function loadDraft(order) {
    setCart(cartItemsFromOrder(order))
    setOrderId(order.id)
    setDiningType(order.type === 'dine-in' ? 'Dine-in' : 'Takeaway')
    setTable(order.table || '')
    setContinuingOrder(false)
    setShowDrafts(false)
  }

  const occupiedTables = useMemo(
    () =>
      (Array.isArray(tables) ? tables : []).filter(
        (t) => t.status === 'occupied' && t.currentOrderId,
      ),
    [tables],
  )

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[14rem_1fr_19rem] bg-neutral-100">
      <Sidebar/>
      <div className="flex flex-col min-w-0">
        <Header title="Point of sale" showUserMenu showNotifications />

        <main className="flex flex-col min-h-0 flex-1 p-2 md:p-3 relative">
          <PageNotice message={notice?.message} />

          <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-600 shrink-0">
              <span>
                Today <span className="font-semibold text-neutral-900">₹{salesFormatter.format(salesToday.amount || 0)}</span>
                <span className="text-neutral-400"> · </span>
                {salesToday.count || 0} orders
              </span>
              <span className="text-neutral-300 hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                {tableCounts.available} free · {tableCounts.reserved} res · {tableCounts.occupied} busy
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] rounded-md shrink-0"
              onClick={() => setIsBookModalOpen(true)}
            >
              Book
            </Button>

            <div className="hidden sm:block h-5 w-px bg-neutral-200 shrink-0" aria-hidden />

            <Input
              placeholder="Search…"
              value={query}
              onChange={e=>setQuery(e.target.value)}
              className="h-7 min-w-[7rem] flex-1 sm:flex-none sm:w-36 text-xs rounded-md border-neutral-200 px-2"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] rounded-md shrink-0"
              onClick={()=>setShowDrafts(!showDrafts)}
            >
              Saved ({drafts.length})
            </Button>
            <Select
              value={category}
              onChange={e=>setCategory(e.target.value)}
              className="h-7 w-[5.5rem] text-xs rounded-md border-neutral-200 px-2 py-0"
              title="Category"
            >
              <option value="">Category</option>
              {categories.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
            </Select>
            <Select
              value={brand}
              onChange={e=>setBrand(e.target.value)}
              className="h-7 w-[5.5rem] text-xs rounded-md border-neutral-200 px-2 py-0"
              title="Brand"
            >
              <option value="">Brand</option>
              {brands.slice(1).map(b=><option key={b} value={b}>{b}</option>)}
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] rounded-md shrink-0 sm:ml-auto"
              onClick={newOrder}
            >
              New
            </Button>
          </div>

          {occupiedTables.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
              <span className="text-[11px] font-medium text-neutral-700 shrink-0">In service — add items?</span>
              {occupiedTables.map((t) => (
                <Button
                  key={t.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] rounded-md"
                  onClick={() => continueTableOrder(t)}
                >
                  {t.id} · #{t.currentOrderId}
                </Button>
              ))}
            </div>
          )}

          {reservedTables.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
              <span className="text-[11px] font-medium text-neutral-700 shrink-0">Reserved — guest arrived?</span>
              {reservedTables.map((t) => (
                <Button
                  key={t.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] rounded-md"
                  onClick={() => startReservedTable(t)}
                >
                  {t.id}
                  {t.reservedBy ? ` · ${t.reservedBy}` : ''}
                </Button>
              ))}
            </div>
          )}

          {showDrafts && (
            <div className="absolute top-16 left-4 right-4 z-10 rounded-xl border border-neutral-200 bg-white shadow-lg p-4 max-h-[70vh] overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-900">Saved drafts (in-progress orders)</h2>
                <button type="button" className="text-sm text-neutral-500 hover:text-neutral-900" onClick={() => setShowDrafts(false)}>
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {drafts.length===0 && <p className="text-sm text-neutral-500">No saved orders</p>}
                {drafts.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    className="text-left rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50"
                    onClick={()=>loadDraft(d)}
                  >
                    <div className="font-medium text-neutral-900 flex justify-between text-sm">
                      <span>{d.table || 'Takeaway'}</span>
                      <span className="text-neutral-500">#{d.id}</span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {d.items.length} items · ₹{d.total}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto pb-2">
            {dataLoading && menuItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">Loading menu…</p>
            ) : (
              <MenuGrid items={filteredWithPopular} onAdd={addItem}/>
            )}
          </div>
        </main>
      </div>
      <OrderPanel 
        orderId={orderId} 
        cart={cart} 
        onInc={inc} 
        onDec={dec} 
        onRemove={removeItem} 
        gstRate={(restaurantSettings.gstPercent || 0) / 100}
        gstEnabled={restaurantSettings.gstEnabled}
        serviceChargeAmount={restaurantSettings.serviceChargeAmount}
        serviceChargeEnabled={restaurantSettings.serviceChargeEnabled}
        serviceChargeDineInOnly={restaurantSettings.serviceChargeDineInOnly}
        diningType={diningType} 
        onDiningChange={onDiningChange} 
        table={table} 
        onTableChange={setTable}
        onPlaceOrder={onPlaceOrder}
        tables={tables}
        continuingOrder={continuingOrder}
        activeOrderTableId={continuingOrder ? table : null}
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
