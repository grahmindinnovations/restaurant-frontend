import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { createSocket } from '../../../services/socket'

export default function TablePaymentBoard() {
  const [tables, setTables] = useState([])

  useEffect(() => {
    const load = () =>
      apiFetch('/api/tables')
        .then((d) => setTables(Array.isArray(d?.tables) ? d.tables : []))
        .catch(() => {})

    load()
    const socket = createSocket()
    socket.on('tables:update', setTables)
    return () => socket.close()
  }, [])

  const occupied = tables.filter((t) => t.status === 'occupied')
  const paid = tables.filter((t) => t.paymentStatus === 'paid')
  const unpaid = occupied.filter((t) => t.paymentStatus !== 'paid')

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <h3 className="text-xs font-semibold text-neutral-900 mb-2">Table payments (today)</h3>
      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
        <div className="rounded-md bg-neutral-50 p-2">
          <p className="text-lg font-bold text-neutral-900">{occupied.length}</p>
          <p className="text-[10px] text-neutral-500">Seated</p>
        </div>
        <div className="rounded-md bg-emerald-50 p-2">
          <p className="text-lg font-bold text-emerald-800">{paid.length}</p>
          <p className="text-[10px] text-emerald-700">Paid · e-bill OK</p>
        </div>
        <div className="rounded-md bg-amber-50 p-2">
          <p className="text-lg font-bold text-amber-800">{unpaid.length}</p>
          <p className="text-[10px] text-amber-700">Awaiting pay</p>
        </div>
      </div>
      <ul className="space-y-1 max-h-32 overflow-y-auto text-[11px]">
        {tables.slice(0, 12).map((t) => (
          <li key={t.id} className="flex justify-between border-b border-neutral-100 py-1">
            <span>Table {t.id}</span>
            <span className={t.paymentStatus === 'paid' ? 'text-emerald-700 font-semibold' : 'text-neutral-500'}>
              {t.paymentStatus === 'paid' ? 'Paid ✓' : t.status}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-neutral-400 mt-2">Guests show WhatsApp e-bill at exit</p>
    </div>
  )
}
