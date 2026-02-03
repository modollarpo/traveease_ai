'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function InsuranceConfirmationPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Protected!</h1>
          <p className="text-gray-600">Your travel insurance is now active</p>
        </div>

        {/* Policy Details */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Insurance Policy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Policy Number</p>
                  <p className="text-lg font-bold text-gray-900">TRV-INS-2024-12345</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Standard Coverage Plan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Coverage Start</p>
                    <p className="font-medium text-gray-900">March 15, 2026</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Coverage End</p>
                    <p className="font-medium text-gray-900">March 29, 2026</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Destination</p>
                    <p className="font-medium text-gray-900">Paris, France</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">14 Days</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Insured Travelers</p>
                <ul className="text-sm text-gray-900 space-y-1">
                  <li>• John Doe (Primary)</li>
                  <li>• Jane Doe</li>
                </ul>
              </div>

              <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Total Premium Paid</span>
                  <span className="text-2xl font-bold text-emerald-600">$130.00</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">$65.00 per person × 2 travelers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Summary */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Your Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Medical Emergency</p>
                  <p className="text-sm text-gray-600">Up to $100,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Trip Cancellation</p>
                  <p className="text-sm text-gray-600">Up to $10,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Lost Baggage</p>
                  <p className="text-sm text-gray-600">Up to $2,500</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Flight Delay</p>
                  <p className="text-sm text-gray-600">Up to $1,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Emergency Evacuation</p>
                  <p className="text-sm text-gray-600">Up to $100,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">COVID-19 Coverage</p>
                  <p className="text-sm text-gray-600">Included</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Documents */}
        <Card variant="outlined" className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">📄</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Policy Document</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download your complete policy document and certificate of insurance
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    📥 Download Policy
                  </Button>
                  <Button variant="outline" size="sm">
                    📧 Email Copy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card variant="default" className="mb-6">
          <CardHeader>
            <CardTitle>Emergency Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">24/7 Emergency Hotline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">US/Canada:</span>
                    <a href="tel:+18005551234" className="font-medium text-sky-600 hover:text-sky-700">
                      +1 (800) 555-1234
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">International:</span>
                    <a href="tel:+442012345678" className="font-medium text-sky-600 hover:text-sky-700">
                      +44 20 1234 5678
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Email:</span>
                    <a href="mailto:emergency@traveease.com" className="font-medium text-sky-600 hover:text-sky-700">
                      emergency@traveease.com
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Claims Department</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Phone:</span>
                    <a href="tel:+18005555678" className="font-medium text-sky-600 hover:text-sky-700">
                      +1 (800) 555-5678
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Email:</span>
                    <a href="mailto:claims@traveease.com" className="font-medium text-sky-600 hover:text-sky-700">
                      claims@traveease.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Portal:</span>
                    <a href="/claims" className="font-medium text-sky-600 hover:text-sky-700">
                      File a Claim Online
                    </a>
                  </div>
                </div>
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
                <span className="text-sky-600 text-lg">ℹ️</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Coverage Starts Immediately</p>
                  <p className="text-gray-600">
                    Your insurance is active from March 15, 2026 at 12:01 AM local time.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-600 text-lg">⚠️</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Keep Your Policy Number Handy</p>
                  <p className="text-gray-600">
                    Save your policy number in your phone or take a screenshot. You'll need it for claims or emergencies.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-600 text-lg">✓</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Free Look Period</p>
                  <p className="text-gray-600">
                    You can cancel within 14 days for a full refund if you haven't started your trip or filed a claim.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button variant="primary" size="lg">
            📥 Download Policy
          </Button>
          <Button variant="outline" size="lg">
            📧 Email to Self
          </Button>
          <Button variant="outline" size="lg">
            📱 Add to Wallet
          </Button>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="lg">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Support Banner */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Travel with Confidence</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our team is here to help 24/7 if you need assistance during your trip
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="sm">
              💬 Live Chat
            </Button>
            <Button variant="outline" size="sm">
              📞 Emergency Hotline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
