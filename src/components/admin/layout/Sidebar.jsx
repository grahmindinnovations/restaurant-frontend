import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  Package,
  BarChart3,
  Bell,
  Settings,
  ListChecks,
  PlugZap,
  Store,
  ChefHat,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { auth } from '../../../services/firebase'
import { signOut } from 'firebase/auth'

const mainItems = [
  { icon: LayoutGrid, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: Users, label: 'Staff', to: '/admin/staff' },
  { icon: Package, label: 'Inventory', to: '/admin/inventory' },
  { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
  { icon: Bell, label: 'Notifications', to: '/admin/notifications' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
  { icon: ListChecks, label: 'Logs', to: '/admin/logs' },
]

const integrationItems = [
  { icon: Store, label: 'POS', to: '/admin/integration/pos' },
  { icon: ChefHat, label: 'KDS', to: '/admin/integration/kds' },
  { icon: CreditCard, label: 'Payments', to: '/admin/integration/payments' },
]

export default function Sidebar() {
  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth)
    } catch (e) {
      console.error('Admin logout failed', e)
    } finally {
      window.location.href = '/'
    }
  }

  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 border-r border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-rose-600/10 flex items-center justify-center text-rose-700 mr-3">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Admin Console</div>
          <div className="text-[11px] text-slate-500 tracking-wide uppercase">
            Ganesha Hotels
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
            Main
          </div>
          <div className="space-y-1">
            {mainItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
              Integration
            </span>
            <PlugZap className="h-3 w-3 text-amber-500" />
          </div>
          <div className="space-y-1">
            {integrationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                      : 'text-slate-600 hover:bg-amber-50 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

