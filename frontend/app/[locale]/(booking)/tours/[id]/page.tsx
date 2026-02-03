'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';

export default function TourDetailsPage({ params }: { params: { id: string } }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [participants, setParticipants] = useState({ adults: 2, children: 0, infants: 0 });

  const tour = {
    id: params.id,
    name: 'Eiffel Tower Summit with Skip-the-Line Access',
    location: 'Paris, France',
    images: [
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=800&h=500&fit=crop',
    ],
    duration: '2 hours',
    price: 89,
    originalPrice: 109,
    rating: 4.9,
    reviews: 3421,
    category: 'Cultural & Historical',
    groupSize: 'Small group (max 15)',
    languages: ['English', 'French', 'Spanish'],
    cancellation: 'Free cancellation up to 24 hours before start time',
    description: 'Experience the iconic Eiffel Tower like never before with exclusive skip-the-line access to the summit. Your expert guide will share fascinating stories about Gustave Eiffel, the tower\'s construction, and its role in French history. Enjoy breathtaking panoramic views of Paris from 276 meters above the ground.',
    highlights: [
      'Skip the long ticket lines with priority access',
      'Ride the elevator to the summit (276m)',
      'Expert local guide with insider knowledge',
      '360-degree views of Paris landmarks',
      'Learn about the tower\'s fascinating history',
      'Small group ensures personalized experience',
    ],
    included: [
      'Skip-the-line entrance tickets',
      'Professional English-speaking guide',
      'Elevator access to the summit',
      'Group size limited to 15 people',
    ],
    notIncluded: [
      'Hotel pickup and drop-off',
      'Food and drinks',
      'Gratuities (optional)',
    ],
    meetingPoint: {
      name: 'Eiffel Tower South Security Entrance',
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
      instructions: 'Meet your guide at the South Security Entrance (Pillar 1). Look for the guide holding a blue Traveease sign.',
    },
    itinerary: [
      {
        time: '0:00',
        title: 'Meeting Point',
        description: 'Meet your guide at the South Security Entrance. Quick introduction and distribution of headsets.',
      },
      {
        time: '0:15',
        title: 'First & Second Floors',
        description: 'Skip the lines and take the elevator to the first and second floors. Learn about the tower\'s construction.',
      },
      {
        time: '0:45',
        title: 'Summit Access',
        description: 'Ascend to the summit (276m). Enjoy spectacular 360-degree views and photo opportunities.',
      },
      {
        time: '1:30',
        title: 'Free Time',
        description: 'Free time to explore, take photos, and visit the champagne bar (at own expense).',
      },
      {
        time: '2:00',
        title: 'Tour Ends',
        description: 'Tour concludes at the Eiffel Tower. You\'re free to stay longer or explore the area.',
      },
    ],
  };

  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      country: 'USA',
      date: 'January 2026',
      rating: 5,
      title: 'Absolutely Amazing Experience!',
      comment: 'Our guide Marie was fantastic! The skip-the-line access saved us at least 2 hours. The views from the summit were breathtaking. Highly recommend this tour!',
      helpful: 124,
    },
    {
      id: 2,
      name: 'James L.',
      country: 'UK',
      date: 'December 2025',
      rating: 5,
      title: 'Perfect way to see the Eiffel Tower',
      comment: 'Worth every penny. Small group made it feel exclusive. Guide was knowledgeable and entertaining. Don\'t skip this if you\'re in Paris!',
      helpful: 89,
    },
    {
      id: 3,
      name: 'Lisa K.',
      country: 'Australia',
      date: 'November 2025',
      rating: 4,
      title: 'Great tour, amazing views',
      comment: 'Really enjoyed the tour. Only minor issue was the elevator wait at the summit, but that\'s expected. Guide was excellent and very informative.',
      helpful: 67,
    },
  ];

  const tabContent = [
    {
      label: 'Overview',
      value: 'overview',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">About This Tour</h3>
            <p className="text-gray-600 leading-relaxed">{tour.description}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tour.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span className="text-gray-600">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Itinerary',
      value: 'itinerary',
      content: (
        <div className="space-y-4">
          {tour.itinerary.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-16 text-sm font-semibold text-sky-600">
                {item.time}
              </div>
              <div className="flex-1 pb-6 border-l-2 border-gray-200 pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-sky-600 rounded-full border-4 border-white" />
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: 'What\'s Included',
      value: 'included',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">✓ Included</h3>
            <div className="space-y-2">
              {tour.included.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">✗ Not Included</h3>
            <div className="space-y-2">
              {tour.notIncluded.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-400">✗</span>
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: `Reviews (${tour.reviews})`,
      value: 'reviews',
      content: (
        <div className="space-y-6">
          {/* Rating Summary */}
          <div className="flex items-center gap-8 pb-6 border-b">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{tour.rating}</div>
              <div className="text-amber-500 mb-1">★★★★★</div>
              <div className="text-sm text-gray-600">{tour.reviews} reviews</div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{stars}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${stars === 5 ? 85 : stars === 4 ? 12 : 3}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {stars === 5 ? '85%' : stars === 4 ? '12%' : '3%'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="pb-6 border-b last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.name}</span>
                      <span className="text-sm text-gray-500">• {review.country}</span>
                    </div>
                    <div className="text-amber-500 text-sm mb-1">
                      {'★'.repeat(review.rating)}
                    </div>
                    <div className="text-sm text-gray-500">{review.date}</div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600 mb-3">{review.comment}</p>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  👍 Helpful ({review.helpful})
                </button>
              </div>
            ))}
          </div>
          <Button variant="outline" fullWidth>
            Load More Reviews
          </Button>
        </div>
      ),
    },
  ];

  const totalPrice = (participants.adults * tour.price) + (participants.children * (tour.price * 0.7));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/tours" className="hover:text-sky-600">Tours</Link>
          <span className="mx-2">›</span>
          <Link href="/tours/results" className="hover:text-sky-600">Search Results</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{tour.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card variant="elevated" className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={tour.images[0]}
                  alt={tour.name}
                  className="w-full h-96 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Badge variant="info" className="mb-3">{tour.category}</Badge>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3">{tour.name}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          📍 {tour.location}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ {tour.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          👥 {tour.groupSize}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-xl">★</span>
                      <span className="text-xl font-bold">{tour.rating}</span>
                    </div>
                    <span className="text-gray-600">({tour.reviews} reviews)</span>
                  </div>

                  {/* Image Gallery */}
                  <div className="grid grid-cols-3 gap-3">
                    {tour.images.slice(1).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Tour view ${index + 2}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tour Information Tabs */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <Tabs tabs={tabContent} defaultValue="overview" />
              </CardContent>
            </Card>

            {/* Meeting Point */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Meeting Point</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{tour.meetingPoint.name}</h4>
                    <p className="text-sm text-gray-600">{tour.meetingPoint.address}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Instructions:</span> {tour.meetingPoint.instructions}
                    </p>
                  </div>
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    [Google Maps Embedded Here]
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-baseline gap-2">
                    {tour.originalPrice && (
                      <>
                        <span className="text-lg text-gray-500 line-through">${tour.originalPrice}</span>
                        <Badge variant="danger">
                          Save {Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)}%
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">${tour.price}</span>
                    <span className="text-gray-600">per person</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Select Date
                      </label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Participants */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Participants
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Adults</p>
                            <p className="text-xs text-gray-600">Age 18+</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setParticipants((prev) => ({
                                  ...prev,
                                  adults: Math.max(1, prev.adults - 1),
                                }))
                              }
                            >
                              −
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {participants.adults}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setParticipants((prev) => ({
                                  ...prev,
                                  adults: prev.adults + 1,
                                }))
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Children</p>
                            <p className="text-xs text-gray-600">Age 3-17 (30% off)</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setParticipants((prev) => ({
                                  ...prev,
                                  children: Math.max(0, prev.children - 1),
                                }))
                              }
                            >
                              −
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {participants.children}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setParticipants((prev) => ({
                                  ...prev,
                                  children: prev.children + 1,
                                }))
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Tour Language
                      </label>
                      <Select
                        options={tour.languages.map((lang) => ({ value: lang, label: lang }))}
                      />
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adults × {participants.adults}</span>
                        <span className="font-medium">${participants.adults * tour.price}</span>
                      </div>
                      {participants.children > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Children × {participants.children}</span>
                          <span className="font-medium">
                            ${Math.round(participants.children * tour.price * 0.7)}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ${totalPrice}
                        </span>
                      </div>
                    </div>

                    <Link href="/tours/confirmation">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={!selectedDate}
                      >
                        Book Now
                      </Button>
                    </Link>

                    <div className="text-center text-xs text-gray-600">
                      {tour.cancellation}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Info */}
              <Card variant="outlined">
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span className="text-gray-700">Instant confirmation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span className="text-gray-700">Mobile voucher accepted</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span className="text-gray-700">Free cancellation (24h notice)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
