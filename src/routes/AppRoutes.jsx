import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RoleSelect from '../components/pages/RoleSelect'

const Login = lazy(() => import('../components/pages/Login'))
const Portal = lazy(() => import('../components/pages/Portal'))
const POSPage = lazy(() => import('../reception/pages/POSPage'))
const KitchenDisplay = lazy(() => import('../kitchen/KitchenDisplay'))
const BillingPage = lazy(() => import('../reception/pages/BillingPage'))
const TablesPage = lazy(() => import('../reception/pages/TablesPage'))
const StaffPage = lazy(() => import('../components/pages/StaffPage'))
const ReportsPage = lazy(() => import('../reception/pages/ReportsPage'))
const InventoryRoutes = lazy(() => import('../inventory/InventoryRoutes'))
const InventoryLogin = lazy(() => import('../inventory/InventoryLogin'))
const EmployeeRoutes = lazy(() => import('../employee/EmployeeRoutes'))

const AdminLayout = lazy(() => import('../components/admin/layout/AdminLayout'))
const Dashboard = lazy(() => import('../components/admin/dashboard/Dashboard'))
const StaffList = lazy(() => import('../components/admin/staff/StaffList'))
const StaffRegister = lazy(() => import('../components/admin/staff/StaffRegister'))
const StaffAttendance = lazy(() => import('../components/admin/staff/StaffAttendance'))
const StaffPayroll = lazy(() => import('../components/admin/staff/StaffPayroll'))
const StaffRoles = lazy(() => import('../components/admin/staff/StaffRoles'))
const StaffShift = lazy(() => import('../components/admin/staff/StaffShift'))
const Suppliers = lazy(() => import('../components/admin/inventory/Suppliers'))
const StockEntry = lazy(() => import('../components/admin/inventory/StockEntry'))
const ItemsDatabase = lazy(() => import('../components/admin/inventory/ItemsDatabase'))
const LowStockAlerts = lazy(() => import('../components/admin/inventory/LowStockAlerts'))
const Analytics = lazy(() => import('../components/admin/analytics/Analytics'))
const Notifications = lazy(() => import('../components/admin/notifications/Notifications'))
const Settings = lazy(() => import('../components/admin/settings/Settings'))
const Logs = lazy(() => import('../components/admin/logs/Logs'))
const POSIntegration = lazy(() => import('../components/admin/integration/POS'))
const KDSIntegration = lazy(() => import('../components/admin/integration/KDS'))
const PaymentsIntegration = lazy(() => import('../components/admin/integration/Payments'))

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal/:role" element={<Portal />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/kitchen" element={<KitchenDisplay />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/inventory-login" element={<InventoryLogin />} />
        <Route path="/inventory/*" element={<InventoryRoutes />} />
        <Route path="/employee/*" element={<EmployeeRoutes />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff" element={<StaffList />} />
          <Route path="staff/register" element={<StaffRegister />} />
          <Route path="staff/attendance" element={<StaffAttendance />} />
          <Route path="staff/payroll" element={<StaffPayroll />} />
          <Route path="staff/roles" element={<StaffRoles />} />
          <Route path="staff/shifts" element={<StaffShift />} />
          <Route path="inventory" element={<ItemsDatabase />} />
          <Route path="inventory/suppliers" element={<Suppliers />} />
          <Route path="inventory/stock-entry" element={<StockEntry />} />
          <Route path="inventory/low-stock" element={<LowStockAlerts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="logs" element={<Logs />} />
          <Route path="integration/pos" element={<POSIntegration />} />
          <Route path="integration/kds" element={<KDSIntegration />} />
          <Route path="integration/payments" element={<PaymentsIntegration />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
