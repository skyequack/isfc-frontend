'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'



interface NavigationItem {
  name: string
  href: string
  description: string
  icon: string
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    description: 'Overview and analytics',
    icon: '🏠'
  },
  {
    name: 'Quotation',
    href: '/quotations',
    description: 'Generate quotations',
    icon: '📊'
  },
  {
    name: 'Brands Center',
    href: '/orders',
    description: 'Manage catering orders',
    icon: '⚡'
  },
  {
    name: 'Account',
    href: '/inventory',
    description: 'Track stock levels',
    icon: '👤'
  },
  {
    name: 'Kitchen Status',
    href: '/menu',
    description: 'Menu planning',
    icon: '⚙️'
  },
  {
    name: 'Checklist',
    href: '/staff',
    description: 'Staff management',
    icon: '📋'
  },
  {
    name: 'Waste Log',
    href: '/reports',
    description: 'Analytics and reports',
    icon: '♻️'
  },
  {
    name: 'History',
    href: '/history',
    description: 'View history',
    icon: '🕐'
  },
  {
    name: 'Help',
    href: '/help',
    description: 'Get help',
    icon: '❓'
  }
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-full w-56 shadow-lg bg-white">
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="px-6 py-8">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-40 h-20 mx-auto">
              <img src="/images/isfc-logo.png" alt="ISFC Logo" className="w-full h-full object-contain" />
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4">
          <nav className="space-y-1">
            <div className="my-2 mx-4 border-t border-gray-200"></div>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const showSeparatorAfter = item.name === 'Kitchen Status' || item.name === 'History'
              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#5e775a] text-white shadow-sm' 
                        : 'text-[#a47149] hover:bg-gray-50 hover:text-[#a47149]'
                    }`}
                    title={item.description}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                  {showSeparatorAfter && (
                    <div className="my-2 mx-4 border-t border-gray-200"></div>
                  )}
                </div>
              )
            })}
          </nav>
          
          {/* Logout */}
          <div className="mt-1">
            <Link
              href="/login"
              className="flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200"
            >
              <span className="text-base flex-shrink-0">🚪</span>
              <span className="font-medium">Log Out</span>
            </Link>
          </div>
        </div>

        {/* User Account */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserButton 
                afterSignOutUrl="/login"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-lg"
                  }
                }}
              />
              <span className="text-gray-600 text-sm font-medium">Account</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
