import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Checklists</h2>
          <p className="text-gray-600 mb-4">Manage your compliance checklists</p>
          <a 
            href="/checklists" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            View Checklists
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Escalations</h2>
          <p className="text-gray-600 mb-4">Handle security escalations</p>
          <a 
            href="/escalations" 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            View Escalations
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Reports</h2>
          <p className="text-gray-600 mb-4">Generate compliance reports</p>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            disabled
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  )
}
