import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import SalesCharts from '../dashboard/SalesCharts'
import { adminCard, adminPageTitle, adminPageDesc, adminMuted } from '../components/adminUi'

function formatInr(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(n) || 0,
  )
}

export default function Analytics() {
  const [period, setPeriod] = useState('today')
  const [summary, setSummary] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [summaryRes, metricsRes] = await Promise.all([
          apiFetch(`/api/reports/summary?period=${period}`),
          apiFetch('/api/admin/metrics'),
        ])
        if (!cancelled) {
          setSummary(summaryRes)
          setMetrics(metricsRes)
        }
      } catch (e) {
        console.error('Analytics load failed', e)
        if (!cancelled) {
          setSummary(null)
          setMetrics(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [period])

  const sales = summary?.sales
  const costs = summary?.costs
  const profit = summary?.profit

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className={adminPageTitle}>Analytics</h1>
          <p className={adminPageDesc}>Revenue, costs, and trends from paid orders and expenses.</p>
        </div>
        <div className="flex gap-1">
          {['today', 'month', 'all'].map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={period === p ? 'default' : 'outline'}
              className="h-7 text-xs capitalize"
              onClick={() => setPeriod(p)}
            >
              {p === 'all' ? 'All time' : p}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className={adminMuted}>Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'Revenue', value: formatInr(sales?.revenue) },
              { label: 'Orders', value: sales?.ordersCount ?? 0 },
              { label: 'Food cost', value: formatInr(costs?.cogs) },
              { label: 'Expenses', value: formatInr(costs?.expenses) },
              { label: 'Net profit', value: formatInr(profit?.net) },
            ].map((row) => (
              <Card key={row.label} className={adminCard}>
                <CardContent className="p-3">
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900 tabular-nums">{row.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <SalesCharts charts={metrics?.charts || {}} />
        </>
      )}
    </div>
  )
}
