import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../../lib/utils'

const tabs = [
  { to: '/admin/inventory', label: 'Menu items', end: true },
  { to: '/admin/inventory/low-stock', label: 'Low stock', end: false },
]

export default function AdminInventoryLayout() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm font-semibold text-neutral-900">Menu & inventory</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          These dishes are the same catalog used on reception POS, kitchen, and reports. Changes sync
          live via the server.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-neutral-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
