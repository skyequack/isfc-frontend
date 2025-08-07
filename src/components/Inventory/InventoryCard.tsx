'use client'

import { useState, useMemo } from 'react'

export interface InventoryItem {
  id: string
  name: string
  category: 'protein' | 'vegetable' | 'pantry' | 'dairy' | 'beverage' | 'spice' | 'seafood' | 'produce' | 'meat' | 'herbs'
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  cost: number
  supplier: string
  expiryDate: string
  location: string
}

interface InventoryCardProps {
  item: InventoryItem
  onRestock: (itemId: string) => Promise<void>
  onViewDetails?: (item: InventoryItem) => void
}

const categoryConfig = {
  protein: { color: 'text-accent-green', bgColor: 'bg-success', icon: '🥩' },
  vegetable: { color: 'text-success', bgColor: 'bg-highlight', icon: '🥬' },
  pantry: { color: 'text-accent-teal', bgColor: 'bg-accent', icon: '🥫' },
  dairy: { color: 'text-primary', bgColor: 'bg-secondary', icon: '🥛' },
  beverage: { color: 'text-secondary', bgColor: 'bg-primary', icon: '🥤' },
  spice: { color: 'text-accent-green', bgColor: 'bg-success', icon: '🌶️' },
  seafood: { color: 'text-accent-teal', bgColor: 'bg-accent', icon: '🐟' },
  produce: { color: 'text-success', bgColor: 'bg-highlight', icon: '🍃' },
  meat: { color: 'text-accent-green', bgColor: 'bg-success', icon: '🥩' },
  herbs: { color: 'text-success', bgColor: 'bg-highlight', icon: '🌿' }
}

export default function InventoryCard({ item, onRestock, onViewDetails }: InventoryCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isRestocking, setIsRestocking] = useState(false)

  const stockStatus = useMemo(() => {
    const percentage = (item.quantity / item.maxStock) * 100
    const isLow = item.quantity <= item.minStock
    const isOut = item.quantity === 0
    
    if (isOut) {
      return { status: 'out', color: 'text-light', bgColor: 'bg-accent-green', label: 'Out of Stock' }
    }
    if (isLow) {
      return { status: 'low', color: 'text-primary', bgColor: 'bg-accent-teal', label: 'Low Stock' }
    }
    if (percentage < 50) {
      return { status: 'medium', color: 'text-secondary', bgColor: 'bg-primary', label: 'Medium' }
    }
    return { status: 'good', color: 'text-light', bgColor: 'bg-success', label: 'In Stock' }
  }, [item.quantity, item.minStock, item.maxStock])

  const expiryInfo = useMemo(() => {
    if (!item.expiryDate) return { isExpired: false, isExpiringSoon: false, daysUntilExpiry: 0, label: 'No expiry' }
    
    const today = new Date()
    const expiry = new Date(item.expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    const isExpired = daysUntilExpiry < 0
    const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 7
    
    let label = ''
    if (isExpired) {
      label = `Expired ${Math.abs(daysUntilExpiry)} days ago`
    } else if (isExpiringSoon) {
      if (daysUntilExpiry === 0) {
        label = 'Expires today'
      } else if (daysUntilExpiry === 1) {
        label = 'Expires tomorrow'
      } else {
        label = `Expires in ${daysUntilExpiry} days`
      }
    } else {
      label = `Expires ${expiry.toLocaleDateString()}`
    }
    
    return { isExpired, isExpiringSoon, daysUntilExpiry, label }
  }, [item.expiryDate])

  const handleRestock = async () => {
    setIsRestocking(true)
    try {
      await onRestock(item.id)
    } finally {
      setIsRestocking(false)
      setShowActions(false)
    }
  }

  const config = categoryConfig[item.category] || categoryConfig.pantry
  const stockPercentage = Math.min((item.quantity / item.maxStock) * 100, 100)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <span className="text-xl">{config.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-light truncate">{item.name}</h3>
              <p className="text-sm text-gray-300 capitalize">{item.category}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
            {stockStatus.label}
          </div>
        </div>
      </div>

      {/* Stock Level */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Stock Level</span>
          <span className="text-sm font-semibold text-light">
            {item.quantity} / {item.maxStock} {item.unit}
          </span>
        </div>
        
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              stockStatus.status === 'out' ? 'bg-accent-green' :
              stockStatus.status === 'low' ? 'bg-accent-teal' :
              stockStatus.status === 'medium' ? 'bg-primary' : 'bg-success'
            }`}
            style={{ width: `${stockPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>Min: {item.minStock} {item.unit}</span>
          <span>Max: {item.maxStock} {item.unit}</span>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Cost per Unit</p>
            <p className="font-medium text-light">${item.cost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Value</p>
            <p className="font-medium text-light">${(item.quantity * item.cost).toFixed(2)}</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-gray-400">Supplier</p>
          <p className="font-medium text-light truncate">{item.supplier}</p>
        </div>

        <div className="text-sm">
          <p className="text-gray-400">Location</p>
          <p className="font-medium text-light truncate">{item.location}</p>
        </div>

        {/* Expiry Warning */}
        {(expiryInfo.isExpired || expiryInfo.isExpiringSoon) && (
          <div className={`p-2 rounded-lg text-sm font-medium ${
            expiryInfo.isExpired ? 'bg-accent-green text-light border border-accent-teal' :
            'bg-accent-teal text-primary border border-accent'
          }`}>
            <div className="flex items-center space-x-1">
              <span>{expiryInfo.isExpired ? '⚠️' : '⏰'}</span>
              <span>{expiryInfo.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-600 bg-gray-700 rounded-b-lg">
        {!showActions ? (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowActions(true)}
              className="flex-1 bg-accent text-white px-3 py-2 rounded-lg hover:bg-primary transition-colors text-sm font-medium"
            >
              ⚡ Quick Actions
            </button>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(item)}
                className="px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                📋
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={handleRestock}
                disabled={isRestocking}
                className="flex-1 bg-success text-white px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isRestocking ? '⏳ Restocking...' : `📦 Restock to ${item.maxStock}`}
              </button>
            </div>
            <button
              onClick={() => setShowActions(false)}
              className="w-full text-gray-400 text-sm hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
