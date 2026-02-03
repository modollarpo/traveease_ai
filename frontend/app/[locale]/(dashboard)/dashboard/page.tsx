'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  // Sample data
  const upcomingTrips = [
    {
      id: 1,
      destination: 'Paris, France',
      startDate: '2026-03-15',
      endDate: '2026-03-22',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop',
      bookingCount: 3,
    },
    {
      id: 2,
      destination: 'Tokyo, Japan',
      startDate: '2026-05-10',
      endDate: '2026-05-25',
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1540959375944-7049f642e9a1?w=400&h=250&fit=crop',
      bookingCount: 2,
    },
    {
      id: 3,
      destination: 'New York, USA',
      startDate: '2026-07-01',
      endDate: '2026-07-08',
      status: 'planning',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop',
      bookingCount: 0,
    },
  ];

  const recentBookings = [
    {
      id: 1,
      type: '✈️ Flight',
      details: 'CDG-JFK • Air France AF101',
      date: '2026-03-15',
      price: '$1,200',
      status: 'confirmed',
    },
    {
      id: 2,
      type: '🏨 Hotel',
      details: 'Le Marais Hotel • 3 nights',
      date: '2026-03-15',
      price: '$2,400',
      status: 'confirmed',
    },
    {
      id: 3,
      type: '🚗 Car Rental',
      details: 'Hertz • 5 days',
      date: '2026-03-15',
      price: '$450',
      status: 'pending',
    },
    {
      id: 4,
      type: '🎫 Tour',
      details: 'Eiffel Tower & Louvre • 2 days',
      date: '2026-03-16',
      price: '$300',
      status: 'confirmed',
    },
  ];

  const stats = [
    { label: 'Total Spent', value: '$4,350', trend: '+$850 this month' },
    { label: 'Trips Planned', value: '3', trend: '+1 this month' },
    { label: 'Bookings', value: '8', trend: 'All confirmed' },
    { label: 'Saved Destinations', value: '24', trend: '+5 this month' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back, John!</h1>
        <p className="text-sky-100 mb-6">Ready for your next adventure? Start planning your dream trip.</p>
        <div className="flex gap-4">
          <Button variant="primary" size="lg" className="bg-white text-sky-600 hover:bg-gray-100">
            Search Flights
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-sky-600">
            Browse Destinations
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} variant="default">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-2">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trips */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Upcoming Trips</h2>
            <Link href="/trips/new">
              <Button variant="primary" size="md">
                Plan New Trip
              </Button>
            </Link>
          </div>

          {upcomingTrips.map((trip) => (
            <Card key={trip.id} variant="default" interactive={true}>
              <CardContent className="p-0">
                <div className="flex gap-4">
                  {/* Image */}
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 py-4 pr-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {trip.destination}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(trip.startDate).toLocaleDateString()} -{' '}
                          {new Date(trip.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          trip.status === 'confirmed'
                            ? 'success'
                            : trip.status === 'pending'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {trip.bookingCount} bookings • 7 days
                    </p>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Bookings */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" fullWidth size="md" className="justify-start">
                ✈️ Book Flight
              </Button>
              <Button variant="outline" fullWidth size="md" className="justify-start">
                🏨 Find Hotel
              </Button>
              <Button variant="outline" fullWidth size="md" className="justify-start">
                🚗 Rent Car
              </Button>
              <Button variant="outline" fullWidth size="md" className="justify-start">
                🎫 Book Tour
              </Button>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {booking.type}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {booking.details}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      {booking.price}
                    </p>
                    <Badge
                      variant={
                        booking.status === 'confirmed'
                          ? 'success'
                          : 'warning'
                      }
                      size="sm"
                      className="mt-1"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Link href="/bookings" className="block mt-3">
                <Button variant="ghost" size="sm" fullWidth>
                  View All Bookings →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Travel Tips */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>💡 Travel Tips</CardTitle>
          <CardDescription>
            Tips to help you get the most out of your trips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-xl">✓</span>
              <p className="text-gray-700">
                Book flights on Tuesdays for better deals
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✓</span>
              <p className="text-gray-700">
                Sign up for travel insurance to protect your trips
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✓</span>
              <p className="text-gray-700">
                Use our price tracking to get alerts when flights drop
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
