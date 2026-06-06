import { Navigate, useParams } from 'react-router-dom'
import { parseRoleId } from '../../services/roles'
import ProtectedRoute from './ProtectedRoute'
import Portal from '../../components/pages/Portal'

export default function ProtectedPortal() {
  const { role } = useParams()
  const roleId = parseRoleId(role)

  if (!roleId) {
    return <Navigate to="/access-denied" replace />
  }

  return (
    <ProtectedRoute roles={[roleId, 'admin']}>
      <Portal />
    </ProtectedRoute>
  )
}
