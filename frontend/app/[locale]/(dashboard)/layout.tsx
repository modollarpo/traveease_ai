'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'My Bookings', href: '/bookings', icon: '🎫' },
    { label: 'Itineraries', href: '/itineraries', icon: '🗺️' },
    { label: 'Wishlists', href: '/wishlists', icon: '❤️' },
    { label: 'Payment Methods', href: '/payment-methods', icon: '💳' },
    { label: 'Preferences', href: '/preferences', icon: '⚙️' },
    { label: 'Support', href: '/support', icon: '💬' },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Side - Logo & Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:block">Traveease</span>
            </Link>
          </div>

          {/* Right Side - Search & User Menu */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 flex-1 max-w-xs">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search bookings..."
                className="bg-transparent ml-2 outline-none text-sm w-full"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </button>

            {/* User Menu */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="hidden sm:block text-sm text-left">
                    <p className="font-medium text-gray-900">John Doe</p>
                    <p className="text-gray-500 text-xs">Traveler</p>
                  </div>
                </button>
              }
              items={[
                {
                  label: 'My Profile',
                  onClick: () => window.location.href = '/profile',
                  icon: '👤',
                },
                {
                  label: 'Account Settings',
                  onClick: () => window.location.href = '/settings',
                  icon: '⚙️',
                },
                {
                  label: 'Help & Support',
                  onClick: () => window.location.href = '/support',
                  icon: '💬',
                },
                { divider: true, label: '', onClick: () => {} },
                {
                  label: 'Sign out',
                  onClick: () => window.location.href = '/logout',
                  icon: '🚪',
                },
              ]}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 fixed md:relative h-full z-40`}
        >
          <nav className="space-y-2 p-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-sky-600"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
            <div className="bg-sky-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-700 mb-3">
                Upgrade to Pro and save 20%
              </p>
              <Button variant="primary" size="sm" fullWidth>
                Upgrade Now
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
