import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              🍽️ Fresh • Quality • Service
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              ISFC Catering
              <span className="text-orange-600"> Management</span>
              <br />Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline your catering operations with our comprehensive management platform. 
              From order tracking to quality control, we&apos;ve got your business covered.
            </p>
            
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/sign-up"
                  className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
                >
                  Get Started
                </Link>
                <Link 
                  href="/sign-in" 
                  className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/dashboard" 
                  className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
                >
                  Go to Dashboard
                </Link>
              </div>
            </SignedIn>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Operations Dashboard</h3>
              <p className="text-gray-600">View daily operations, revenue metrics, and performance analytics</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Management</h3>
              <p className="text-gray-600">Track orders, manage menus, and coordinate with kitchen staff</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Issue Tracking</h3>
              <p className="text-gray-600">Monitor and resolve operational issues quickly and efficiently</p>
            </div>
          </div>

          <SignedIn>
            {/* Quick Access for Signed In Users */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Access</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Link href="/dashboard" className="group">
                  <div className="bg-orange-50 p-6 rounded-lg border-2 border-transparent group-hover:border-orange-300 transition-all">
                    <div className="text-3xl mb-3">📊</div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-600">Dashboard</h4>
                    <p className="text-sm text-gray-600">Overview & Analytics</p>
                  </div>
                </Link>
                <Link href="/checklists" className="group">
                  <div className="bg-orange-50 p-6 rounded-lg border-2 border-transparent group-hover:border-orange-300 transition-all">
                    <div className="text-3xl mb-3">📋</div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-600">Orders</h4>
                    <p className="text-sm text-gray-600">Manage Catering Orders</p>
                  </div>
                </Link>
                <Link href="/escalations" className="group">
                  <div className="bg-orange-50 p-6 rounded-lg border-2 border-transparent group-hover:border-orange-300 transition-all">
                    <div className="text-3xl mb-3">⚠️</div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-600">Issues</h4>
                    <p className="text-sm text-gray-600">Track & Resolve Issues</p>
                  </div>
                </Link>
              </div>
            </div>
          </SignedIn>

          {/* Statistics Section */}
          <div className="mt-16 bg-orange-600 rounded-xl text-white p-8">
            <h3 className="text-2xl font-bold mb-8 text-center">Why Choose ISFC?</h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-orange-100">Events Catered</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-orange-100">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-orange-100">Support Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">15+</div>
                <div className="text-orange-100">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
