'use client'

import { useState } from 'react'

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customerName: string
  event: string
  date: string
  time: string
  guests: number
  status: OrderStatus
  total: number
  items: OrderItem[]
  requirements: string[]
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  category: 'appetizer' | 'main' | 'dessert' | 'beverage'
}

const statusConfig: Record<OrderStatus, { 
  label: string
  color: string
  bgColor: string
}> = {
  pending: {
    label: 'Pending Review',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-white',
    bgColor: 'bg-accent'
  },
  preparing: {
    label: 'In Kitchen',
    color: 'text-white',
    bgColor: 'bg-secondary'
  },
  ready: {
    label: 'Ready for Pickup',
    color: 'text-white',
    bgColor: 'bg-success'
  },
  delivered: {
    label: 'Delivered',
    color: 'text-white',
    bgColor: 'bg-primary'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-800',
    bgColor: 'bg-red-100'
  }
}

interface OrderCardProps {
  order: Order
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
  onViewDetails: (order: Order) => void
}

export default function OrderCard({ order, onStatusChange, onViewDetails }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const config = statusConfig[order.status]

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true)
    await onStatusChange(order.id, newStatus)
    setIsUpdating(false)
  }

  const getNextStatuses = (): OrderStatus[] => {
    switch (order.status) {
      case 'pending':
        return ['confirmed', 'cancelled']
      case 'confirmed':
        return ['preparing', 'cancelled']
      case 'preparing':
        return ['ready', 'confirmed']
      case 'ready':
        return ['delivered', 'preparing']
      case 'delivered':
        return []
      case 'cancelled':
        return ['pending']
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getUrgencyIndicator = () => {
    const now = new Date()
    const eventDate = new Date(order.date + ' ' + order.time)
    const hoursUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntil < 2) return { color: 'text-red-600', icon: '🔴', label: 'Urgent' }
    if (hoursUntil < 24) return { color: 'text-yellow-600', icon: '🟡', label: 'Priority' }
    return { color: 'text-green-600', icon: '🟢', label: 'Normal' }
  }

  const urgency = getUrgencyIndicator()

  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-md transition-all duration-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">#{order.id}</h3>
            <span className={`text-sm ${urgency.color} font-medium`}>
              {urgency.icon} {urgency.label}
            </span>
          </div>
          <p className="text-gray-600 font-medium">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.event}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}>
          {config.label}
        </span>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <span className="text-sm text-gray-500">Date & Time</span>
          <p className="font-medium">{order.date}</p>
          <p className="text-sm text-gray-600">{order.time}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Guests</span>
          <p className="font-medium">{order.guests} people</p>
          <span className="text-sm text-gray-500">Total: {formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Items ({order.items.length})</p>
        <div className="flex flex-wrap gap-1">
          {order.items.slice(0, 3).map((item) => (
            <span key={item.id} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              {item.name} x{item.quantity}
            </span>
          ))}
          {order.items.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              +{order.items.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Special Requirements */}
      {order.requirements.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Special Requirements</p>
          <div className="flex flex-wrap gap-1">
            {order.requirements.map((req, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={() => onViewDetails(order)}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm"
        >
          View Details
        </button>
        
        <div className="flex gap-2">
          {getNextStatuses().map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                status === 'cancelled' || status === 'delivered'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
