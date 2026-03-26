import {
  AlertTriangle,
  Database,
  FilePlus2,
  LayoutDashboard,
  Truck,
} from 'lucide-react'

export const navItems = [
  { label: 'Dashboard', to: '/inventory', icon: LayoutDashboard },
  { label: 'Supplier Management', to: '/inventory/suppliers', icon: Truck },
  { label: 'Stock Entry', to: '/inventory/stock-entry', icon: FilePlus2 },
  { label: 'Inventory Database', to: '/inventory/database', icon: Database },
  { label: 'Stock Alerts', to: '/inventory/alerts', icon: AlertTriangle },
]

