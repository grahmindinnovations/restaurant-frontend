import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { apiFetch } from '../../../services/api'
import { cn } from '../../../lib/utils'
import { adminCard } from '../components/adminUi'

const scopes = [
  { id: 'staff', label: 'Staff' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'invoice', label: 'Orders' },
  { id: 'supplier', label: 'Suppliers' },
]

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('staff')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!query.trim()) {
      setResults(null)
      return
    }

    const handle = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await apiFetch(
          `/api/admin/search?q=${encodeURIComponent(query.trim())}&scope=${encodeURIComponent(scope)}`,
        )
        if (!cancelled) setResults(res.results || null)
      } catch (e) {
        console.error('Global search failed', e)
        if (!cancelled) setResults(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query, scope])

  const items =
    scope === 'staff'
      ? results?.staff
      : scope === 'inventory'
        ? results?.inventory
        : scope === 'invoice'
          ? results?.invoices
          : results?.suppliers

  return (
    <section>
      <Card className={adminCard}>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-sm font-semibold text-neutral-900">Search</h2>
            <div className="flex flex-wrap gap-1">
              {scopes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScope(s.id)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[11px] font-medium border transition-colors',
                    scope === s.id
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, email, item, order id…"
              className="pl-8 h-8 text-xs"
            />
          </div>

          {query.trim() && (
            <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-md bg-neutral-50/50">
              {loading ? (
                <p className="p-2 text-xs text-neutral-500">Searching…</p>
              ) : !items || items.length === 0 ? (
                <p className="p-2 text-xs text-neutral-400">No results.</p>
              ) : (
                <ul className="divide-y divide-neutral-100 text-xs">
                  {items.map((item) => (
                    <li key={item.id} className="px-2.5 py-2">
                      <div className="font-medium text-neutral-900 truncate">
                        {item.name || item.id}
                      </div>
                      <div className="text-neutral-500 flex flex-wrap gap-2 mt-0.5">
                        {item.email && <span>{item.email}</span>}
                        {item.phone && <span>{item.phone}</span>}
                        {item.category && <span>{item.category}</span>}
                        {item.table && <span>Table {item.table}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
