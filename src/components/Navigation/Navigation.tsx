'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

interface NavigationItem {
  name: string
  href: string
  description: string
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Quotation',
    href: '/quotations',
    description: 'Generate quotations'
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    description: 'Overview and analytics'
  },
  {
    name: 'Orders',
    href: '/orders',
    description: 'Manage catering orders'
  },
  {
    name: 'Inventory',
    href: '/inventory',
    description: 'Track stock levels'
  },
  {
    name: 'Menu',
    href: '/menu',
    description: 'Menu planning'
  },
  {
    name: 'Staff',
    href: '/staff',
    description: 'Staff management'
  },
  {
    name: 'Reports',
    href: '/reports',
    description: 'Analytics and reports'
  }
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-dark shadow-sm border-b border-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#011936'}}>
                <span className="text-white font-bold text-sm">🍽️</span>
              </div>
              <span className="font-bold text-xl text-light">ISFC Catering</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white' : 'hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#82A3A1' : 'transparent',
                    color: isActive ? 'white' : '#465362'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#465362'
                      e.currentTarget.style.color = '#C0DFA1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#C0DFA1'
                    }
                  }}
                  title={item.description}
                >
                  <span className="text-lg"></span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Button */}
          <div className="flex items-center space-x-4">
            <UserButton 
              afterSignOutUrl="/login"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? '#82A3A1' : 'transparent',
                    color: isActive ? 'white' : '#C0DFA1'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#465362'
                      e.currentTarget.style.color = '#C0DFA1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#C0DFA1'
                    }
                  }}
                >
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
