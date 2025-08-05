'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.firstName || 'User'}!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-semibold">Orders</h2>
          </div>
          <p className="text-gray-600 mb-4">Manage your catering orders and menus</p>
          <Link 
            href="/checklists" 
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 inline-block transition-colors"
          >
            View Orders
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold">Issues</h2>
          </div>
          <p className="text-gray-600 mb-4">Track and resolve operational issues</p>
          <Link 
            href="/escalations" 
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 inline-block transition-colors"
          >
            View Issues
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-semibold">Analytics</h2>
          </div>
          <p className="text-gray-600 mb-4">View performance metrics and reports</p>
          <button className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>

      <div className="mt-12 bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-600">24</div>
            <div className="text-sm text-orange-700">Active Orders</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">2</div>
            <div className="text-sm text-orange-700">Open Issues</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">98%</div>
            <div className="text-sm text-orange-700">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  )
}
