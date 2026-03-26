import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import {
  UserPlus,
  Truck,
  PackagePlus,
  FileText,
  FileBarChart2,
  Download,
} from 'lucide-react'

const actions = [
  {
    label: 'Add Staff',
    icon: UserPlus,
    to: '/admin/staff/register',
    description: 'Create a new staff profile and assign roles.',
  },
  {
    label: 'Add Supplier',
    icon: Truck,
    to: '/admin/inventory/suppliers',
    description: 'Register a new inventory supplier.',
  },
  {
    label: 'Add Stock',
    icon: PackagePlus,
    to: '/admin/inventory/stock-entry',
    description: 'Record new stock purchases.',
  },
  {
    label: 'Add Reports',
    icon: FileText,
    to: '/admin/analytics',
    description: 'Create or configure analytics views.',
  },
  {
    label: 'View Reports',
    icon: FileBarChart2,
    to: '/admin/analytics',
    description: 'View performance and sales reports.',
  },
  {
    label: 'Export Data',
    icon: Download,
    to: '/admin/settings',
    description: 'Export key data for backup or analysis.',
  },
]

export default function QuickActions() {
  const navigate = useNavigate()
  return (
    <section>
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
            <span className="text-[11px] text-slate-500">
              Frequently used admin shortcuts
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <div
                  key={action.label}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-600/10 text-rose-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="text-xs font-semibold text-slate-900">
                        {action.label}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1">
                      {action.description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2 py-0"
                      onClick={() => navigate(action.to)}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

