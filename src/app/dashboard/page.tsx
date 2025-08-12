'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AnalyticsCard from '@/components/Dashboard/AnalyticsCard'

// Type definitions
interface AnalyticsMetric {
  title: string
  value: string | number
  trend: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: string
  color: 'orange' | 'green' | 'blue' | 'red' | 'purple'
}

interface RecentOrder {
  id: string
  customer: string
  event: string
  date: string
  status: string
  guests: number
}

interface UrgentTask {
  id: number
  task: string
  priority: string
  dueTime: string
}

interface StaffMember {
  name: string
  role: string
  shift: string
  status: string
}

interface DashboardData {
  analytics: AnalyticsMetric[]
  recentOrders: RecentOrder[]
  urgentTasks: UrgentTask[]
  staffSchedule: StaffMember[]
}

// Mock data - replace with real API calls
const getDashboardData = (): DashboardData => ({
  analytics: [
    {
      title: 'Total Revenue',
      value: '$47,320',
      trend: 'up' as const,
      trendValue: '+12.3%',
      icon: '💰',
      color: 'green' as const
    },
    {
      title: 'Active Orders',
      value: '24',
      trend: 'up' as const,
      trendValue: '+8',
      icon: '📋',
      color: 'orange' as const
    },
    {
      title: 'Customer Satisfaction',
      value: '98.5%',
      trend: 'up' as const,
      trendValue: '+2.1%',
      icon: '⭐',
      color: 'green' as const
    },
    {
      title: 'Low Stock Items',
      value: '3',
      trend: 'down' as const,
      trendValue: '-2',
      icon: '📦',
      color: 'red' as const
    }
  ],
  recentOrders: [
    { id: 'ORD-001', customer: 'TechCorp Inc.', event: 'Annual Meeting', date: 'Today', status: 'preparing', guests: 50 },
    { id: 'ORD-002', customer: 'Johnson Wedding', event: 'Reception', date: 'Tomorrow', status: 'confirmed', guests: 120 },
    { id: 'ORD-003', customer: 'Smith Birthday', event: 'Party', date: 'Today', status: 'ready', guests: 25 }
  ],
  urgentTasks: [
    { id: 1, task: 'Prepare Johnson Wedding cake', priority: 'high', dueTime: '2 hours' },
    { id: 2, task: 'Restock premium vegetables', priority: 'medium', dueTime: '4 hours' },
    { id: 3, task: 'Customer dietary requirements review', priority: 'high', dueTime: '1 hour' }
  ],
  staffSchedule: [
    { name: 'Sarah Chen', role: 'Head Chef', shift: '6:00 AM - 4:00 PM', status: 'on-duty' },
    { name: 'Mike Rodriguez', role: 'Sous Chef', shift: '8:00 AM - 6:00 PM', status: 'on-duty' },
    { name: 'Emma Davis', role: 'Service Manager', shift: '10:00 AM - 8:00 PM', status: 'break' }
  ]
})

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isSignedIn) {
      // Simulate API call
      setTimeout(() => {
        setDashboardData(getDashboardData())
      }, 500)
    }
  }, [isSignedIn])

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty': return 'text-green-600 bg-green-100'
      case 'break': return 'text-yellow-600 bg-yellow-100'
      case 'off-duty': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'text-orange-600 bg-orange-100'
      case 'confirmed': return 'text-blue-600 bg-blue-100'
      case 'ready': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-dark min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light">Dashboard Overview</h1>
          <p className="text-highlight mt-2">Welcome back! Here&apos;s what&apos;s happening with your catering business.</p>
        </div>
        {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardData ? (
          dashboardData.analytics.map((metric: AnalyticsMetric, index: number) => (
            <AnalyticsCard
              key={index}
              title={metric.title}
              value={metric.value}
              trend={metric.trend}
              trendValue={metric.trendValue}
              icon={metric.icon}
              color={metric.color}
            />
          ))
        ) : (
          // Skeleton loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg shadow animate-pulse">
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-6 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-light">Recent Orders</h2>
              <Link 
                href="/orders" 
                className="text-accent-green hover:text-success font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData ? (
                dashboardData.recentOrders.map((order: RecentOrder) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-light">#{order.id}</p>
                      <p className="text-sm text-gray-300">{order.customer} • {order.event}</p>
                      <p className="text-xs text-gray-400">{order.guests} guests • {order.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse p-4 bg-gray-700 rounded-lg">
                      <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded w-1/2 mb-1"></div>
                      <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-light mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/orders/new"
                className="flex items-center gap-3 p-4 border border-accent-green rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                  <span className="text-lg">➕</span>
                </div>
                <div>
                  <p className="font-medium text-light">New Order</p>
                  <p className="text-sm text-gray-300">Create a new catering order</p>
                </div>
              </Link>
              
              <Link 
                href="/inventory"
                className="flex items-center gap-3 p-4 border border-accent-teal rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-accent-teal rounded-lg flex items-center justify-center">
                  <span className="text-lg">📦</span>
                </div>
                <div>
                  <p className="font-medium text-light">Manage Inventory</p>
                  <p className="text-sm text-gray-300">Check stock levels and restock</p>
                </div>
              </Link>
              
              <Link 
                href="/menu"
                className="flex items-center gap-3 p-4 border border-accent-green rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                  <span className="text-lg">🍽️</span>
                </div>
                <div>
                  <p className="font-medium text-light">Menu Planning</p>
                  <p className="text-sm text-gray-300">Update menus and pricing</p>
                </div>
              </Link>
              
              <Link 
                href="/reports"
                className="flex items-center gap-3 p-4 border border-primary rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="font-medium text-light">Reports</p>
                  <p className="text-sm text-gray-300">View analytics and insights</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Urgent Tasks */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-light mb-4">Urgent Tasks</h3>
            <div className="space-y-3">
              {dashboardData ? (
                dashboardData.urgentTasks.map((task: UrgentTask) => (
                  <div key={task.id} className="p-3 border-l-4 border-accent-green bg-gray-700 rounded">
                    <div className="flex items-start justify-between mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">Due in {task.dueTime}</span>
                    </div>
                    <p className="text-sm font-medium text-light">{task.task}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse p-3 bg-gray-700 rounded">
                      <div className="h-3 bg-gray-600 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Staff on Duty */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-light mb-4">Staff on Duty</h3>
            <div className="space-y-3">
              {dashboardData ? (
                dashboardData.staffSchedule.map((staff: StaffMember, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-light">{staff.name}</p>
                      <p className="text-xs text-gray-300">{staff.role}</p>
                      <p className="text-xs text-gray-400">{staff.shift}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                      {staff.status.replace('-', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-600 rounded w-20"></div>
                        <div className="h-2 bg-gray-600 rounded w-16"></div>
                        <div className="h-2 bg-gray-600 rounded w-24"></div>
                      </div>
                      <div className="h-5 bg-gray-600 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Today&apos;s Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Orders Completed</span>
                <span className="font-bold">8/12</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue</span>
                <span className="font-bold">$2,340</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Rating</span>
                <span className="font-bold">4.9⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
