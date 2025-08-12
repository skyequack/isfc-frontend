'use client'

import { Card } from '@/components/ui/Card'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface OrderItemType {
  id: string
  name: string
  quantity: number
}

interface EscalationType {
  id: string
  description: string
}

interface OrderType {
  id: string
  customerName: string
  event: string
  date: Date
  time: string | null
  guests: number
  status: string
  items: OrderItemType[]
  escalations: EscalationType[]
  createdAt: Date
}

export default function OrdersList({ initialOrders }: { initialOrders: OrderType[] }) {
  const { isLoaded, isSignedIn } = useUser()
  const [orders] = useState<OrderType[]>(initialOrders)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.event.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="bg-white">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{order.event}</h3>
                <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p>{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p>{order.time || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guests</p>
                  <p>{order.guests}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className={getStatusColor(order.status)}>{order.status}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-500">Items</p>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-sm">
                      {item.quantity}x {item.name}
                    </li>
                  ))}
                </ul>
              </div>

              {order.escalations.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-500">Escalations</p>
                  <ul className="list-disc list-inside">
                    {order.escalations.map((escalation) => (
                      <li key={escalation.id} className="text-sm text-red-600">
                        {escalation.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">
                Created {formatDistanceToNow(new Date(order.createdAt))} ago
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'text-yellow-600'
    case 'CONFIRMED':
      return 'text-blue-600'
    case 'IN_PROGRESS':
      return 'text-green-600'
    case 'COMPLETED':
      return 'text-green-700'
    case 'CANCELLED':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}
