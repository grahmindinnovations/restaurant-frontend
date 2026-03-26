import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { apiFetch } from '../../../services/api'

const scopes = [
  { id: 'staff', label: 'Search Staff' },
  { id: 'inventory', label: 'Search Inventory' },
  { id: 'invoice', label: 'Search Invoice' },
  { id: 'supplier', label: 'Search Supplier' },
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
          `/api/admin/search?q=${encodeURIComponent(query.trim())}&scope=${encodeURIComponent(
            scope
          )}`
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
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Global Search</h2>
              <p className="text-[11px] text-slate-500">
                Search across staff, inventory, invoices and suppliers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {scopes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScope(s.id)}
                  className={[
                    'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
                    scope === s.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
                  ].join(' ')}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search by name, email, phone, item or invoice id..."
              className="pl-9 text-sm"
            />
          </div>

          {query.trim() && (
            <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/60">
              {loading ? (
                <div className="p-3 text-xs text-slate-500">Searching...</div>
              ) : !items || items.length === 0 ? (
                <div className="p-3 text-xs text-slate-400">
                  No results found for &quot;{query.trim()}&quot;
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {items.map((item) => (
                    <li key={item.id} className="px-3 py-2">
                      <div className="font-semibold text-slate-800 truncate">
                        {item.name || item.id}
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                        {item.email && <span>{item.email}</span>}
                        {item.phone && <span>{item.phone}</span>}
                        {item.category && <span>{item.category}</span>}
                        {item.table && <span>Table: {item.table}</span>}
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

