'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import InventoryCard, { InventoryItem } from '@/components/Inventory/InventoryCard'

// Additional interfaces for inventory management
interface InventoryFilters {
  category: string
  status: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired'
  sortBy: 'name' | 'quantity' | 'expiry' | 'category'
  sortOrder: 'asc' | 'desc'
}

// Mock data - replace with real API calls
const getMockInventory = (): InventoryItem[] => [
  {
    id: 'INV-001',
    name: 'Atlantic Salmon Fillets',
    category: 'seafood',
    quantity: 25,
    unit: 'lbs',
    minStock: 10,
    maxStock: 50,
    cost: 18.50,
    supplier: 'Ocean Fresh Seafood',
    expiryDate: '2024-01-20',
    location: 'Walk-in Freezer A'
  },
  {
    id: 'INV-002',
    name: 'Organic Mixed Greens',
    category: 'produce',
    quantity: 5,
    unit: 'cases',
    minStock: 8,
    maxStock: 20,
    cost: 24.00,
    supplier: 'Green Valley Farms',
    expiryDate: '2024-01-17',
    location: 'Walk-in Cooler B'
  },
  {
    id: 'INV-003',
    name: 'Premium Ground Beef',
    category: 'meat',
    quantity: 40,
    unit: 'lbs',
    minStock: 15,
    maxStock: 60,
    cost: 12.75,
    supplier: 'Prime Meats Co.',
    expiryDate: '2024-01-25',
    location: 'Walk-in Freezer B'
  },
  {
    id: 'INV-004',
    name: 'Whole Grain Flour',
    category: 'pantry',
    quantity: 200,
    unit: 'lbs',
    minStock: 50,
    maxStock: 300,
    cost: 2.85,
    supplier: 'Bakery Supply Pro',
    expiryDate: '2024-08-15',
    location: 'Dry Storage Room'
  },
  {
    id: 'INV-005',
    name: 'Heavy Cream',
    category: 'dairy',
    quantity: 2,
    unit: 'gallons',
    minStock: 5,
    maxStock: 15,
    cost: 8.90,
    supplier: 'Dairy Fresh Direct',
    expiryDate: '2024-01-16',
    location: 'Walk-in Cooler A'
  },
  {
    id: 'INV-006',
    name: 'Fresh Basil',
    category: 'herbs',
    quantity: 12,
    unit: 'bunches',
    minStock: 8,
    maxStock: 25,
    cost: 3.50,
    supplier: 'Herb Garden Supply',
    expiryDate: '2024-01-18',
    location: 'Walk-in Cooler B'
  },
  {
    id: 'INV-007',
    name: 'Olive Oil Extra Virgin',
    category: 'pantry',
    quantity: 0,
    unit: 'bottles',
    minStock: 12,
    maxStock: 36,
    cost: 15.25,
    supplier: 'Mediterranean Imports',
    expiryDate: '2024-12-30',
    location: 'Dry Storage Room'
  },
  {
    id: 'INV-008',
    name: 'Button Mushrooms',
    category: 'produce',
    quantity: 8,
    unit: 'lbs',
    minStock: 10,
    maxStock: 25,
    cost: 6.75,
    supplier: 'Green Valley Farms',
    expiryDate: '2024-01-14',
    location: 'Walk-in Cooler B'
  }
]

