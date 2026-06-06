import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../../lib/utils'

const tabs = [
  { to: '/admin/staff', label: 'Team directory', end: true },
  { to: '/admin/staff/access', label: 'App access', end: false },
  { to: '/admin/staff/register', label: 'Add team member', end: false },
]

export default function AdminStaffLayout() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm font-semibold text-neutral-900">Staff</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          <strong>Team directory</strong> = HR records (Chef, Kitchen — payroll &amp; contact).
          <strong className="ml-1">App access</strong> = who can sign in (POS, kitchen, admin).
        </p>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-neutral-200">
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
