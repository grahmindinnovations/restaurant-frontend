import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../ReceptionSidebar'
import Header from '../../layouts/Header'
import { Button } from '../../components/ui/button'
import BookTableModal from '../modals/BookTableModal'
import PageNotice from '../components/PageNotice'
import { refreshReceptionNotifications } from '../utils/refreshNotifications'
import { refreshReceptionTables } from '../utils/refreshTables'
import { normalizeTablesFromApi } from '../utils/normalizeTables'
import { useReceptionAuth } from '../hooks/useReceptionAuth'
import { apiFetch } from '../../services/api'
import { io } from 'socket.io-client'

function statusStyles(status) {
  const s = String(status || 'available').toLowerCase()
  if (s === 'occupied') {
    return 'bg-neutral-900 text-white border-neutral-900'
  }
  if (s === 'reserved') {
    return 'bg-neutral-200 text-neutral-900 border-neutral-400'
  }
  return 'bg-white text-neutral-700 border-neutral-200'
}

export default function TablesPage() {
  const navigate = useNavigate()
  const authReady = useReceptionAuth()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [notice, setNotice] = useState(null)

  const applyTables = useCallback((list) => {
    setTables(normalizeTablesFromApi(list))
  }, [])

  const loadTables = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/tables')
      applyTables(data.tables)
    } catch (e) {
      console.error('Tables load error:', e)
      const msg = String(e?.message || '')
      if (msg.includes('401')) {
        navigate('/login', { replace: true })
      } else {
        setNotice({ type: 'error', message: 'Could not load tables. Check backend and refresh.' })
      }
    } finally {
      setLoading(false)
    }
  }, [applyTables, navigate])

  useEffect(() => {
    if (!authReady) return undefined

    loadTables()

    const socket = io({ transports: ['websocket', 'polling'] })
    socket.on('tables:update', (payload) => {
      applyTables(payload)
      setLoading(false)
    })
    socket.on('connect', () => {
      loadTables()
    })

    const onRefresh = () => loadTables()
    window.addEventListener('reception:tables-refresh', onRefresh)

    return () => {
      socket.close()
      window.removeEventListener('reception:tables-refresh', onRefresh)
    }
  }, [authReady, loadTables, applyTables])

  const counts = useMemo(() => {
    const list = Array.isArray(tables) ? tables : []
    return {
      total: list.length,
      available: list.filter((t) => (t.status || 'available') === 'available').length,
      reserved: list.filter((t) => t.status === 'reserved').length,
      occupied: list.filter((t) => t.status === 'occupied').length,
    }
  }, [tables])

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
      await loadTables()
      refreshReceptionTables()
      refreshReceptionNotifications()
    } catch (e) {
      console.error('Failed to book table:', e)
      setNotice({ type: 'error', message: 'Failed to book table. Please try again.' })
    }
  }

  const markAvailable = async (tableId) => {
    setNotice(null)
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
      setNotice({ type: 'success', message: `Table ${tableId} is now available.` })
      await loadTables()
      refreshReceptionTables()
      refreshReceptionNotifications()
    } catch (e) {
      console.error('Failed to mark table available:', e)
      setNotice({ type: 'error', message: 'Failed to update table. Please try again.' })
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[14rem_1fr] bg-neutral-100">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Header title="Tables" showUserMenu showNotifications />

        <main className="p-2 md:p-3">
          <PageNotice message={notice?.message} />

          <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-[11px] text-neutral-600">
            <span>
              <span className="font-semibold text-neutral-900">{counts.total}</span> tables
            </span>
            <span className="text-neutral-300">|</span>
            <span>{counts.available} available</span>
            <span className="text-neutral-300">·</span>
            <span>{counts.reserved} reserved</span>
            <span className="text-neutral-300">·</span>
            <span>{counts.occupied} occupied</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] rounded-md ml-auto"
              onClick={() => setIsBookModalOpen(true)}
              disabled={loading || tables.length === 0}
            >
              Book table
            </Button>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-2 md:p-3">
            {loading && tables.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-500">Loading tables…</p>
            ) : tables.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-500">
                No tables in the system. Add tables in admin or run seed data.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {tables.map((t) => {
                  const status = t.status || 'available'
                  return (
                    <div
                      key={t.id}
                      className="rounded-lg border border-neutral-200 p-2.5 flex flex-col min-h-[5.5rem]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold text-neutral-900">{t.id}</span>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-medium uppercase rounded border ${statusStyles(status)}`}
                        >
                          {status}
                        </span>
                      </div>
                      {(t.reservedBy || t.phone || t.currentOrderId) && (
                        <div className="mt-1.5 text-[10px] text-neutral-500 space-y-0.5 flex-1">
                          {t.reservedBy && <div className="truncate">{t.reservedBy}</div>}
                          {t.phone && <div className="truncate">{t.phone}</div>}
                          {t.currentOrderId && (
                            <div className="truncate">Order #{t.currentOrderId}</div>
                          )}
                        </div>
                      )}
                      {status !== 'available' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 h-7 w-full text-[11px] rounded-md"
                          onClick={() => markAvailable(t.id)}
                        >
                          Mark available
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
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
