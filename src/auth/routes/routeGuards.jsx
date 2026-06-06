import { ACCESS_AREAS } from '../config/routeConfig'
import ProtectedRoute from '../guards/ProtectedRoute'

export function ReceptionGuard({ children }) {
  return (
    <ProtectedRoute roles={ACCESS_AREAS.reception.roles}>{children}</ProtectedRoute>
  )
}

export function KitchenGuard({ children }) {
  return <ProtectedRoute roles={ACCESS_AREAS.kitchen.roles}>{children}</ProtectedRoute>
}

export function ManagerGuard({ children }) {
  return <ProtectedRoute roles={ACCESS_AREAS.manager.roles}>{children}</ProtectedRoute>
}

export function EmployeeGuard({ children }) {
  return <ProtectedRoute roles={ACCESS_AREAS.employee.roles}>{children}</ProtectedRoute>
}

export function AdminGuard({ children }) {
  return <ProtectedRoute roles={ACCESS_AREAS.admin.roles}>{children}</ProtectedRoute>
}
