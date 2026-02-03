'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function FlightConfirmationPage() {
  const bookingRef = 'AFR-2026-ABC123';
  const booking = {
    airline: 'Air France',
    flightNumber: 'AF 101',
    departure: '08:00',
    arrival: '20:15',
    departureAirport: 'JFK',
    departureCity: 'New York',
    arrivalAirport: 'CDG',
    arrivalCity: 'Paris',
    departureDate: 'March 15, 2026',
    duration: '7h 15m',
    aircraft: 'Boeing 777-300ER',
    seat: '12A',
    price: 1200,
    addOns: 75,
    total: 1275,
  };

  const passenger = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-lg">
            Your flight is booked. Check your email for confirmation details.
          </p>
        </div>

        {/* Booking Reference */}
        <Card variant="elevated" className="mb-6 bg-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Booking Reference</p>
              <p className="text-4xl font-bold text-gray-900 font-mono mb-2">
                {bookingRef}
              </p>
              <p className="text-sm text-gray-600">
                Save this reference for check-in and modifications
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Flight Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Your Flight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Flight Header */}
                  <div className="flex items-center justify-between pb-6 border-b">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {booking.departureDate}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.airline} {booking.flightNumber}
                      </p>
                    </div>
                    <Badge variant="success">Confirmed</Badge>
                  </div>

                  {/* Flight Timeline */}
                  <div className="flex items-center gap-6">
                    {/* Departure */}
                    <div className="flex-1">
                      <p className="text-4xl font-bold text-gray-900">
                        {booking.departure}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {booking.departureAirport}
                      </p>
                      <p className="text-gray-600 font-medium">
                        {booking.departureCity}
                      </p>
                    </div>

                    {/* Flight Duration */}
                    <div className="text-center">
                      <div className="relative h-1 w-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded mb-3">
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {booking.duration}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Non-stop</p>
                    </div>

                    {/* Arrival */}
                    <div className="flex-1 text-right">
                      <p className="text-4xl font-bold text-gray-900">
                        {booking.arrival}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {booking.arrivalAirport}
                      </p>
                      <p className="text-gray-600 font-medium">
                        {booking.arrivalCity}
                      </p>
                    </div>
                  </div>

                  {/* Flight Details Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Aircraft</p>
                      <p className="font-semibold text-gray-900">
                        {booking.aircraft}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Seat</p>
                      <p className="font-semibold text-gray-900">
                        {booking.seat}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Details */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Passenger</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">
                      {passenger.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {passenger.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">
                      {passenger.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Check your email
                      </p>
                      <p className="text-sm text-gray-600">
                        Confirmation and e-ticket sent to {passenger.email}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Check-in online
                      </p>
                      <p className="text-sm text-gray-600">
                        Available 24 hours before departure
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Arrive early
                      </p>
                      <p className="text-sm text-gray-600">
                        Plan to arrive 3 hours before departure
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flight (1 pax)</span>
                    <span className="font-semibold">${booking.price}</span>
                  </div>
                  {booking.addOns > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Add-ons</span>
                      <span className="font-semibold">+${booking.addOns}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-3">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${booking.total}
                  </span>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    ✓ Payment confirmed via Credit Card
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    onClick={() =>
                      window.location.href =
                        'mailto:' + passenger.email + '?subject=Flight Confirmation'
                    }
                  >
                    Download E-Ticket
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    size="md"
                    onClick={() => window.print()}
                  >
                    Print Confirmation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Helpful Links */}
            <Card variant="default" className="mt-6">
              <CardContent className="pt-6 space-y-2">
                <Link href="/bookings" className="block">
                  <Button variant="ghost" fullWidth size="sm" className="justify-start">
                    📋 My Bookings
                  </Button>
                </Link>
                <Link href="/flights" className="block">
                  <Button variant="ghost" fullWidth size="sm" className="justify-start">
                    ✈️ Book Another Flight
                  </Button>
                </Link>
                <Link href="/hotels" className="block">
                  <Button variant="ghost" fullWidth size="sm" className="justify-start">
                    🏨 Find Hotel
                  </Button>
                </Link>
                <Link href="/support" className="block">
                  <Button variant="ghost" fullWidth size="sm" className="justify-start">
                    💬 Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-8">
          <Link href="/dashboard" className="flex-1 max-w-xs">
            <Button variant="primary" fullWidth size="lg">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/hotels" className="flex-1 max-w-xs">
            <Button variant="outline" fullWidth size="lg">
              Continue Trip Planning
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
