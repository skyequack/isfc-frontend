import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function EscalationsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Security Escalations</h1>
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-red-800">High Priority Alert</h2>
            <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">CRITICAL</span>
          </div>
          <p className="text-red-700 mb-4">Unauthorized access attempt detected on production server</p>
          <div className="flex gap-2">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Investigate
            </button>
            <button className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50">
              Escalate
            </button>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-yellow-800">Medium Priority Alert</h2>
            <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm">MEDIUM</span>
          </div>
          <p className="text-yellow-700 mb-4">Compliance deadline approaching for security audit</p>
          <div className="flex gap-2">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
              Review
            </button>
            <button className="border border-yellow-600 text-yellow-600 px-4 py-2 rounded hover:bg-yellow-50">
              Assign
            </button>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-blue-800">Information</h2>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">INFO</span>
          </div>
          <p className="text-blue-700 mb-4">New security policy update available for review</p>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
