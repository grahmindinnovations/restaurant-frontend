import { Card, CardContent } from '../../ui/card'

export default function Analytics() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Analytics</h1>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm text-slate-600">
            High level analytics are already available on the main admin dashboard.
          </p>
          <p className="text-xs text-slate-500">
            Extend this page to add custom charts, time filters and export options as
            required. Data can be sourced from existing Firestore collections such as
            <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded">
              orders
            </code>
            ,
            <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded">
              staff
            </code>
            , and
            <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded">
              menu_items
            </code>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

