import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PhoneMockup, { GUEST_LIFECYCLE } from '../landing/components/PhoneMockup'
import { getGuestApiBaseUrl } from '../config/apiBase'
import '../landing/fp-order.css'

async function guestFetch(path, options = {}) {
  const url = `${getGuestApiBaseUrl()}${path}`
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `API ${res.status}`)
  return data
}

export default function GuestTablePage() {
  const { tableId = '4' } = useParams()
  const [guestPhone, setGuestPhone] = useState(() => localStorage.getItem('guestPhone') || '')
  const [phonePrompt, setPhonePrompt] = useState(!localStorage.getItem('guestPhone'))
  const [screenIndex, setScreenIndex] = useState(0)
  const [orderId, setOrderId] = useState(null)
  const [lifecycle, setLifecycle] = useState(GUEST_LIFECYCLE.MENU)
  const [etaMinutes, setEtaMinutes] = useState(12)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)

  const pollTrack = useCallback(async () => {
    if (!orderId) return
    try {
      const data = await guestFetch(`/api/guest/orders/${orderId}/track`)
      const lc = String(data.guestLifecycle || 'placed')
      setEtaMinutes(data.estimatedMinutes || 12)
      if (data.ebillSent || lc === 'paid') {
        setLifecycle(GUEST_LIFECYCLE.EBILL)
        return
      }
      if (lc === 'bill_ready') {
        setLifecycle(GUEST_LIFECYCLE.PAY)
        return
      }
      if (lc === 'served') {
        setLifecycle(GUEST_LIFECYCLE.SERVED)
        setScreenIndex(4)
        return
      }
      if (lc === 'ready') {
        setLifecycle(GUEST_LIFECYCLE.READY)
        setScreenIndex(4)
        return
      }
      if (lc === 'preparing') {
        setLifecycle(GUEST_LIFECYCLE.PREPARING)
        setScreenIndex(4)
        return
      }
      if (lc === 'placed') {
        setLifecycle(GUEST_LIFECYCLE.PLACED)
        setScreenIndex(3)
      }
    } catch {
      /* ignore poll errors */
    }
  }, [orderId])

  useEffect(() => {
    if (!orderId) return undefined
    pollTrack()
    const id = window.setInterval(pollTrack, 4000)
    return () => window.clearInterval(id)
  }, [orderId, pollTrack])

  const savePhone = (e) => {
    e.preventDefault()
    const v = guestPhone.trim()
    if (!v) return
    localStorage.setItem('guestPhone', v)
    setPhonePrompt(false)
  }

  const handlePlaceOrder = async () => {
    setError(null)
    try {
      const data = await guestFetch(`/api/guest/tables/${tableId}/orders`, {
        method: 'POST',
        body: JSON.stringify({
          guestPhone: guestPhone.trim(),
          items: [
            { id: 'demo-pasta', name: 'Truffle Pasta', qty: 1, price: 420 },
            { id: 'demo-brew', name: 'Cold Brew', qty: 2, price: 180 },
          ],
        }),
      })
      setOrderId(data.orderId)
      setLifecycle(GUEST_LIFECYCLE.PLACED)
      setScreenIndex(3)
    } catch (err) {
      setError(err.message || 'Could not place order')
    }
  }

  const handlePay = async () => {
    if (!orderId) return
    setPaying(true)
    setError(null)
    try {
      await guestFetch(`/api/guest/orders/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ guestPhone: guestPhone.trim() }),
      })
      setLifecycle(GUEST_LIFECYCLE.EBILL)
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="guest-table-page">
      <header className="guest-table-header">
        <Link to="/" className="guest-table-back">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <div>
          <strong>Grahmind Bistro</strong>
          <span>Table {tableId}</span>
        </div>
      </header>

      {phonePrompt && (
        <div className="guest-table-phone-modal">
          <form onSubmit={savePhone}>
            <h2>Welcome!</h2>
            <p>Enter WhatsApp number for your e-bill after payment.</p>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              required
            />
            <button type="submit">Continue to menu</button>
          </form>
        </div>
      )}

      {error && <p className="guest-table-error">{error}</p>}

      <div className="guest-table-stage">
        <PhoneMockup
          screenIndex={screenIndex}
          interactive
          onScreenChange={setScreenIndex}
          lifecycle={lifecycle}
          guestPhone={guestPhone}
          orderId={orderId || '—'}
          etaMinutes={etaMinutes}
          onPlaceOrder={handlePlaceOrder}
          onPay={handlePay}
          paying={paying}
        />
      </div>
    </div>
  )
}
