import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Header from '../../layouts/Header'
import Sidebar from './Sidebar'
import { navItems } from './navItems'

export default function DashboardLayout() {
  const { pathname } = useLocation()

  const activeLabel = useMemo(() => {
    const found = navItems.find((x) => x.to === pathname)
    return found?.label || 'Dashboard'
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title={
            <span>
              Inventory <span className="text-rose-700">{activeLabel}</span>
            </span>
          }
        />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

