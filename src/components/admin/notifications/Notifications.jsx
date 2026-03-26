import NotificationCenter from '../dashboard/NotificationCenter'

export default function Notifications() {
  return (
    <div className="space-y-4 flex flex-col xl:flex-row gap-4">
      <div className="flex-1 space-y-2">
        <h1 className="text-lg font-semibold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-600">
          Central view of all important system alerts.
        </p>
      </div>
      <NotificationCenter />
    </div>
  )
}

