import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../ReceptionSidebar'
import Header from '../../layouts/Header'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import Modal from '../../components/common/Modal'
import { Button as FormButton } from '../../components/common/Forms'
import { io } from 'socket.io-client'
import { apiFetch } from '../../services/api'
import { printBill } from '../utils/printBill'
import PageNotice from '../components/PageNotice'
import { refreshReceptionNotifications } from '../utils/refreshNotifications'
import { orderLineTotal, formatInr } from '../utils/orderTotals'
import { useReceptionAuth } from '../hooks/useReceptionAuth'
import { canContinueOrder, canCancelOrder } from '../utils/orderContinue'
import { refreshReceptionTables } from '../utils/refreshTables'

function normalizeOrders(list) {
  return (Array.isArray(list) ? list : [])
    .filter((o) => o && String(o.status || '').toLowerCase() !== 'draft')
    .map((o) => ({
      ...o,
      items: Array.isArray(o.items) ? o.items : [],
      displayTotal: orderLineTotal(o),
    }))
}

function statusClass(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'paid') return 'bg-neutral-900 text-white border-neutral-900'
  if (s === 'billed') return 'bg-neutral-100 text-neutral-900 border-neutral-300'
  if (s === 'kot') return 'bg-neutral-200 text-neutral-800 border-neutral-400'
  if (s === 'cancelled') return 'bg-neutral-100 text-neutral-500 border-neutral-200 line-through'
  return 'bg-white text-neutral-600 border-neutral-200'
}

