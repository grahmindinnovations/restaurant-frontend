import { LayoutGrid, Truck, FilePlus2, Database, AlertTriangle, LogOut, Package, User } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'

import { cn } from '../../lib/utils'
import { auth } from '../../services/firebase'

const inventoryItems = [
  { icon: LayoutGrid, label: 'Dashboard', to: '/inventory' },
  { icon: Truck, label: 'Supplier Management', to: '/inventory/suppliers' },
  { icon: FilePlus2, label: 'Stock Entry', to: '/inventory/stock-entry' },
  { icon: Database, label: 'Inventory Database', to: '/inventory/database' },
  { icon: AlertTriangle, label: 'Stock Alerts', to: '/inventory/alerts' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    navigate('/', { replace: true })
    try {
      if (auth) await signOut(auth)
    } catch (e) {
      console.error('Error logging out:', e)
    }
  }

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 hidden lg:flex flex-col h-screen sticky top-0 shadow-lg z-20">
      <div className="h-20 flex items-center px-6 border-b border-slate-200 shrink-0 gap-3 bg-white">
        <div className="h-10 w-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">Inventory</h1>
          <p className="text-xs text-slate-500 font-medium">Management</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {inventoryItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/inventory'}
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left mb-1.5 group relative overflow-hidden',
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-5 w-5 relative z-10',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-500',
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className="flex-1 relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 shrink-0 space-y-4 bg-white">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <User className="h-5 w-5 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Manager</p>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-slate-500 capitalize">Online</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
