import { Card, CardContent } from '../../ui/card'

export default function Logs() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">System Logs</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm text-slate-600">
            Hook this page to your logging provider or Firestore collections that
            capture audit logs for admin actions.
          </p>
          <p className="text-xs text-slate-500">
            For now this is a placeholder view to keep the admin navigation modular
            and ready for future expansion.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

