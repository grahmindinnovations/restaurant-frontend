import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'

export default function Settings() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-slate-600">
            Configure admin-level settings such as data export and access control.
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700">Export all transactional data</span>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

