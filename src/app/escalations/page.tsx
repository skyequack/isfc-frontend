'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Escalation {
  id: string
  priority: string
  status: string
  description: string
  createdAt: string
  order?: { id: string }
}

export default function EscalationsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [escalations, setEscalations] = useState<Escalation[]>([])

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/escalations')
        .then(res => res.json())
        .then(setEscalations)
        .catch(err => console.error('Failed to load escalations', err))
    }
  }, [isSignedIn])

  if (!isLoaded) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!isSignedIn) {
    return null
  }

  const badgeClasses = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600'
      case 'medium':
        return 'bg-yellow-600'
      default:
        return 'bg-blue-600'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Operational Issues</h1>
      <div className="space-y-6">
        {escalations.map((issue) => (
          <div key={issue.id} className="bg-white border p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{issue.description}</h2>
              <span className={`${badgeClasses(issue.priority)} text-white px-2 py-1 rounded text-sm`}>
                {issue.priority.toUpperCase()}
              </span>
            </div>
            {issue.order && (
              <p className="text-gray-700 mb-4">Related Order: {issue.order.id}</p>
            )}
            <div className="flex gap-2">
              <button className="bg-gray-200 px-4 py-2 rounded">Acknowledge</button>
              <button className="bg-gray-200 px-4 py-2 rounded">Resolve</button>
            </div>
          </div>
        ))}
        {escalations.length === 0 && (
          <p className="text-gray-600">No escalations found.</p>
        )}
      </div>
    </div>
  )
}
