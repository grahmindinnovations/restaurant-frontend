import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  Package,
  BarChart3,
  Bell,
  Settings,
  ListChecks,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

const mainItems = [
  { icon: LayoutGrid, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: Users, label: 'Staff', to: '/admin/staff' },
  { icon: Package, label: 'Inventory', to: '/admin/inventory' },
  { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
  { icon: Bell, label: 'Notifications', to: '/admin/notifications' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
  { icon: ListChecks, label: 'Logs', to: '/admin/logs' },
]

function NavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-neutral-400')} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-56 border-r border-neutral-200 bg-white">
      <div className="h-14 flex items-center px-4 border-b border-neutral-200 shrink-0 gap-2">
        <div className="h-8 w-8 rounded-md border border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-700">
          <LayoutGrid className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-neutral-900 leading-tight">Admin</div>
          <div className="text-xs text-neutral-500">Console</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <div className="space-y-0.5">
          {mainItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </aside>
  )
}
