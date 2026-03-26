import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'

import EmployeeLayout from './layout/EmployeeLayout'
import Dashboard from './pages/Dashboard'
import StaffList from './pages/staff/StaffList'
import StaffAdd from './pages/staff/StaffAdd'
import StaffRoles from './pages/staff/StaffRoles'
import StaffShift from './pages/staff/StaffShift'
import StaffAttendance from './pages/staff/StaffAttendance'
import StaffPayroll from './pages/staff/StaffPayroll'

export default function EmployeeRoutes() {
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
    return <Navigate to="/login?role=employee" replace />
  }

  return (
    <Routes>
      <Route element={<EmployeeLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="staff" element={<Navigate to="/employee/staff/list" replace />} />
        <Route path="staff/list" element={<StaffList />} />
        <Route path="staff/add" element={<StaffAdd />} />
        <Route path="staff/roles" element={<StaffRoles />} />
        <Route path="staff/shift" element={<StaffShift />} />
        <Route path="staff/attendance" element={<StaffAttendance />} />
        <Route path="staff/payroll" element={<StaffPayroll />} />
        <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

