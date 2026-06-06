import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import { UserPlus, FileBarChart2, UtensilsCrossed, AlertTriangle } from 'lucide-react'
import { adminCard } from '../components/adminUi'

const actions = [
  { label: 'Menu items', icon: UtensilsCrossed, to: '/admin/inventory' },
  { label: 'Low stock', icon: AlertTriangle, to: '/admin/inventory/low-stock' },
  { label: 'App access', icon: UserPlus, to: '/admin/staff/access' },
  { label: 'Analytics', icon: FileBarChart2, to: '/admin/analytics' },
]

export default function QuickActions() {
  const navigate = useNavigate()
  return (
    <Card className={adminCard}>
      <CardContent className="p-3">
        <h2 className="text-sm font-semibold text-neutral-900 mb-2">Shortcuts</h2>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => navigate(action.to)}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
