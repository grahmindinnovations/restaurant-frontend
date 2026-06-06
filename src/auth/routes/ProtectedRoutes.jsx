import { lazy } from 'react'
import { Route, Navigate } from 'react-router-dom'
import ProtectedPortal from '../guards/ProtectedPortal'
import {
  AdminGuard,
  EmployeeGuard,
  KitchenGuard,
  ManagerGuard,
  ReceptionGuard,
} from './routeGuards'

const POSPage = lazy(() => import('../../reception/pages/POSPage'))
const TablesPage = lazy(() => import('../../reception/pages/TablesPage'))
const BillingPage = lazy(() => import('../../reception/pages/BillingPage'))
const ReportsPage = lazy(() => import('../../reception/pages/ReportsPage'))
const KitchenDisplay = lazy(() => import('../../kitchen/KitchenDisplay'))
const InventoryRoutes = lazy(() => import('../../inventory/InventoryRoutes'))
const EmployeeRoutes = lazy(() => import('../../employee/EmployeeRoutes'))
const StaffPage = lazy(() => import('../../components/pages/StaffPage'))
const AdminLayout = lazy(() => import('../../components/admin/layout/AdminLayout'))
const Dashboard = lazy(() => import('../../components/admin/dashboard/Dashboard'))
const AdminStaffLayout = lazy(() => import('../../components/admin/staff/AdminStaffLayout'))
const StaffList = lazy(() => import('../../components/admin/staff/StaffList'))
const StaffRegister = lazy(() => import('../../components/admin/staff/StaffRegister'))
const AccessManagement = lazy(() => import('../../components/admin/staff/AccessManagement'))
const StaffAttendance = lazy(() => import('../../components/admin/staff/StaffAttendance'))
const StaffPayroll = lazy(() => import('../../components/admin/staff/StaffPayroll'))
const StaffRoles = lazy(() => import('../../components/admin/staff/StaffRoles'))
const StaffShift = lazy(() => import('../../components/admin/staff/StaffShift'))
const AdminInventoryLayout = lazy(
  () => import('../../components/admin/inventory/AdminInventoryLayout'),
)
const ItemsDatabase = lazy(() => import('../../components/admin/inventory/ItemsDatabase'))
const LowStockAlerts = lazy(() => import('../../components/admin/inventory/LowStockAlerts'))
const Analytics = lazy(() => import('../../components/admin/analytics/Analytics'))
const Notifications = lazy(() => import('../../components/admin/notifications/Notifications'))
const Settings = lazy(() => import('../../components/admin/settings/Settings'))
const Logs = lazy(() => import('../../components/admin/logs/Logs.jsx'))
const POSIntegration = lazy(() => import('../../components/admin/integration/POS'))
const KDSIntegration = lazy(() => import('../../components/admin/integration/KDS'))
const PaymentsIntegration = lazy(() => import('../../components/admin/integration/Payments'))

/** Protected routes — spread inside <Routes> as direct <Route> children. */
export function getProtectedRoutes() {
  return [
    <Route key="/portal/:role" path="/portal/:role" element={<ProtectedPortal />} />,

    <Route
      key="/pos"
      path="/pos"
      element={
        <ReceptionGuard>
          <POSPage />
        </ReceptionGuard>
      }
    />,
    <Route
      key="/tables"
      path="/tables"
      element={
        <ReceptionGuard>
          <TablesPage />
        </ReceptionGuard>
      }
    />,
    <Route
      key="/billing"
      path="/billing"
      element={
        <ReceptionGuard>
          <BillingPage />
        </ReceptionGuard>
      }
    />,
    <Route
      key="/reports"
      path="/reports"
      element={
        <ReceptionGuard>
          <ReportsPage />
        </ReceptionGuard>
      }
    />,

    <Route
      key="/kitchen"
      path="/kitchen"
      element={
        <KitchenGuard>
          <KitchenDisplay />
        </KitchenGuard>
      }
    />,

    <Route
      key="/inventory/*"
      path="/inventory/*"
      element={
        <ManagerGuard>
          <InventoryRoutes />
        </ManagerGuard>
      }
    />,
    <Route
      key="/employee/*"
      path="/employee/*"
      element={
        <EmployeeGuard>
          <EmployeeRoutes />
        </EmployeeGuard>
      }
    />,

    <Route
      key="/staff"
      path="/staff"
      element={
        <AdminGuard>
          <StaffPage />
        </AdminGuard>
      }
    />,

    <Route
      key="/admin"
      path="/admin"
      element={
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="staff" element={<AdminStaffLayout />}>
        <Route index element={<StaffList />} />
        <Route path="access" element={<AccessManagement />} />
        <Route path="register" element={<StaffRegister />} />
      </Route>
      <Route path="staff/attendance" element={<StaffAttendance />} />
      <Route path="staff/payroll" element={<StaffPayroll />} />
      <Route path="staff/roles" element={<StaffRoles />} />
      <Route path="staff/shifts" element={<StaffShift />} />
      <Route path="inventory" element={<AdminInventoryLayout />}>
        <Route index element={<ItemsDatabase />} />
        <Route path="low-stock" element={<LowStockAlerts />} />
      </Route>
      <Route path="inventory/suppliers" element={<Navigate to="/admin/inventory" replace />} />
      <Route path="inventory/stock-entry" element={<Navigate to="/admin/inventory" replace />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="settings" element={<Settings />} />
      <Route path="logs" element={<Logs />} />
      <Route path="integration/pos" element={<POSIntegration />} />
      <Route path="integration/kds" element={<KDSIntegration />} />
      <Route path="integration/payments" element={<PaymentsIntegration />} />
    </Route>,
  ]
}
