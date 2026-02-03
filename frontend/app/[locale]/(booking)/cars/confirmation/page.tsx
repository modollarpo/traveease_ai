'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function CarConfirmationPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rental Confirmed!</h1>
          <p className="text-gray-600">Your car rental has been successfully booked</p>
        </div>

        {/* Rental Details Card */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Rental Agreement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Confirmation Number</p>
                  <p className="text-lg font-bold text-gray-900">TRV-CAR-2024-56789</p>
                </div>
                <Badge variant="success">Confirmed</Badge>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Vehicle Details</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=200&h=120&fit=crop"
                    alt="Toyota Corolla"
                    className="w-32 h-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Toyota Corolla</p>
                    <Badge variant="info" className="mt-1">Economy</Badge>
                    <p className="text-sm text-gray-600 mt-1">Enterprise Rent-A-Car</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center bg-gray-50 rounded p-2">
                    <div className="text-lg mb-1">👥</div>
                    <div className="text-gray-600">5 Passengers</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded p-2">
                    <div className="text-lg mb-1">💼</div>
                    <div className="text-gray-600">3 Bags</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded p-2">
                    <div className="text-lg mb-1">⚙️</div>
                    <div className="text-gray-600">Automatic</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded p-2">
                    <div className="text-lg mb-1">⛽</div>
                    <div className="text-gray-600">Gasoline</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Pick-up</p>
                    <p className="font-medium text-gray-900">March 15, 2026</p>
                    <p className="text-gray-500">10:00 AM</p>
                    <p className="text-gray-900 mt-1">JFK Airport</p>
                    <p className="text-gray-600">Terminal 1, Counter 5</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Drop-off</p>
                    <p className="font-medium text-gray-900">March 22, 2026</p>
                    <p className="text-gray-500">10:00 AM</p>
                    <p className="text-gray-900 mt-1">JFK Airport</p>
                    <p className="text-gray-600">Same Location</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Protection Plan</p>
                <p className="font-medium text-gray-900">Standard Protection</p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Collision Damage Waiver (CDW)</li>
                  <li>• Theft Protection</li>
                  <li>• Windscreen & Tire Protection</li>
                  <li>• $100 Excess/Deductible</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Driver Information</p>
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-sm text-gray-600">john.doe@example.com</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-600 mt-2">License: DL123456789</p>
              </div>

              <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 py-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Car Rental (7 days)</span>
                    <span className="font-medium">$315.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Standard Protection</span>
                    <span className="font-medium">$175.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium">$49.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount Paid</span>
                    <span className="text-xl font-bold text-emerald-600">$539.00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code & Voucher */}
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
                <h3 className="font-semibold text-gray-900 mb-2">Rental Voucher</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Show this QR code at the rental counter for quick pick-up
                </p>
                <Button variant="outline" size="sm">
                  Download Voucher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pick-up Instructions */}
        <Card variant="default" className="mb-6">
          <CardHeader>
            <CardTitle>Pick-up Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg flex-shrink-0">1️⃣</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Arrive at the Counter</p>
                  <p className="text-gray-600">
                    Go to Enterprise counter at Terminal 1, Counter 5. Open from 6:00 AM - 10:00 PM daily.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg flex-shrink-0">2️⃣</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Present Documents</p>
                  <p className="text-gray-600">
                    Bring your confirmation voucher (printed or mobile), valid driver's license, 
                    and credit card for deposit.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg flex-shrink-0">3️⃣</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Vehicle Inspection</p>
                  <p className="text-gray-600">
                    Inspect the vehicle with staff and note any existing damage on the rental agreement.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg flex-shrink-0">4️⃣</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Fuel Policy</p>
                  <p className="text-gray-600">
                    The vehicle will have a full tank. Please return with a full tank to avoid refueling charges.
                  </p>
                </div>
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
                <span className="text-amber-600 text-lg">⚠️</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Security Deposit</p>
                  <p className="text-gray-600">
                    A refundable deposit of $300 will be held on your credit card during the rental period.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-600 text-lg">✓</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Free Cancellation</p>
                  <p className="text-gray-600">
                    Cancel up to 24 hours before pick-up for a full refund. After that, cancellation fees apply.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg">ℹ️</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Additional Drivers</p>
                  <p className="text-gray-600">
                    Additional drivers can be added at the counter for $12/day. They must present a valid license.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-rose-600 text-lg">🚨</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Late Return</p>
                  <p className="text-gray-600">
                    Grace period of 29 minutes. After that, additional daily charges apply.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Location Contact */}
        <Card variant="outlined" className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Rental Location Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Address</p>
                <p className="text-gray-900">
                  123 Airport Road, Terminal 1<br />
                  JFK International Airport<br />
                  New York, NY 11430
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Contact</p>
                <p className="text-gray-900">Phone: +1 (555) 234-5678</p>
                <p className="text-gray-900">Email: jfk@enterprise.com</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Hours</p>
                <p className="text-gray-900">Mon - Sun: 6:00 AM - 10:00 PM</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Emergency Roadside</p>
                <p className="text-gray-900">24/7: 1-800-ROADHELP</p>
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
            📱 Share Rental Details
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
          <h3 className="font-semibold text-gray-900 mb-2">Need Assistance?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our 24/7 support team is here to help with any questions
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
