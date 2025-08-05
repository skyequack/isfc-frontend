import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ChecklistsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Security Compliance Checklists</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Network Security Checklist</h2>
          <p className="text-gray-600 mb-4">Ensure your network infrastructure meets security standards</p>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Firewall configuration review</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Network segmentation verification</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Access control validation</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Data Protection Checklist</h2>
          <p className="text-gray-600 mb-4">Verify data protection and privacy compliance</p>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Encryption at rest verification</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Data backup validation</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Access logging review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
