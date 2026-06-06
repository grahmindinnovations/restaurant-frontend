import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import KPIWidgets from './KPIWidgets'
import SalesCharts from './SalesCharts'
import GlobalSearch from './GlobalSearch'
import QuickActions from './QuickActions'
import NotificationCenter from './NotificationCenter'

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/admin/metrics')
        if (!cancelled) setMetrics(res)
      } catch (e) {
        console.error('Failed to load admin metrics', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-xs text-neutral-500">Paid orders, expenses, and live alerts.</p>
      </div>
      {loading && !metrics && (
        <p className="text-xs text-neutral-500">Loading metrics…</p>
      )}
      <KPIWidgets kpis={metrics?.kpis} />
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="flex-1 min-w-0 space-y-3">
          <SalesCharts charts={metrics?.charts || {}} showRankings={false} />
          <GlobalSearch />
        </div>
        <div className="w-full xl:w-72 shrink-0 space-y-3">
          <NotificationCenter />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
