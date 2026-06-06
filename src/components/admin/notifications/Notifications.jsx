import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  ChefHat,
  CreditCard,
  Package,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import AdminNotice from '../components/AdminNotice'
import {
  adminCard,
  adminPageTitle,
  adminPageDesc,
  adminMuted,
  adminRowBorder,
  adminTd,
  adminTh,
} from '../components/adminUi'
import { cn } from '../../../lib/utils'

const typeConfig = {
  inventory: { icon: Package, label: 'Inventory' },
  kitchen: { icon: ChefHat, label: 'Kitchen' },
  billing: { icon: CreditCard, label: 'Billing' },
  staff: { icon: Users, label: 'Staff' },
  access: { icon: Shield, label: 'App access' },
}

const severityConfig = {
  critical: {
    badge: 'bg-red-100 text-red-800 border-red-200',
    accent: 'border-l-red-500',
    dot: 'bg-red-500',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    accent: 'border-l-amber-500',
    dot: 'bg-amber-500',
  },
  info: {
    badge: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    accent: 'border-l-neutral-400',
    dot: 'bg-neutral-400',
  },
}

function formatWhen(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('en-IN', { timeStyle: 'short', dateStyle: 'medium' }).format(
      new Date(iso),
    )
  } catch {
    return ''
  }
}

function AlertCard({ alert }) {
  const config = typeConfig[alert.type] || { icon: Bell, label: 'Alert' }
  const severity = severityConfig[alert.severity] || severityConfig.info
  const Icon = config.icon
  const rows = Array.isArray(alert.rows) ? alert.rows : []

  return (
    <Card className={cn(adminCard, 'border-l-4', severity.accent)}>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-neutral-100">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-neutral-600" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-neutral-900">{alert.title}</h2>
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border',
                    severity.badge,
                  )}
                >
                  {alert.severity}
                </span>
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">{alert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-semibold text-neutral-900 tabular-nums">{alert.count}</span>
            {alert.href && (
              <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                <Link to={alert.href}>Open</Link>
              </Button>
            )}
          </div>
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/80">
                  <th className={adminTh}>Item</th>
                  <th className={adminTh}>Detail</th>
                  <th className={cn(adminTh, 'text-right')}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={adminRowBorder}>
                    <td className={adminTd}>
                      <span className="font-medium text-neutral-900">{row.label}</span>
                    </td>
                    <td className={cn(adminTd, 'text-neutral-500')}>{row.sub || '—'}</td>
                    <td className={cn(adminTd, 'text-right font-medium text-neutral-800 tabular-nums')}>
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [summary, setSummary] = useState({ critical: 0, warning: 0, total: 0 })
  const [threshold, setThreshold] = useState(20)
  const [generatedAt, setGeneratedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/admin/notifications')
      setNotifications(Array.isArray(res.notifications) ? res.notifications : [])
      setSummary(res.summary || { critical: 0, warning: 0, total: 0 })
      setThreshold(res.lowStockThreshold ?? 20)
      setGeneratedAt(res.generatedAt || null)
    } catch (e) {
      console.error('Notifications load failed', e)
      setNotifications([])
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(() => load(true), 60_000)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={adminPageTitle}>Notifications</h1>
          <p className={adminPageDesc}>
            Live alerts from menu, kitchen queue, billing, staff, and app access.
          </p>
          {generatedAt && (
            <p className={cn(adminMuted, 'mt-1')}>Updated {formatWhen(generatedAt)}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          disabled={refreshing}
          onClick={() => load(true)}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && <AdminNotice message={error} variant="error" />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Active alerts', value: summary.total, hint: 'Needs attention' },
          { label: 'Critical', value: summary.critical, hint: 'Urgent' },
          { label: 'Warning', value: summary.warning, hint: 'Review soon' },
          { label: 'Low stock at', value: `< ${threshold}`, hint: 'From Settings' },
        ].map((stat) => (
          <Card key={stat.label} className={adminCard}>
            <CardContent className="p-3">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-neutral-900 tabular-nums">{stat.value}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card className={adminCard}>
          <CardContent className="p-6">
            <p className={adminMuted}>Loading alerts…</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className={adminCard}>
          <CardContent className="p-8 text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <Bell className="h-5 w-5 text-neutral-500" />
            </div>
            <p className="text-sm font-medium text-neutral-900">All clear</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              No low stock, unpaid bills, kitchen backlog, or staff issues right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <p className={cn(adminMuted, 'flex items-center gap-1.5')}>
          <AlertTriangle className="h-3.5 w-3.5" />
          Threshold and kitchen status can be changed in{' '}
          <Link to="/admin/settings" className="underline text-neutral-700">
            Settings
          </Link>
          .
        </p>
      )}
    </div>
  )
}
