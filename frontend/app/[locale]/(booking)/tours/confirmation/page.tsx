'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ToursConfirmationPage() {
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
          <p className="text-gray-600">Your tour has been successfully booked</p>
        </div>

        {/* Booking Details Card */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Tour Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="text-lg font-bold text-gray-900">TRV-TOUR-2024-45678</p>
                </div>
                <Badge variant="success">Confirmed</Badge>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Eiffel Tower Summit with Skip-the-Line Access
                </h3>
                <img
                  src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&h=200&fit=crop"
                  alt="Eiffel Tower Tour"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">Paris, France</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-medium text-gray-900">Cultural & Historical</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">March 20, 2026</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">10:00 AM</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">2 hours</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Language</p>
                    <p className="font-medium text-gray-900">English</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Participants</p>
                <ul className="text-sm text-gray-900 space-y-1">
                  <li>• 2 Adults ($89.00 each)</li>
                  <li>• 1 Child ($62.30 - 30% discount)</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Lead Traveler</p>
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-sm text-gray-600">john.doe@example.com</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>

              <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Total Amount Paid</span>
                  <span className="text-2xl font-bold text-emerald-600">$240.30</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Includes all taxes and fees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tour Voucher */}
        <Card variant="outlined" className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                  <rect width="100" height="100" fill="white" />
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
                <h3 className="font-semibold text-gray-900 mb-2">Tour Voucher</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Show this voucher to your tour guide at the meeting point
                </p>
                <Button variant="outline" size="sm">
                  Download Voucher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Point Instructions */}
        <Card variant="default" className="mb-6">
          <CardHeader>
            <CardTitle>Meeting Point Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                <p className="text-sm text-gray-600 mb-1">Eiffel Tower South Security Entrance</p>
                <p className="text-sm text-gray-600">Champ de Mars, 5 Avenue Anatole France, 75007 Paris</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Important:</span> Please arrive 15 minutes before the tour start time. 
                  Look for your guide holding a blue Traveease sign at the South Security Entrance (Pilier 1).
                </p>
              </div>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                [Google Maps Embedded Here]
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What to Bring */}
        <Card variant="default" className="mb-6">
          <CardHeader>
            <CardTitle>What to Bring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-sky-600">✓</span>
                <span className="text-gray-600">Valid photo ID or passport</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-600">✓</span>
                <span className="text-gray-600">Confirmation voucher (printed or mobile)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-600">✓</span>
                <span className="text-gray-600">Comfortable walking shoes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-600">✓</span>
                <span className="text-gray-600">Camera for photos</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-600">✓</span>
                <span className="text-gray-600">Water bottle</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-600">✓</span>
                <span className="text-gray-600">Weather-appropriate clothing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card variant="default" className="mb-8">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="text-emerald-600 text-lg">✅</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Free Cancellation</p>
                  <p className="text-gray-600">
                    Cancel up to 24 hours before the tour for a full refund.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-600 text-lg">⚠️</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Weather Policy</p>
                  <p className="text-gray-600">
                    Tours operate rain or shine. In case of severe weather, we'll contact you with alternative options.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg">ℹ️</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Accessibility</p>
                  <p className="text-gray-600">
                    Elevators are available. Please notify us if you have mobility concerns.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-rose-600 text-lg">📞</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Emergency Contact</p>
                  <p className="text-gray-600">
                    For last-minute changes or emergencies: +33 1 23 45 67 89 (available 24/7)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="primary" size="lg">
            📧 Email Voucher
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
          <h3 className="font-semibold text-gray-900 mb-2">Questions About Your Tour?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our customer support team is available 24/7 to assist you
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
