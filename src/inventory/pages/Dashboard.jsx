import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  Package,
  Truck,
  UserPlus,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch('/api/inventory/dashboard')
        if (!cancelled) setDashboard(data || null)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const summaryCards = useMemo(() => {
    const totalProducts = Number(dashboard?.totalProducts) || 0
    const lowStockItems = Number(dashboard?.lowStockItems) || 0
    const totalSuppliers = Number(dashboard?.totalSuppliers) || 0
    const recentStockEntries = Number(dashboard?.recentStockEntries) || 0
    return [
      {
        title: 'Total Products',
        value: totalProducts.toLocaleString(),
        icon: Package,
        tint: 'bg-indigo-500/10',
        iconTint: 'bg-indigo-500/15 text-indigo-600',
      },
      {
        title: 'Low Stock Items',
        value: lowStockItems.toLocaleString(),
        icon: AlertTriangle,
        tint: 'bg-amber-500/10',
        iconTint: 'bg-amber-500/15 text-amber-700',
      },
      {
        title: 'Total Suppliers',
        value: totalSuppliers.toLocaleString(),
        icon: Truck,
        tint: 'bg-emerald-500/10',
        iconTint: 'bg-emerald-500/15 text-emerald-700',
      },
      {
        title: 'Recent Stock Entries',
        value: recentStockEntries.toLocaleString(),
        icon: ClipboardList,
        tint: 'bg-sky-500/10',
        iconTint: 'bg-sky-500/15 text-sky-700',
      },
    ]
  }, [dashboard])

  const stockByCategoryRaw = Array.isArray(dashboard?.stockByCategory) ? dashboard.stockByCategory : []
  const recentActivityRaw = Array.isArray(dashboard?.recentActivity) ? dashboard.recentActivity : []

  const stockByCategory = useMemo(() => {
    return stockByCategoryRaw
      .map((x) => {
        const category = String(x?.category || '')
        const activeStock = Number(x?.activeStock ?? x?.stock) || 0
        const deletedStock = Number(x?.deletedStock) || 0
        const totalStock = Number(x?.totalStock) || activeStock + deletedStock
        return { category, activeStock, deletedStock, totalStock }
      })
      .filter((x) => x.category)
  }, [stockByCategoryRaw])

  const recentActivity = useMemo(() => {
    return recentActivityRaw.map((x) => {
      const type = String(x?.type || 'stock')
      const icon =
        type === 'supplier' ? UserPlus : type === 'alert' ? AlertTriangle : Boxes
      const iconTint =
        type === 'supplier'
          ? 'bg-emerald-500/15 text-emerald-700'
          : type === 'alert'
            ? 'bg-amber-500/15 text-amber-700'
            : 'bg-sky-500/15 text-sky-700'
      return {
        id: String(x?.id || Math.random().toString(16).slice(2)),
        type,
        title: String(x?.title || 'Activity'),
        description: String(x?.description || ''),
        time: String(x?.time || ''),
        icon,
        iconTint,
      }
    })
  }, [recentActivityRaw])

  const maxStock = Math.max(1, ...stockByCategory.map((x) => Number(x?.totalStock) || 0))
  const totalStock = stockByCategory.reduce((s, x) => s + (Number(x?.totalStock) || 0), 0)
  const activeTotal = stockByCategory.reduce((s, x) => s + (Number(x?.activeStock) || 0), 0)
  const deletedTotal = stockByCategory.reduce((s, x) => s + (Number(x?.deletedStock) || 0), 0)
  const totalStockText = Number(totalStock || 0).toLocaleString()
  const topCategory = stockByCategory.reduce(
    (best, x) => {
      const value = Number(x?.totalStock) || 0
      if (!best) return { category: String(x?.category || ''), stock: value }
      return value > best.stock ? { category: String(x?.category || ''), stock: value } : best
    },
    null,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Snapshot of your inventory health and recent updates.
          </p>
        </div>
        <div className="hidden rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm md:block">
          {loading ? 'Loading...' : 'Updated just now'}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className={`rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-black/5 ${card.tint}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight">
                    {card.value}
                  </div>
                </div>
                <div className={`rounded-2xl p-2.5 ${card.iconTint}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Stock by Category</div>
              <div className="text-xs text-muted-foreground">
                Total units: {totalStockText}
                {topCategory?.category ? ` • Top: ${topCategory.category}` : ''}
              </div>
            </div>
            <div className="rounded-xl border bg-background px-2 py-1 text-xs text-muted-foreground">
              {loading ? 'Loading...' : 'Live data'}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-slate-900">{activeTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="text-muted-foreground">Deleted</span>
                <span className="font-semibold text-slate-900">{deletedTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-muted-foreground">Click bars to view products</div>
          </div>

          <div className="mt-4 h-[280px] rounded-2xl border bg-background p-4">
            <div className="h-full grid grid-cols-6 gap-3 items-end">
              {stockByCategory.map((x) => {
                const category = String(x?.category || '')
                const activeValue = Number(x?.activeStock) || 0
                const deletedValue = Number(x?.deletedStock) || 0
                const totalValue = Number(x?.totalStock) || activeValue + deletedValue
                const heightPct = Math.max(4, Math.round((totalValue / maxStock) * 100))
                const totalPct = totalStock > 0 ? Math.round((totalValue / totalStock) * 100) : 0
                return (
                  <div key={category} className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-semibold text-slate-600 tabular-nums">
                      {totalValue.toLocaleString()}
                    </div>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-2xl overflow-hidden flex flex-col justify-end ring-1 ring-black/5"
                        style={{ height: `${heightPct}%` }}
                        title={`${category}: ${totalValue.toLocaleString()} (${totalPct}%)`}
                      >
                        {deletedValue > 0 && (
                          <button
                            type="button"
                            className="w-full bg-slate-300 hover:bg-slate-400/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{ flexGrow: deletedValue, minHeight: '10px' }}
                            title={`${category} (Deleted): ${deletedValue.toLocaleString()}`}
                            onClick={() =>
                              navigate(
                                `/inventory/database?category=${encodeURIComponent(category)}&deleted=only`,
                              )
                            }
                          />
                        )}
                        {activeValue > 0 && (
                          <button
                            type="button"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{ flexGrow: activeValue, minHeight: '10px' }}
                            title={`${category} (Available): ${activeValue.toLocaleString()}`}
                            onClick={() =>
                              navigate(`/inventory/database?category=${encodeURIComponent(category)}`)
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div className="w-full text-center text-[11px] font-medium text-muted-foreground truncate">
                      {category}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <div>
            <div className="text-sm font-semibold">Recent Activity</div>
            <div className="text-xs text-muted-foreground">
              Stock entries, suppliers, and alerts
            </div>
          </div>

          <ul className="mt-4 space-y-3">
            {recentActivity.map((item) => {
              const Icon = item.icon
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-2xl border bg-background p-3 shadow-sm"
                >
                  <div className={`rounded-2xl p-2 ${item.iconTint}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-medium">{item.title}</div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {item.time}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
