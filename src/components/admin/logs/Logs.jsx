import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import AdminNotice from '../components/AdminNotice'
import { adminCard, adminPageTitle, adminPageDesc, adminMuted, adminTh, adminTd, adminRowBorder } from '../components/adminUi'

function formatAction(action) {
  return String(action || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatWhen(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/admin/logs')
        if (!cancelled) setLogs(Array.isArray(res.logs) ? res.logs : [])
      } catch (e) {
        console.error('Logs load failed', e)
        if (!cancelled) {
          setLogs([])
          setError('Failed to load activity logs.')
        }
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
        <h1 className={adminPageTitle}>Logs</h1>
        <p className={adminPageDesc}>Recent admin actions — menu, access, expenses, settings.</p>
      </div>

      {error && <AdminNotice message={error} variant="error" />}

      <Card className={adminCard}>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className={`p-3 ${adminMuted}`}>Loading…</p>
          ) : logs.length === 0 ? (
            <p className={`p-3 ${adminMuted}`}>
              No activity yet. Logs appear when you edit menu items, app access, expenses, or settings.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className={adminTh}>When</th>
                  <th className={adminTh}>Action</th>
                  <th className={adminTh}>User</th>
                  <th className={adminTh}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={adminRowBorder}>
                    <td className={`${adminTd} whitespace-nowrap text-neutral-500`}>
                      {formatWhen(log.createdAt)}
                    </td>
                    <td className={adminTd}>
                      <span className="font-medium text-neutral-900">{formatAction(log.action)}</span>
                      <span className="block text-[10px] text-neutral-400 capitalize">{log.category}</span>
                    </td>
                    <td className={`${adminTd} text-neutral-600`}>
                      {log.actor?.email || log.actor?.uid || '—'}
                    </td>
                    <td className={`${adminTd} text-neutral-600 max-w-md truncate`} title={log.detail || ''}>
                      {log.detail || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
