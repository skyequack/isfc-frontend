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
  );
}
