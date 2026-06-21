import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { createSocket } from '../services/socket'
import { apiFetch } from '../services/api'
import { auth } from '../services/firebase'
import { clearActiveRole } from '../auth/config/activeRoleStorage'

function formatOrderTime(value) {
  if (!value) return '—'
  const dt =
    value?.toDate?.() ||
    (value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null)
  if (!dt || Number.isNaN(dt.getTime())) return '—'
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function orderLabel(order) {
  if (order?.type === 'takeaway') return 'Parcel'
  return order?.table ? `Table ${order.table}` : 'Dine-in'
}

function normalizeMenu(list) {
  const raw = Array.isArray(list) ? list : []
  return raw.map((m) => ({
    ...m,
    id: m.id,
    name: m.name || '',
    category: m.category || 'General',
    price: Number(m.price) || 0,
    image: m.image || m.image_url || null,
    available: m.available ?? m.is_active ?? true,
    destination: m.destination || 'kitchen',
  }))
}

function kitchenLines(order) {
  const items = Array.isArray(order?.items) ? order.items : []
  return items.filter((line) => {
    if (line?.destination === 'kitchen' || !line?.destination) return true
    return line.destination === 'kitchen'
  })
}

export default function KitchenDisplay() {
  const navigate = useNavigate()
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [view, setView] = useState('live-orders')
  const [finishingId, setFinishingId] = useState(null)
  const [notice, setNotice] = useState(null)

  const applyKotOrders = useCallback((allOrders) => {
    const list = Array.isArray(allOrders) ? allOrders : []
    setOrders(list.filter((o) => String(o?.status || '').toLowerCase() === 'kot'))
  }, [])

  useEffect(() => {
    apiFetch('/api/menu')
      .then((d) => setMenu(normalizeMenu(d?.menu)))
      .catch((err) => console.error('Error fetching menu:', err))

    apiFetch('/api/orders?status=kot')
      .then((d) => applyKotOrders(d.orders))
      .catch((err) => console.error('Error fetching orders:', err))

    const socket = createSocket()
    socket.on('menu:update', (next) => setMenu(normalizeMenu(next)))
    socket.on('orders:update', applyKotOrders)

    return () => socket.close()
  }, [applyKotOrders])

  const toggleAvailability = (item) => {
    const updatedItem = { ...item, available: !item.available }
    setMenu((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)))
    apiFetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ available: updatedItem.available }),
    }).catch((err) => {
      console.error(err)
      setMenu((prev) => prev.map((i) => (i.id === item.id ? item : i)))
      setNotice('Could not update item availability.')
    })
  }

  const finishOrder = async (orderId) => {
    if (!orderId) return
    setFinishingId(orderId)
    setNotice(null)
    try {
      await apiFetch(`/api/kitchen/orders/${encodeURIComponent(orderId)}/finish`, {
        method: 'POST',
      })
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setNotice(`Order #${orderId} completed.`)
    } catch (err) {
      console.error(err)
      setNotice(`Failed to complete order #${orderId}.`)
    } finally {
      setFinishingId(null)
    }
  }

  const updateGuestLifecycle = async (orderId, guestLifecycle, estimatedMinutes) => {
    if (!orderId) return
    setFinishingId(orderId)
    setNotice(null)
    try {
      await apiFetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: guestLifecycle === 'served' || guestLifecycle === 'bill_ready' ? 'billed' : 'kot',
          guestLifecycle: guestLifecycle === 'served' ? 'bill_ready' : guestLifecycle,
          estimatedMinutes,
        }),
      })
      if (guestLifecycle === 'served' || guestLifecycle === 'bill_ready') {
        setOrders((prev) => prev.filter((o) => o.id !== orderId))
      }
      setNotice(`Order #${orderId} → ${guestLifecycle}`)
    } catch (err) {
      console.error(err)
      setNotice(`Failed to update order #${orderId}.`)
    } finally {
      setFinishingId(null)
    }
  }

  const guestLifecycleAction = (order) => {
    const lc = String(order.guestLifecycle || 'placed').toLowerCase()
    if (lc === 'placed' || lc === 'received') {
      return { label: 'Start preparing · 12 min', next: 'preparing', mins: 12 }
    }
    if (lc === 'preparing') return { label: 'Mark ready', next: 'ready' }
    if (lc === 'ready') return { label: 'Mark served → bill guest', next: 'served' }
    return null
  }

  const kitchenItems = menu.filter((m) => m.destination === 'kitchen' || !m.destination)

  const handleLogout = async () => {
    try {
      clearActiveRole()
      if (auth) await signOut(auth)
    } catch (err) {
      console.error('Logout failed:', err)
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Kitchen</h1>
            <p className="text-[11px] text-neutral-500">
              {orders.length} KOT{orders.length === 1 ? '' : 's'} waiting
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={view === 'live-orders' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs rounded-md"
              onClick={() => setView('live-orders')}
            >
              KOT queue
            </Button>
            <Button
              variant={view === 'availability' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs rounded-md"
              onClick={() => setView('availability')}
            >
              Item availability
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-md gap-1.5 ml-1"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-3 md:p-4 max-w-6xl mx-auto">
        {notice && (
          <div
            className="mb-2 rounded-lg border-2 border-neutral-800 bg-white px-3 py-2 text-sm font-medium text-neutral-900"
            role="status"
          >
            {notice}
          </div>
        )}

        {view === 'live-orders' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orders.length === 0 && (
              <p className="text-sm text-neutral-500 col-span-full py-12 text-center">
                No KOTs in queue. New orders appear here when reception sends KOT.
              </p>
            )}
            {orders.map((order) => {
              const lines = kitchenLines(order)
              const displayLines = lines.length > 0 ? lines : order.items || []
              return (
                <Card
                  key={order.id}
                  className="border border-neutral-200 shadow-sm border-l-4 border-l-neutral-900"
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="font-semibold text-neutral-900">#{order.id}</span>
                        <p className="text-[11px] text-neutral-500">{formatOrderTime(order.createdAt)}</p>
                        {order.source === 'guest' && (
                          <p className="text-[10px] font-semibold text-amber-800 mt-0.5">
                            Guest · {String(order.guestLifecycle || 'placed')}
                            {order.estimatedMinutes ? ` · ~${order.estimatedMinutes} min` : ''}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-800">
                        {orderLabel(order)}
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm text-neutral-800 mb-3">
                      {displayLines.map((item, idx) => (
                        <li
                          key={`${item.id || item.name}-${idx}`}
                          className="flex justify-between border-b border-dashed border-neutral-200 py-1"
                        >
                          <span>{item.name}</span>
                          <span className="font-semibold tabular-nums">×{item.qty}</span>
                        </li>
                      ))}
                    </ul>
                    {order.source === 'guest' && guestLifecycleAction(order) ? (
                      <Button
                        className="w-full h-10 rounded-lg text-sm font-semibold"
                        disabled={finishingId === order.id}
                        onClick={() => {
                          const act = guestLifecycleAction(order)
                          updateGuestLifecycle(order.id, act.next, act.mins)
                        }}
                      >
                        {finishingId === order.id ? 'Updating…' : guestLifecycleAction(order).label}
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-10 rounded-lg text-sm font-semibold"
                        disabled={finishingId === order.id}
                        onClick={() => finishOrder(order.id)}
                      >
                        {finishingId === order.id ? 'Completing…' : 'Complete'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {kitchenItems.map((item) => (
              <Card
                key={item.id}
                className={`border border-neutral-200 ${!item.available ? 'opacity-70 bg-neutral-50' : 'bg-white'}`}
              >
                <CardContent className="p-3 flex flex-col gap-2">
                  <h3 className="font-medium text-sm text-neutral-900">{item.name}</h3>
                  <p className="text-[11px] text-neutral-500">{item.category}</p>
                  <Button
                    variant={item.available ? 'outline' : 'default'}
                    size="sm"
                    className="w-full h-8 text-xs rounded-md"
                    onClick={() => toggleAvailability(item)}
                  >
                    {item.available ? 'Mark unavailable' : 'Mark available'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
