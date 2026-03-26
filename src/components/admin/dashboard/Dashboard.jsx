import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { apiFetch } from '../../../services/api'
import KPIWidgets from './KPIWidgets'
import SalesCharts from './SalesCharts'
import GlobalSearch from './GlobalSearch'
import QuickActions from './QuickActions'
import NotificationCenter from './NotificationCenter'

export default function Dashboard() {
  const { adminUser } = useOutletContext()
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
    <div className="space-y-4">
      <KPIWidgets kpis={metrics?.kpis} adminUser={adminUser} />
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <SalesCharts charts={metrics?.charts || {}} />
          <GlobalSearch />
          <QuickActions />
        </div>
        <NotificationCenter />
      </div>
      {loading && !metrics && (
        <div className="text-xs text-slate-500">Loading dashboard data...</div>
      )}
    </div>
  )
}

