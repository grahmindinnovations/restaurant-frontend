import { Navigate } from 'react-router-dom'

/** Legacy route — POS menu is managed under /admin/inventory */
export default function StockEntry() {
  return <Navigate to="/admin/inventory" replace />
}
