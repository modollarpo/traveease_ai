'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';

export default function HotelBookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const steps = ['Select Room', 'Guest Details', 'Review & Pay'];

  const rooms = [
    {
      id: 1,
      name: 'Standard Double Room',
      capacity: '2 adults',
      beds: '1 Queen Bed',
      size: '25 m²',
      price: 250,
      amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar'],
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      name: 'Deluxe Room with City View',
      capacity: '2 adults',
      beds: '1 King Bed',
      size: '35 m²',
      price: 350,
      amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Balcony', 'City View'],
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      name: 'Executive Suite',
      capacity: '4 adults',
      beds: '1 King Bed + Sofa Bed',
      size: '55 m²',
      price: 550,
      amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Balcony', 'City View', 'Living Area', 'Bathtub'],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
    },
  ];

  const tabs = [
    {
      label: 'Overview',
      value: 'overview',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">About Le Marais Boutique Hotel</h3>
            <p className="text-gray-600 leading-relaxed">
              Experience luxury in the heart of Paris at Le Marais Boutique Hotel. Our elegantly designed rooms combine classic Parisian charm with modern amenities. Located just steps away from major attractions, shopping districts, and renowned restaurants.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Hotel Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Free WiFi', 'Breakfast', 'Pool', 'Spa', 'Gym', 'Restaurant', '24/7 Reception', 'Concierge'].map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Location</h3>
            <p className="text-gray-600 mb-3">123 Rue du Temple, Le Marais, 75003 Paris, France</p>
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map View</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Reviews',
      value: 'reviews',
      content: (
        <div className="space-y-4">
          {[
            { author: 'Sarah M.', rating: 5, comment: 'Amazing hotel! The staff was incredibly helpful and the room was spotless.', date: '2 weeks ago' },
            { author: 'John D.', rating: 5, comment: 'Perfect location, beautiful rooms, and excellent breakfast. Highly recommend!', date: '1 month ago' },
            { author: 'Emily R.', rating: 4, comment: 'Great hotel overall. Room was a bit small but very clean and comfortable.', date: '1 month ago' },
          ].map((review, index) => (
            <Card key={index} variant="default">
              <CardContent className="pt-4">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-sm text-gray-600">{review.date}</p>
                </div>
                <div className="text-yellow-500 mb-2">
                  {'⭐'.repeat(review.rating)}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    {
      label: 'Policies',
      value: 'policies',
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Check-in / Check-out</h3>
            <p className="text-gray-600">Check-in: 3:00 PM • Check-out: 11:00 AM</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Cancellation Policy</h3>
            <p className="text-gray-600">Free cancellation up to 48 hours before check-in. After that, one night's stay will be charged.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Children & Extra Beds</h3>
            <p className="text-gray-600">Children are welcome. Extra beds available for $50 per night.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Pets</h3>
            <p className="text-gray-600">Pets are not allowed.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Link href="/" className="hover:text-sky-600">Home</Link>
            <span>›</span>
            <Link href="/hotels" className="hover:text-sky-600">Hotels</Link>
            <span>›</span>
            <Link href="/hotels/results" className="hover:text-sky-600">Results</Link>
            <span>›</span>
            <span className="text-gray-900">Le Marais Boutique Hotel</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Le Marais Boutique Hotel</h1>
              <p className="text-gray-600 mt-2">📍 Le Marais, Paris, France</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg">4.8</span>
                  <span className="text-yellow-500">⭐</span>
                </div>
                <span className="text-gray-600">(1,247 reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">From</p>
              <p className="text-3xl font-bold text-gray-900">$250</p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Select Your Room</h2>
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <Card
                      key={room.id}
                      variant={selectedRoom === room.id ? 'elevated' : 'default'}
                      className={selectedRoom === room.id ? 'border-2 border-sky-500' : ''}
                    >
                      <CardContent className="p-0">
                        <div className="flex gap-4">
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-48 h-40 object-cover rounded-l-lg"
                          />
                          <div className="flex-1 py-4 pr-4">
                            <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
                              <span>👥 {room.capacity}</span>
                              <span>🛏️ {room.beds}</span>
                              <span>📐 {room.size}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {room.amenities.map((amenity) => (
                                <Badge key={amenity} variant="gray" size="sm">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-2xl font-bold">${room.price}</p>
                                <p className="text-xs text-gray-600">per night</p>
                              </div>
                              <Button
                                variant={selectedRoom === room.id ? 'success' : 'primary'}
                                onClick={() => setSelectedRoom(room.id)}
                              >
                                {selectedRoom === room.id ? 'Selected' : 'Select Room'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!selectedRoom}
                    onClick={() => setCurrentStep(1)}
                  >
                    Continue to Guest Details
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Guest Details</h2>
                <Card variant="default">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="First Name" required />
                      <Input label="Last Name" required />
                    </div>
                    <Input label="Email Address" type="email" required />
                    <Input label="Phone Number" type="tel" required />
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3">Special Requests (Optional)</h3>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={4}
                        placeholder="E.g., late check-in, high floor, non-smoking room..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={() => setCurrentStep(2)}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Review & Pay</h2>
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span>Room</span>
                      <span className="font-semibold">Standard Double Room</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Check-in</span>
                      <span className="font-semibold">Mar 15, 2026</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Check-out</span>
                      <span className="font-semibold">Mar 22, 2026</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Nights</span>
                      <span className="font-semibold">7</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold">
                      <span>Total</span>
                      <span>$1,750</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Link href="/hotels/confirmation">
                    <Button variant="success" size="lg">
                      Confirm & Pay
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Hotel Info Tabs */}
            {currentStep === 0 && (
              <div>
                <Tabs tabs={tabs} defaultValue="overview" />
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="default" className="sticky top-6">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Check-in</p>
                  <p className="font-semibold">Mar 15, 2026</p>
                  <p className="text-xs text-gray-500">From 3:00 PM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Check-out</p>
                  <p className="font-semibold">Mar 22, 2026</p>
                  <p className="text-xs text-gray-500">Until 11:00 AM</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold">7 nights</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Guests</p>
                  <p className="font-semibold">2 adults</p>
                </div>
                {selectedRoom && (
                  <>
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-1">Room</p>
                      <p className="font-semibold">{rooms.find(r => r.id === selectedRoom)?.name}</p>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Room Rate</span>
                        <span className="font-semibold">${rooms.find(r => r.id === selectedRoom)?.price} × 7</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Taxes & Fees</span>
                        <span className="font-semibold">$0</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>${(rooms.find(r => r.id === selectedRoom)?.price || 0) * 7}</span>
                      </div>
                    </div>
                  </>
                )}
                <Badge variant="success" className="w-full justify-center">
                  Free Cancellation
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
