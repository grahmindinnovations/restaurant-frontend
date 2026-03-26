import { useEffect, useState } from 'react'
import { apiFetch } from '../../../services/api'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'

export default function KDS() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiFetch('/api/admin/integrations')
        const list = Array.isArray(res.integrations) ? res.integrations : []
        const kds = list.find((i) => i.id === 'kds')
        if (!cancelled && kds) setEnabled(Boolean(kds.enabled))
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
    try {
      const next = !enabled
      setEnabled(next)
      await apiFetch('/api/admin/integrations/kds', {
        method: 'PATCH',
        body: JSON.stringify({ enabled: next }),
      })
    } catch (e) {
      console.error('Failed to update KDS integration', e)
      alert('Failed to update KDS integration.')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">KDS Integration</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-slate-600">
            Control whether the Kitchen Display System is active.
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              Status:{' '}
              <span className={enabled ? 'text-emerald-600' : 'text-slate-500'}>
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
            </span>
            <Button
              variant={enabled ? 'outline' : 'primary'}
              size="sm"
              disabled={loading}
              onClick={toggle}
            >
              {enabled ? 'Disable KDS' : 'Enable KDS'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

