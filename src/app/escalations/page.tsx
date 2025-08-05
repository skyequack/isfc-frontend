'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function EscalationsPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Operational Issues</h1>
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-red-800">High Priority Issue</h2>
            <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">URGENT</span>
          </div>
          <p className="text-red-700 mb-4">Kitchen equipment malfunction affecting today&apos;s lunch service</p>
          <div className="flex gap-2">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Address Immediately
            </button>
            <button className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50">
              Escalate to Manager
            </button>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-yellow-800">Medium Priority Issue</h2>
            <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm">MEDIUM</span>
          </div>
          <p className="text-yellow-700 mb-4">Low inventory on specialty dietary options for tomorrow&apos;s events</p>
          <div className="flex gap-2">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
              Review Inventory
            </button>
            <button className="border border-yellow-600 text-yellow-600 px-4 py-2 rounded hover:bg-yellow-50">
              Contact Supplier
            </button>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-blue-800">Information</h2>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">INFO</span>
          </div>
          <p className="text-blue-700 mb-4">New food safety guidelines published - staff training required</p>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Guidelines
            </button>
            <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50">
              Schedule Training
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
