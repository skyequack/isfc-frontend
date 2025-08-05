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
              From order tracking to quality control, we've got your business covered.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/dashboard" 
                className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
              >
                Access Dashboard
              </Link>
              <Link 
                href="/dashboard" 
                className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
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
        </div>
      </div>
    </div>
  )
}
