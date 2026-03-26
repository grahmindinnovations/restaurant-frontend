import { useState, useEffect } from 'react'
import Sidebar from '../ReceptionSidebar'
import Header from '../../layouts/Header'
import { Button } from '../../components/ui/button'
import { io } from 'socket.io-client'
import { apiFetch } from '../../services/api'
import { printBill } from '../utils/printBill'

export default function BillingPage() {
  const [orders, setOrders] = useState([])
  const [socket, setSocket] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    apiFetch('/api/orders')
      .then(data => {
        const list = Array.isArray(data.orders) ? data.orders : []
        const activeOrders = list.filter(o => o.status !== 'draft')
        setOrders(activeOrders)
      })
      .catch(err => console.error('Error fetching orders:', err))

    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('orders:update', (updatedOrders) => {
      const activeOrders = updatedOrders.filter(o => o.status !== 'draft')
      setOrders(activeOrders)
    })

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const markAsPaid = (order) => {
    const orderId = String(order?.id || '')
    if (!orderId) return
    apiFetch(`/api/orders/${encodeURIComponent(orderId)}/pay`, {
      method: 'POST',
    })
      .then(() => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'paid' } : o))
        printBill({ ...order, status: 'paid' })
      })
      .catch(err => console.error('Failed to mark as paid:', err))
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'billed': return 'bg-blue-100 text-blue-800'
      case 'kot': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr] bg-slate-50">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Header
          title={<span>Reception <span className="text-rose-700">Billing</span></span>}
          currentTime={currentTime}
        />

        <main className="p-6">
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 uppercase">
                      {order.type === 'takeaway' ? 'Parcel' : (order.table || 'Dine-in')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {order.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      ₹{order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} uppercase`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.status !== 'paid' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => markAsPaid(order)}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {order.status === 'paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printBill(order)}
                        >
                          Print Bill
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