export default function BillingPage() {
  const navigate = useNavigate()
  const authReady = useReceptionAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [confirmPayOrder, setConfirmPayOrder] = useState(null)
  const [confirmCancelOrder, setConfirmCancelOrder] = useState(null)
  const [paying, setPaying] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [filter, setFilter] = useState('unpaid')
  const [query, setQuery] = useState('')

  const applyOrders = useCallback((list) => {
    setOrders(normalizeOrders(list))
  }, [])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/orders')
      applyOrders(data.orders)
    } catch (err) {
      console.error('Billing load error:', err)
      const msg = String(err?.message || '')
      if (msg.includes('401')) {
        navigate('/login', { replace: true })
      } else {
        setNotice({ type: 'error', message: 'Failed to load orders. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }, [applyOrders, navigate])

  useEffect(() => {
    if (!authReady) return undefined

    loadOrders()

    const socket = io()
    socket.on('orders:update', (updated) => {
      applyOrders(updated)
      setLoading(false)
    })

    return () => socket.close()
  }, [authReady, loadOrders, applyOrders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      const status = String(o.status || '').toLowerCase()
      if (filter === 'unpaid' && (status === 'paid' || status === 'cancelled')) return false
      if (filter === 'paid' && status !== 'paid') return false
      if (!q) return true
      const id = String(o.id || '').toLowerCase()
      const table = String(o.table || o.type || '').toLowerCase()
      return id.includes(q) || table.includes(q)
    })
  }, [orders, filter, query])

  const summary = useMemo(() => {
    let unpaid = 0
    let unpaidTotal = 0
    let paid = 0
    for (const o of orders) {
      const status = String(o.status || '').toLowerCase()
      if (status === 'paid') {
        paid += 1
      } else if (status !== 'cancelled') {
        unpaid += 1
        unpaidTotal += o.displayTotal
      }
    }
    return { unpaid, unpaidTotal, paid, total: orders.length }
  }, [orders])

  const handleConfirmCancel = async () => {
    const order = confirmCancelOrder
    const orderId = String(order?.id || '')
    if (!orderId) {
      setConfirmCancelOrder(null)
      return
    }

    setCancelling(true)
    setNotice(null)
    try {
      await apiFetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Guest left / order voided' }),
      })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)),
      )
      setNotice({
        type: 'success',
        message: `Order ${orderId} cancelled. Table freed if it was dine-in.`,
      })
      refreshReceptionNotifications()
      refreshReceptionTables()
      setConfirmCancelOrder(null)
    } catch (err) {
      console.error('Failed to cancel order:', err)
      const msg = String(err?.message || '')
      setNotice({
        type: 'error',
        message: msg.includes('400')
          ? 'This order cannot be cancelled (already paid).'
          : 'Failed to cancel order. Please try again.',
      })
    } finally {
      setCancelling(false)
    }
  }

  const confirmMarkPaid = async () => {
    const order = confirmPayOrder
    const orderId = String(order?.id || '')
    if (!orderId) {
      setConfirmPayOrder(null)
      return
    }

    setPaying(true)
    setNotice(null)
    try {
      await apiFetch(`/api/orders/${encodeURIComponent(orderId)}/pay`, { method: 'POST' })
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'paid', displayTotal: o.displayTotal } : o,
        ),
      )
      printBill({ ...order, status: 'paid' })
      setNotice({ type: 'success', message: `Order ${orderId} marked as paid.` })
      refreshReceptionNotifications()
      setConfirmPayOrder(null)
    } catch (err) {
      console.error('Failed to mark as paid:', err)
      setNotice({ type: 'error', message: 'Failed to mark order as paid. Please try again.' })
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[14rem_1fr] bg-neutral-100">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Header title="Billing" showUserMenu showNotifications />

        <main className="p-2 md:p-3">
          <PageNotice message={notice?.message} />

          <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
            <span className="text-[11px] text-neutral-600 shrink-0">
              Unpaid <span className="font-semibold text-neutral-900">{summary.unpaid}</span>
              {' · '}
              {formatInr(summary.unpaidTotal)}
            </span>
            <span className="text-neutral-300 hidden sm:inline">|</span>
            <span className="text-[11px] text-neutral-600 shrink-0">
              Paid <span className="font-semibold text-neutral-900">{summary.paid}</span>
            </span>
            <Input
              placeholder="Search order…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-7 min-w-[7rem] flex-1 sm:max-w-[10rem] text-xs rounded-md border-neutral-200 px-2 ml-auto"
            />
            <div className="flex gap-1">
              {[
                { id: 'unpaid', label: 'Unpaid' },
                { id: 'paid', label: 'Paid' },
                { id: 'all', label: 'All' },
              ].map((f) => (
                <Button
                  key={f.id}
                  variant={filter === f.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-[11px] rounded-md"
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr className="text-left text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
                    <th className="px-3 py-2">Order</th>
                    <th className="px-3 py-2">Table / type</th>
                    <th className="px-3 py-2">Items</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loading && filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-neutral-500 text-sm">
                        Loading orders…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-neutral-500 text-sm">
                        No orders match this filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-50/80">
                        <td className="px-3 py-2 font-medium text-neutral-900">#{order.id}</td>
                        <td className="px-3 py-2 text-neutral-600 capitalize">
                          {order.type === 'takeaway' ? 'Parcel' : order.table || 'Dine-in'}
                        </td>
                        <td className="px-3 py-2 text-neutral-600">{order.items.length}</td>
                        <td className="px-3 py-2 font-medium text-neutral-900">
                          {formatInr(order.displayTotal)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium uppercase rounded border ${statusClass(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                          {canContinueOrder(order) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs rounded-md"
                              onClick={() =>
                                navigate('/pos', { state: { continueOrder: order } })
                              }
                            >
                              Add items
                            </Button>
                          )}
                          {canCancelOrder(order) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs rounded-md border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => setConfirmCancelOrder(order)}
                            >
                              Cancel order
                            </Button>
                          )}
                          {order.status !== 'paid' && order.status !== 'cancelled' ? (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-7 text-xs rounded-md"
                              onClick={() => setConfirmPayOrder(order)}
                            >
                              Mark paid
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs rounded-md"
                              onClick={() => printBill(order)}
                            >
                              Print
                            </Button>
                          )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {confirmCancelOrder && (
        <Modal
          title="Cancel this order?"
          onClose={() => !cancelling && setConfirmCancelOrder(null)}
          footer={
            <>
              <FormButton
                variant="secondary"
                onClick={() => setConfirmCancelOrder(null)}
                disabled={cancelling}
              >
                Keep order
              </FormButton>
              <FormButton variant="primary" onClick={handleConfirmCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Cancel order'}
              </FormButton>
            </>
          }
        >
          <p className="text-sm text-neutral-600">
            Order <span className="font-semibold text-neutral-900">{confirmCancelOrder.id}</span>{' '}
            will be voided. Kitchen will no longer treat it as active. No payment is recorded.
          </p>
          {confirmCancelOrder.table && (
            <p className="text-sm text-neutral-600 mt-2">
              Table <span className="font-semibold text-neutral-900">{confirmCancelOrder.table}</span>{' '}
              will be set to available.
            </p>
          )}
        </Modal>
      )}

      {confirmPayOrder && (
        <Modal
          title="Mark order as paid?"
          onClose={() => !paying && setConfirmPayOrder(null)}
          footer={
            <>
              <FormButton
                variant="secondary"
                onClick={() => setConfirmPayOrder(null)}
                disabled={paying}
              >
                Cancel
              </FormButton>
              <FormButton variant="primary" onClick={confirmMarkPaid} disabled={paying}>
                {paying ? 'Processing…' : 'Confirm payment'}
              </FormButton>
            </>
          }
        >
          <p className="text-sm text-neutral-600">
            Order <span className="font-semibold text-neutral-900">{confirmPayOrder.id}</span> will be
            marked paid and the bill will print.
          </p>
          <p className="text-sm font-semibold text-neutral-900 mt-2">
            Total: {formatInr(orderLineTotal(confirmPayOrder))}
          </p>
        </Modal>
      )}
    </div>
  )
}
