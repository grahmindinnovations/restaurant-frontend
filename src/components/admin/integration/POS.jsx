import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import AdminNotice from '../components/AdminNotice'
import { adminCard, adminPageTitle, adminPageDesc } from '../components/adminUi'

export default function POS() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/admin/integrations')
        const list = Array.isArray(res.integrations) ? res.integrations : []
        const pos = list.find((i) => i.id === 'pos')
        if (!cancelled && pos) setEnabled(Boolean(pos.enabled))
      } catch (e) {
        console.error('Failed to load integration settings', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = async () => {
    const next = !enabled
    setNotice(null)
    try {
      setEnabled(next)
      await apiFetch('/api/admin/integrations/pos', {
        method: 'PATCH',
        body: JSON.stringify({ enabled: next }),
      })
    } catch (e) {
      console.error('Failed to update POS integration', e)
      setEnabled(!next)
      setNotice('Failed to update POS integration.')
    }
  }

  return (
    <div className="space-y-3 max-w-md">
      <div>
        <h1 className={adminPageTitle}>POS</h1>
        <p className={adminPageDesc}>Enable or disable the reception POS module.</p>
      </div>
      {notice && <AdminNotice message={notice} variant="error" />}
      <Card className={adminCard}>
        <CardContent className="p-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-neutral-700">
            Status: <span className="font-medium text-neutral-900">{enabled ? 'On' : 'Off'}</span>
          </span>
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled={loading} onClick={toggle}>
            {enabled ? 'Disable' : 'Enable'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
