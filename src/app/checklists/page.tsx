'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ChecklistsPage() {
  const { isLoaded, isSignedIn } = useUser()
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
      <h1 className="text-3xl font-bold mb-6">Catering Orders</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Orders</h2>
          <p className="text-gray-600 mb-4">Manage and track today&apos;s catering orders</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded border-l-4 border-green-400">
              <div>
                <div className="font-medium">Corporate Lunch - TechCorp</div>
                <div className="text-sm text-gray-600">50 people • 12:00 PM</div>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <div>
                <div className="font-medium">Wedding Reception - Johnson</div>
                <div className="text-sm text-gray-600">120 people • 6:00 PM</div>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Preparing</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <div>
                <div className="font-medium">Birthday Party - Smith</div>
                <div className="text-sm text-gray-600">25 people • 3:00 PM</div>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Scheduled</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Menu Planning</h2>
          <p className="text-gray-600 mb-4">Plan and customize menus for upcoming events</p>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors">
              <div className="font-medium">Appetizer Selection</div>
              <div className="text-sm text-gray-600">Choose from 15 available options</div>
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors">
              <div className="font-medium">Main Course Options</div>
              <div className="text-sm text-gray-600">Customize protein and dietary preferences</div>
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors">
              <div className="font-medium">Dessert & Beverages</div>
              <div className="text-sm text-gray-600">Complete the dining experience</div>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Inventory Status</h2>
          <p className="text-gray-600 mb-4">Monitor ingredient availability and stock levels</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Fresh Vegetables</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">In Stock</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Premium Meats</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">In Stock</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Specialty Sauces</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Low Stock</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Gluten-Free Options</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Reorder</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Quality Control</h2>
          <p className="text-gray-600 mb-4">Ensure all orders meet ISFC quality standards</p>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm">Temperature control verification</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm">Presentation standards check</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Final taste test completed</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Packaging and delivery prep</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
