import { LayoutGrid, Utensils, Table2, CreditCard, BarChart3, LogOut, User } from 'lucide-react'
import { cn } from '../lib/utils'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../services/firebase'
import { signOut } from 'firebase/auth'

const menuItems = [
  { icon: Utensils, label: 'POS', path: '/pos' },
  { icon: Table2, label: 'Tables', path: '/tables' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
]

export default function ReceptionSidebar(){
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth)
      }
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error logging out:', error)
      navigate('/', { replace: true })
    }
  }
  
  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 hidden lg:flex flex-col h-screen sticky top-0 shadow-lg z-20">
      <div className="h-20 flex items-center px-6 border-b border-slate-200 shrink-0 gap-3 bg-white">
        <div className="h-10 w-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">Reception</h1>
          <p className="text-xs text-slate-500 font-medium">Management</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Main Menu</div>
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path && item.path !== '#'
          return (
            <Link
              key={i}
              to={item.path || '#'}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left mb-1.5 group relative overflow-hidden",
                isActive 
                  ? "bg-rose-600 text-white shadow-md shadow-rose-200" 
                  : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
              )}
            >
              <item.icon className={cn("h-5 w-5 relative z-10", isActive ? "text-white" : "text-slate-400 group-hover:text-rose-500")} />
              <span className="flex-1 relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 shrink-0 space-y-4 bg-white">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <User className="h-5 w-5 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Reception</p>
            <p className="text-xs text-slate-500">Counter</p>
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

