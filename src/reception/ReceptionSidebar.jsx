import { LayoutGrid, Utensils, Table2, CreditCard, BarChart3 } from 'lucide-react'
import { cn } from '../lib/utils'
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  { icon: Utensils, label: 'POS', path: '/pos' },
  { icon: Table2, label: 'Tables', path: '/tables' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
]

export default function ReceptionSidebar(){
  const location = useLocation()

  return (
    <aside className="w-56 bg-white border-r border-neutral-200 hidden lg:flex flex-col h-screen sticky top-0 z-20">
      <div className="h-16 flex items-center px-5 border-b border-neutral-200 shrink-0 gap-2">
        <div className="h-8 w-8 rounded-md border border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-700">
          <LayoutGrid className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-neutral-900 leading-tight">Reception</h1>
          <p className="text-xs text-neutral-500">Counter</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              )}
            >
              <item.icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-neutral-400')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
