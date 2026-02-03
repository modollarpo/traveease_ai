'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function HotelConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your hotel reservation has been successfully booked</p>
        </div>

        {/* Booking Details Card */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Confirmation Number</p>
                  <p className="text-lg font-bold text-gray-900">TRV-HTL-2024-78392</p>
                </div>
                <Badge variant="success">Confirmed</Badge>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Grand Plaza Hotel</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Check-in</p>
                    <p className="font-medium text-gray-900">March 15, 2026</p>
                    <p className="text-gray-500">After 3:00 PM</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Check-out</p>
                    <p className="font-medium text-gray-900">March 22, 2026</p>
                    <p className="text-gray-500">Before 11:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Room Type</p>
                <p className="font-medium text-gray-900">Deluxe King Room with City View</p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• 2 Adults</li>
                  <li>• 7 Nights</li>
                  <li>• Free Breakfast Included</li>
                  <li>• Free WiFi</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Guest Information</p>
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-sm text-gray-600">john.doe@example.com</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>

              <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Total Amount Paid</span>
                  <span className="text-2xl font-bold text-emerald-600">$2,450.00</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Includes taxes and fees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card variant="outlined" className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                  <rect width="100" height="100" fill="white" />
                  {/* QR Code Pattern - simplified representation */}
                  <rect x="10" y="10" width="15" height="15" fill="black" />
                  <rect x="35" y="10" width="5" height="5" fill="black" />
                  <rect x="50" y="10" width="10" height="10" fill="black" />
                  <rect x="75" y="10" width="15" height="15" fill="black" />
                  <rect x="10" y="35" width="5" height="5" fill="black" />
                  <rect x="35" y="35" width="30" height="30" fill="black" />
                  <rect x="75" y="35" width="5" height="5" fill="black" />
                  <rect x="10" y="75" width="15" height="15" fill="black" />
                  <rect x="50" y="75" width="10" height="10" fill="black" />
                  <rect x="75" y="75" width="15" height="15" fill="black" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Mobile Check-in</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Show this QR code at the hotel reception for quick check-in
                </p>
                <Button variant="outline" size="sm">
                  Download QR Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card variant="default" className="mb-6">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg">ℹ️</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Cancellation Policy</p>
                  <p className="text-gray-600">
                    Free cancellation until March 8, 2026. After this date, cancellation fees may apply.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-600 text-lg">🆔</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Required Documents</p>
                  <p className="text-gray-600">
                    Please bring a valid photo ID and the credit card used for booking at check-in.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-600 text-lg">✅</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Pre-Registration</p>
                  <p className="text-gray-600">
                    Complete online check-in 24 hours before arrival to skip the queue.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Contact */}
        <Card variant="outlined" className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Hotel Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Address</p>
                <p className="text-gray-900">123 Main Street, Downtown<br />New York, NY 10001</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Phone</p>
                <p className="text-gray-900">+1 (555) 987-6543</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">reservations@grandplaza.com</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Check-in Instructions</p>
                <p className="text-gray-900">Front desk available 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="primary" size="lg">
            📧 Email Confirmation
          </Button>
          <Button variant="outline" size="lg">
            📅 Add to Calendar
          </Button>
          <Button variant="outline" size="lg">
            📱 Share Booking
          </Button>
          <Button variant="outline" size="lg">
            🖨️ Print Voucher
          </Button>
        </div>

        {/* Next Steps */}
        <div className="mt-8 text-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="lg">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Support Banner */}
        <div className="mt-8 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our 24/7 customer support team is here to assist you
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="sm">
              💬 Live Chat
            </Button>
            <Button variant="outline" size="sm">
              📞 Call Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
