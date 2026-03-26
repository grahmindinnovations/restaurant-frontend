import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'

import DashboardLayout from './layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import InventoryDatabase from './pages/InventoryDatabase'
import StockAlerts from './pages/StockAlerts'
import StockEntry from './pages/StockEntry'
import SupplierManagement from './pages/SupplierManagement'

export default function InventoryRoutes() {
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setChecking(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/inventory-login" replace />
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="suppliers" element={<SupplierManagement />} />
        <Route path="stock-entry" element={<StockEntry />} />
        <Route path="database" element={<InventoryDatabase />} />
        <Route path="alerts" element={<StockAlerts />} />
        <Route path="*" element={<Navigate to="/inventory" replace />} />
      </Route>
    </Routes>
  )
}
