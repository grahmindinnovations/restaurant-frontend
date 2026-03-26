import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../ReceptionSidebar'
import Header from '../../layouts/Header'
import { Button } from '../../components/ui/button'
import BookTableModal from '../modals/BookTableModal'
import { apiFetch } from '../../services/api'
import { io } from 'socket.io-client'

export default function TablesPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tables, setTables] = useState([])
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/api/tables')
        const list = Array.isArray(data.tables) ? data.tables : []
        const byId = new Map()
        list.forEach(t => byId.set(t.id, { id: t.id, ...t }))
        const next = Array.from({ length: 10 }).map((_, i) => {
          const id = `T${i + 1}`
          return byId.get(id) || { id, status: 'available' }
        })
        setTables(next)
      } catch (e) {
        console.error('Tables initial load error:', e)
      }
    }
    load()

    const s = io()
    setSocket(s)
    s.on('tables:update', (tablesPayload) => {
      const list = Array.isArray(tablesPayload) ? tablesPayload : []
      const byId = new Map()
      list.forEach(t => byId.set(t.id, { id: t.id, ...t }))
      const next = Array.from({ length: 10 }).map((_, i) => {
        const id = `T${i + 1}`
        return byId.get(id) || { id, status: 'available' }
      })
      setTables(next)
    })

    return () => {
      s.close()
    }
  }, [])

  const counts = useMemo(() => {
    const list = Array.isArray(tables) ? tables : []
    const available = list.filter(t => (t.status || 'available') === 'available').length
    const reserved = list.filter(t => t.status === 'reserved').length
    const occupied = list.filter(t => t.status === 'occupied').length
    return { total: list.length, available, reserved, occupied }
  }, [tables])

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

  const markAvailable = async (tableId) => {
    try {
      await apiFetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'available',
          reservedBy: null,
          phone: null,
          currentOrderId: null,
        }),
      })
    } catch (e) {
      console.error('Failed to mark table available:', e)
      alert('Failed to mark table available.')
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr] bg-slate-50">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Header
          title={<span>Reception <span className="text-rose-700">Tables</span></span>}
          currentTime={currentTime}
        />

        <main className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-500">Overview</div>
            <Button variant="outline" onClick={() => setIsBookModalOpen(true)}>Book Table</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="text-xs font-semibold text-slate-500">Total Tables</div>
              <div className="mt-1 text-3xl font-bold text-slate-900">{counts.total}</div>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
              <div className="text-xs font-semibold text-emerald-700">Available</div>
              <div className="mt-1 text-3xl font-bold text-emerald-800">{counts.available}</div>
            </div>
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
              <div className="text-xs font-semibold text-amber-700">Reserved</div>
              <div className="mt-1 text-3xl font-bold text-amber-800">{counts.reserved}</div>
            </div>
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-5">
              <div className="text-xs font-semibold text-rose-700">Occupied</div>
              <div className="mt-1 text-3xl font-bold text-rose-800">{counts.occupied}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="text-sm font-bold text-slate-800 mb-4">Table Status</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {tables.map(t => {
                const status = t.status || 'available'
                const badgeClass =
                  status === 'available'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : status === 'reserved'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'

                return (
                  <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-extrabold text-slate-900">{t.id}</div>
                      <div className={`px-2 py-1 text-xs font-bold uppercase rounded-lg border ${badgeClass}`}>{status}</div>
                    </div>

                    {(t.reservedBy || t.phone) && (
                      <div className="mt-2 text-xs text-slate-500">
                        <div className="truncate">{t.reservedBy || 'Reserved'}</div>
                        <div className="truncate">{t.phone || ''}</div>
                      </div>
                    )}

                    {status !== 'available' && (
                      <button
                        type="button"
                        className="mt-3 w-full px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() => markAvailable(t.id)}
                      >
                        Mark Available
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </main>

        <BookTableModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          tables={tables}
          onBook={bookTable}
        />
      </div>
    </div>
  )
}

