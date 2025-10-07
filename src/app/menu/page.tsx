'use client'

import { useEffect, useState } from 'react'

interface MenuItem {
  id: string
  name: string
  category: 'appetizer' | 'main' | 'dessert' | 'beverage'
  description: string
  price: number
  ingredients: string[]
  allergens: string[]
  dietaryInfo: string[]
  preparationTime: number
  isActive: boolean
  popularity: number
}

const getMockMenuItems = (): MenuItem[] => [
  {
    id: 'MENU-001',
    name: 'Grilled Atlantic Salmon',
    category: 'main',
    description: 'Fresh Atlantic salmon fillet with lemon herb butter, served with roasted vegetables',
    price: 35.00,
    ingredients: ['Atlantic salmon', 'lemon', 'butter', 'herbs', 'mixed vegetables'],
    allergens: ['fish', 'dairy'],
    dietaryInfo: ['gluten-free', 'keto-friendly'],
    preparationTime: 25,
    isActive: true,
    popularity: 85
  },
  {
    id: 'MENU-002',
    name: 'Caesar Salad',
    category: 'appetizer',
    description: 'Crisp romaine lettuce with house-made Caesar dressing, parmesan, and croutons',
    price: 12.00,
    ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'Caesar dressing'],
    allergens: ['dairy', 'gluten', 'eggs'],
    dietaryInfo: ['vegetarian'],
    preparationTime: 10,
    isActive: true,
    popularity: 92
  },
  {
    id: 'MENU-003',
    name: 'Prime Rib Roast',
    category: 'main',
    description: 'Slow-roasted prime rib with au jus and horseradish cream',
    price: 65.00,
    ingredients: ['prime rib', 'herbs', 'beef stock', 'horseradish', 'cream'],
    allergens: ['dairy'],
    dietaryInfo: ['gluten-free'],
    preparationTime: 180,
    isActive: true,
    popularity: 78
  },
  {
    id: 'MENU-004',
    name: 'Chocolate Mousse Cake',
    category: 'dessert',
    description: 'Rich chocolate mousse with dark chocolate ganache and berry garnish',
    price: 8.00,
    ingredients: ['dark chocolate', 'cream', 'eggs', 'butter', 'berries'],
    allergens: ['dairy', 'eggs', 'gluten'],
    dietaryInfo: ['contains-nuts'],
    preparationTime: 45,
    isActive: true,
    popularity: 89
  }
]

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const mockData = getMockMenuItems()
      setMenuItems(mockData)
      setFilteredItems(mockData)
    }, 500)
  }, [])

  useEffect(() => {
    let filtered = [...menuItems]

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    setFilteredItems(filtered)
  }, [menuItems, searchTerm, categoryFilter])

  const categoryIcons = {
    appetizer: '🥗',
    main: '🍽️',
    dessert: '🍰',
    beverage: '🥤'
  }

  const categories = ['all', 'appetizer', 'main', 'dessert', 'beverage']

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Menu Planning</h1>
            <p className="text-secondary mt-2">Manage catering menu items and pricing</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-primary transition-colors font-medium"
          >
            ➕ Add Menu Item
          </button>
        </div>
      </div>

      {/* Menu Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {categories.slice(1).map((category) => {
          const categoryItems = menuItems.filter(item => item.category === category)
          const averagePrice = categoryItems.length > 0 
            ? categoryItems.reduce((sum, item) => sum + item.price, 0) / categoryItems.length 
            : 0
          
          return (
            <div key={category} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize flex items-center">
                    <span className="mr-2">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                    {category}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{categoryItems.length}</p>
                  <p className="text-sm text-gray-500">Avg: ${averagePrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search menu items, ingredients, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  categoryFilter === category
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-secondary hover:bg-highlight'
                }`}
              >
                {category === 'all' ? 'All Items' : 
                  `${categoryIcons[category as keyof typeof categoryIcons]} ${category.charAt(0).toUpperCase() + category.slice(1)}`
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your filters or search terms' 
              : 'No menu items have been created yet'
            }
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Create First Menu Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <span className="text-2xl">{categoryIcons[item.category]}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent">${item.price.toFixed(2)}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1">{item.popularity}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-gray-700">{item.description}</p>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Preparation Time</p>
                  <p className="text-sm text-gray-900">🕒 {item.preparationTime} minutes</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Key Ingredients</p>
                  <div className="flex flex-wrap gap-1">
                    {item.ingredients.slice(0, 3).map((ingredient, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {ingredient}
                      </span>
                    ))}
                    {item.ingredients.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{item.ingredients.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {item.allergens.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Allergens</p>
                    <div className="flex flex-wrap gap-1">
                      {item.allergens.map((allergen, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          ⚠️ {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.dietaryInfo.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Dietary Information</p>
                    <div className="flex flex-wrap gap-1">
                      {item.dietaryInfo.map((diet, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          ✅ {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 border-t bg-gray-50 rounded-b-lg">
                <div className="flex space-x-3">
                  <button className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                    📝 Edit
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                    📋 Copy
                  </button>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.isActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}>
                    {item.isActive ? '🚫 Disable' : '✅ Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Menu Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Item name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">Select category</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <textarea
                  placeholder="Description"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price ($)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Prep time (minutes)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Ingredients (comma-separated)"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                
                <input
                  type="text"
                  placeholder="Allergens (comma-separated)"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                
                <input
                  type="text"
                  placeholder="Dietary info (comma-separated)"
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
                  Add Menu Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
