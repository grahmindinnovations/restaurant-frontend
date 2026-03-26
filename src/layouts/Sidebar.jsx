import { LayoutGrid, Utensils, Table2, BookOpen, ChefHat, Bike, CreditCard, Users, BarChart3, Settings, LogOut, ClipboardList, HelpCircle, Package, User } from 'lucide-react'
import { cn } from '../lib/utils'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../services/firebase'
import { signOut } from 'firebase/auth'

const items = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/pos' },
  { icon: Utensils, label: 'POS', path: '/pos' },
  { icon: ChefHat, label: 'Kitchen', path: '/kitchen' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Table2, label: 'Tables', path: '/pos' },
  { icon: BookOpen, label: 'Reservations', path: '/pos' },
  { icon: Bike, label: 'Delivery', path: '/pos' },
  { icon: Users, label: 'Customers', path: '/pos' },
  { icon: BarChart3, label: 'Reports', path: '/pos' },
  { icon: Settings, label: 'Settings', path: '/pos' },
]

export default function Sidebar({ activeTab, setActiveTab, kitchenStatus }){
  const location = useLocation()
  const navigate = useNavigate()
  
  // Determine current section to filter menu items
  const currentPath = location.pathname
  const isKitchen = currentPath.startsWith('/kitchen')
  
  let displayedItems = items
  
  if (currentPath.startsWith('/pos')) {
    displayedItems = [
      { icon: Utensils, label: 'POS', path: '/pos' },
      { icon: Table2, label: 'Tables', path: '#' },
      { icon: BookOpen, label: 'Reservations', path: '#' },
      { icon: Bike, label: 'Delivery', path: '#' },
      { icon: Users, label: 'Customers', path: '#' },
    ]
  } else if (isKitchen) {
    // Kitchen specific items using tabs if setActiveTab is provided
    displayedItems = [
      { icon: LayoutGrid, label: 'Dashboard', id: 'dashboard' },
      { icon: ClipboardList, label: 'Orders', id: 'orders', badge: 24 },
      { icon: Package, label: 'Inventory', id: 'inventory' },
      { icon: Utensils, label: 'Menu Management', id: 'menu' },
      { icon: Settings, label: 'Settings', id: 'settings' },
      { icon: HelpCircle, label: 'Help & Support', id: 'help' },
    ]
  } else if (currentPath.startsWith('/billing')) {
    displayedItems = [
      { icon: CreditCard, label: 'Billing', path: '/billing' },
      { icon: BarChart3, label: 'Reports', path: '#' },
      { icon: Users, label: 'Invoices', path: '#' },
    ]
  }

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth)
      }
      navigate('/portal/reception')
    } catch (error) {
      console.error('Error logging out:', error)
      navigate('/portal/reception')
    }
  }
  
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0 gap-3">
        {isKitchen && <ChefHat className="h-8 w-8 text-rose-700" />}
        <div className="text-xl font-bold text-gray-900">
          {isKitchen ? 'Kitchen' : 'Ganesha Hotel'}
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {displayedItems.map((item, i) => {
          // Logic for active state: use activeTab for Kitchen, location.pathname for others
          const isActive = isKitchen && setActiveTab 
            ? activeTab === item.id 
            : location.pathname === item.path && item.path !== '#'

          const content = (
            <>
              <item.icon className={cn("h-5 w-5", isActive ? (isKitchen ? "text-white" : "text-primary") : "text-gray-400")} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  isActive && isKitchen ? "bg-rose-800 text-white" : "bg-rose-100 text-rose-600"
                )}>
                  {item.badge}
                </span>
              )}
            </>
          )

          if (isKitchen && setActiveTab) {
             return (
              <button
                key={i}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left mb-1",
                  isActive 
                    ? "bg-rose-900 text-white shadow-lg shadow-rose-900/20" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {content}
              </button>
             )
          }

          return (
            <Link
              key={i}
              to={item.path || '#'}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {content}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 shrink-0 space-y-4">
        {isKitchen && (
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
               <User className="h-6 w-6 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Kitchen Staff</p>
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${kitchenStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <p className="text-xs text-gray-500 capitalize">{kitchenStatus || 'Offline'}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
