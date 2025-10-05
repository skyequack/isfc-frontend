'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useState, useEffect, createContext, useContext } from 'react'

// Create context for sidebar visibility
const SidebarContext = createContext<{
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
}>({
  isVisible: false,
  setIsVisible: () => {},
  isPinned: false,
  setIsPinned: () => {}
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show sidebar when mouse is within 50px of left edge, but only if not pinned
      if (e.clientX <= 50 && !isPinned) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isPinned]);

  // Keep sidebar visible when pinned
  useEffect(() => {
    if (isPinned) {
      setIsVisible(true);
    }
  }, [isPinned]);

  return (
    <SidebarContext.Provider value={{ isVisible, setIsVisible, isPinned, setIsPinned }}>
      {children}
    </SidebarContext.Provider>
  );
}

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
  const { isVisible, setIsVisible, isPinned, setIsPinned } = useSidebar()

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsVisible(false)
    }
  }

  const togglePin = () => {
    setIsPinned(!isPinned)
    if (!isPinned) {
      setIsVisible(true) // Ensure sidebar is visible when pinning
    }
  }

  return (
    <>
      {/* Invisible trigger zone */}
      <div className="fixed left-0 top-0 w-4 h-full z-40" />
      
      <nav 
        className={`fixed left-0 top-0 h-full w-56 shadow-lg bg-white z-50 transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseLeave={handleMouseLeave}
      >
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="px-6 py-8 relative">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-40 h-20 mx-auto">
              <img src="/images/isfc-logo.png" alt="ISFC Logo" className="w-full h-full object-contain" />
            </div>
          </Link>
          
          {/* Pin Button */}
          <button
            onClick={togglePin}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 ${
              isPinned 
                ? 'bg-[#5e775a] text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            <svg 
              className="w-4 h-4" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              {isPinned ? (
                // Filled pin icon when pinned
                <path d="M16 12V4a1 1 0 00-1-1H9a1 1 0 00-1 1v8a3 3 0 003 3h1v5a1 1 0 102 0v-5h1a3 3 0 003-3z"/>
              ) : (
                // Outline pin icon when unpinned
                <path fillRule="evenodd" d="M16 12V4a1 1 0 00-1-1H9a1 1 0 00-1 1v8a3 3 0 003 3h1v5a1 1 0 102 0v-5h1a3 3 0 003-3zM10 4h4v8a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" clipRule="evenodd"/>
              )}
            </svg>
          </button>
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
    </>
  )
}
