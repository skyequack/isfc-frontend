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
              Streamline your catering operations, manage orders efficiently, 
              and deliver exceptional dining experiences with our comprehensive management system.
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
                  Staff Login
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

          {/* Quick Actions for Signed In Users */}
          <SignedIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Link 
                href="/dashboard"
                className="group bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  📊
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Dashboard</h3>
                <p className="text-gray-600">View daily operations, revenue metrics, and performance analytics</p>
              </Link>
              
              <Link 
                href="/checklists"
                className="group bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  📋
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Orders</h3>
                <p className="text-gray-600">Manage catering orders, track delivery status, and customer requirements</p>
              </Link>
              
              <Link 
                href="/escalations"
                className="group bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                  ⚠️
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Issues</h3>
                <p className="text-gray-600">Handle customer complaints, operational issues, and urgent requests</p>
              </Link>
            </div>
          </SignedIn>

          {/* Features Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Complete Catering Management
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to run a successful catering business efficiently
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  �
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Order Management</h3>
                <p className="text-gray-600">Track orders from booking to delivery with real-time status updates and customer notifications</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  🍴
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Menu Planning</h3>
                <p className="text-gray-600">Create and manage seasonal menus, track inventory, and optimize food costs</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  �
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Staff Coordination</h3>
                <p className="text-gray-600">Schedule staff, assign tasks, and coordinate event logistics seamlessly</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  �
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Financial Tracking</h3>
                <p className="text-gray-600">Monitor revenue, expenses, and profitability with detailed financial reports</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Events Catered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Order Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