export default function InventoryPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<InventoryFilters>({
    category: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isSignedIn) {
      // Simulate API call
      setTimeout(() => {
        const mockData = getMockInventory()
        setInventory(mockData)
        setFilteredInventory(mockData)
      }, 500)
    }
  }, [isSignedIn])

  useEffect(() => {
    let filtered = [...inventory]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category)
    }

    // Filter by status
    if (filters.status !== 'all') {
      const now = new Date()
      filtered = filtered.filter(item => {
        const expiryDate = new Date(item.expiryDate)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (filters.status) {
          case 'in-stock':
            return item.quantity > item.minStock && daysUntilExpiry > 3
          case 'low-stock':
            return item.quantity <= item.minStock && item.quantity > 0
          case 'out-of-stock':
            return item.quantity === 0
          case 'expired':
            return daysUntilExpiry <= 3
          default:
            return true
        }
      })
    }

    // Sort items
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase() 
          bValue = b.name.toLowerCase()
          break
        case 'quantity':
          aValue = a.quantity
          bValue = b.quantity
          break
        case 'expiry':
          aValue = new Date(a.expiryDate).getTime()
          bValue = new Date(b.expiryDate).getTime()
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    })

    setFilteredInventory(filtered)
  }, [inventory, searchTerm, filters])

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

  const handleRestockItem = async (itemId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.id === itemId ? { ...item, quantity: item.maxStock } : item
      )
    )
  }

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowDetailsModal(true)
  }

  const getInventoryStats = () => {
    const now = new Date()
    const stats = inventory.reduce((acc, item) => {
      const expiryDate = new Date(item.expiryDate)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      acc.total++
      if (item.quantity === 0) acc.outOfStock++
      else if (item.quantity <= item.minStock) acc.lowStock++
      else acc.inStock++
      
      if (daysUntilExpiry <= 3) acc.expiringSoon++
      
      return acc
    }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, expiringSoon: 0 })
    
    return stats
  }

  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))]
  const stats = getInventoryStats()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Inventory Management</h1>
            <p className="text-secondary mt-2">Track and manage kitchen inventory levels</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-primary transition-colors font-medium"
          >
            ➕ Add Item
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-primary rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Items</p>
              <p className="text-2xl font-bold text-light">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-success rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">In Stock</p>
              <p className="text-2xl font-bold text-success">{stats.inStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-accent-teal rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Low Stock</p>
              <p className="text-2xl font-bold text-accent-teal">{stats.lowStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-accent-green rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Out of Stock</p>
              <p className="text-2xl font-bold text-accent-green">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-secondary rounded-lg">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Expiring Soon</p>
              <p className="text-2xl font-bold text-secondary">{stats.expiringSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search items, categories, suppliers, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent placeholder-gray-400"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as InventoryFilters['status'] }))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="expired">Expiring Soon</option>
          </select>
          
          {/* Sort Options */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              setFilters(prev => ({ 
                ...prev, 
                sortBy: sortBy as InventoryFilters['sortBy'], 
                sortOrder: sortOrder as InventoryFilters['sortOrder'] 
              }))
            }}
            className="px-4 py-2 bg-gray-700 border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="quantity-desc">Quantity High-Low</option>
            <option value="quantity-asc">Quantity Low-High</option>
            <option value="expiry-asc">Expiry Date Soon-Late</option>
            <option value="expiry-desc">Expiry Date Late-Soon</option>
            <option value="category-asc">Category A-Z</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-light mb-2">No Items Found</h3>
          <p className="text-gray-300 mb-6">
            {searchTerm || filters.category !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your filters or search terms' 
              : 'No inventory items have been added yet'
            }
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-primary transition-colors font-medium"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInventory.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onRestock={handleRestockItem}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-light">Add New Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Item name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent placeholder-gray-400"
                />
                <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option value="">Select category</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Quantity"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Unit (lbs, cases, etc.)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min stock"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max stock"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Cost per unit ($)"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Supplier"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="Expiry date"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Storage location"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-light">Inventory Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Item ID</label>
                    <p className="text-lg font-semibold text-light">{selectedItem.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Category</label>
                    <p className="text-lg font-semibold text-light capitalize">{selectedItem.category}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400">Item Name</label>
                  <p className="text-xl font-bold text-light">{selectedItem.name}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Stock</label>
                    <p className="text-lg font-semibold">{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Min Stock</label>
                    <p className="text-lg">{selectedItem.minStock} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Max Stock</label>
                    <p className="text-lg">{selectedItem.maxStock} {selectedItem.unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cost per Unit</label>
                    <p className="text-lg font-semibold">${selectedItem.cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Value</label>
                    <p className="text-lg font-semibold">${(selectedItem.quantity * selectedItem.cost).toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier</label>
                  <p className="text-lg">{selectedItem.supplier}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                    <p className="text-lg">{new Date(selectedItem.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Storage Location</label>
                    <p className="text-lg">{selectedItem.location}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Edit Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
