'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OrderCard, { Order, OrderStatus } from '@/components/Orders/OrderCard'

// Mock data - replace with real API calls
const getMockOrders = (): Order[] => [
  {
    id: 'ORD-001',
    customerName: 'TechCorp Inc.',
    event: 'Annual Meeting & Awards Ceremony',
    date: '2024-01-15',
    time: '12:00 PM',
    guests: 50,
    status: 'preparing',
    total: 2750.00,
    items: [
      { id: '1', name: 'Grilled Salmon', quantity: 25, price: 35.00, category: 'main' },
      { id: '2', name: 'Vegetarian Pasta', quantity: 15, price: 28.00, category: 'main' },
      { id: '3', name: 'Caesar Salad', quantity: 50, price: 12.00, category: 'appetizer' },
      { id: '4', name: 'Chocolate Mousse', quantity: 50, price: 8.00, category: 'dessert' }
    ],
    requirements: ['Gluten-free options', 'Vegetarian meals', 'Presentation setup']
  },
  {
    id: 'ORD-002',
    customerName: 'Johnson Wedding',
    event: 'Wedding Reception',
    date: '2024-01-16',
    time: '7:00 PM',
    guests: 120,
    status: 'confirmed',
    total: 8500.00,
    items: [
      { id: '5', name: 'Prime Rib', quantity: 80, price: 65.00, category: 'main' },
      { id: '6', name: 'Herb-crusted Chicken', quantity: 40, price: 45.00, category: 'main' },
      { id: '7', name: 'Wedding Cake', quantity: 1, price: 350.00, category: 'dessert' }
    ],
    requirements: ['White tablecloths', 'Kosher preparation', 'Late evening service']
  },
  {
    id: 'ORD-003',
    customerName: 'Smith Birthday Party',
    event: '50th Birthday Celebration',
    date: '2024-01-15',
    time: '3:00 PM',
    guests: 25,
    status: 'ready',
    total: 890.00,
    items: [
      { id: '8', name: 'BBQ Platter', quantity: 25, price: 32.00, category: 'main' },
      { id: '9', name: 'Birthday Cake', quantity: 1, price: 90.00, category: 'dessert' }
    ],
    requirements: ['Birthday decorations', 'Outdoor setup']
  },
  {
    id: 'ORD-004',
    customerName: 'Downtown Fitness',
    event: 'Health & Wellness Seminar',
    date: '2024-01-17',
    time: '11:30 AM',
    guests: 35,
    status: 'pending',
    total: 1200.00,
    items: [
      { id: '10', name: 'Quinoa Bowl', quantity: 35, price: 24.00, category: 'main' },
      { id: '11', name: 'Fresh Fruit Platter', quantity: 3, price: 45.00, category: 'appetizer' }
    ],
    requirements: ['Healthy options only', 'Vegan alternatives', 'No processed foods']
  }
]

export default function OrdersPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isSignedIn) {
      // Simulate API call
      setTimeout(() => {
        setOrders(getMockOrders())
        setFilteredOrders(getMockOrders())
      }, 500)
    }
  }, [isSignedIn])

  useEffect(() => {
    let filtered = orders

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, searchTerm])

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
                  <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowDetails(true)
  }

  const getStatusCounts = () => {
    const counts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<OrderStatus, number>)
    
    return {
      all: orders.length,
      ...counts
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Order Management</h1>
            <p className="text-secondary mt-2">Manage and track all catering orders</p>
          </div>
          <button className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-primary transition-colors font-medium">
            ➕ New Order
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow border p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by customer, event, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all' as const, label: 'All Orders', count: statusCounts.all },
              { key: 'pending' as const, label: 'Pending', count: statusCounts.pending || 0 },
              { key: 'confirmed' as const, label: 'Confirmed', count: statusCounts.confirmed || 0 },
              { key: 'preparing' as const, label: 'Preparing', count: statusCounts.preparing || 0 },
              { key: 'ready' as const, label: 'Ready', count: statusCounts.ready || 0 },
              { key: 'delivered' as const, label: 'Delivered', count: statusCounts.delivered || 0 }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === filter.key
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-secondary hover:bg-highlight'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters or search terms' 
              : 'No orders have been created yet'
            }
          </p>
          <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium">
            Create New Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                    <p className="text-lg font-semibold">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-lg font-semibold capitalize">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer</label>
                    <p className="text-lg font-semibold">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total</label>
                    <p className="text-lg font-semibold">${selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Event</label>
                  <p className="text-lg">{selectedOrder.event}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="text-lg">{selectedOrder.date} at {selectedOrder.time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guests</label>
                    <p className="text-lg">{selectedOrder.guests} people</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-3 block">Order Items</label>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">x{item.quantity}</p>
                          <p className="text-sm text-gray-600">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requirements */}
                {selectedOrder.requirements.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-3 block">Special Requirements</label>
                    <div className="space-y-2">
                      {selectedOrder.requirements.map((req, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p>{req}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Edit Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
