'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';

export default function ToursResultsPage() {
  const [priceRange, setPriceRange] = useState([0, 500]);

  const tours = [
    {
      id: 1,
      name: 'Eiffel Tower Summit with Skip-the-Line Access',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&h=400&fit=crop',
      duration: '2 hours',
      price: 89,
      originalPrice: 109,
      rating: 4.9,
      reviews: 3421,
      category: 'Cultural',
      highlights: ['Skip-the-Line Access', 'Expert Guide', 'Summit Access'],
      includes: ['Entrance Ticket', 'English Guide', 'Photos'],
      groupSize: 'Small group (max 15)',
      cancellation: 'Free cancellation up to 24 hours',
    },
    {
      id: 2,
      name: 'Private Mount Fuji Day Trip from Tokyo',
      location: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop',
      duration: '10 hours',
      price: 299,
      originalPrice: null,
      rating: 4.8,
      reviews: 1876,
      category: 'Nature',
      highlights: ['Private Tour', 'Lake Kawaguchi', 'Traditional Lunch'],
      includes: ['Private Vehicle', 'English Guide', 'Lunch', 'Hotel Pickup'],
      groupSize: 'Private tour',
      cancellation: 'Free cancellation up to 48 hours',
    },
    {
      id: 3,
      name: 'Dubai Desert Safari with BBQ Dinner & Shows',
      location: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600&h=400&fit=crop',
      duration: '6 hours',
      price: 79,
      originalPrice: 95,
      rating: 4.7,
      reviews: 2543,
      category: 'Adventure',
      highlights: ['Dune Bashing', 'Camel Ride', 'BBQ Dinner', 'Live Shows'],
      includes: ['4x4 Transport', 'Dinner', 'Entertainment', 'Hotel Transfer'],
      groupSize: 'Group tour (max 30)',
      cancellation: 'Free cancellation up to 24 hours',
    },
    {
      id: 4,
      name: 'Statue of Liberty & Ellis Island Tour',
      location: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&h=400&fit=crop',
      duration: '4 hours',
      price: 65,
      originalPrice: null,
      rating: 4.6,
      reviews: 4102,
      category: 'Cultural',
      highlights: ['Ferry Tickets', 'Audio Guide', 'Ellis Island Museum'],
      includes: ['Ferry Ride', 'Audio Guide', 'Museum Access'],
      groupSize: 'Large group',
      cancellation: 'Non-refundable',
    },
    {
      id: 5,
      name: 'Grand Canyon Helicopter Tour with Landing',
      location: 'Las Vegas, USA',
      image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=600&h=400&fit=crop',
      duration: '4 hours',
      price: 449,
      originalPrice: null,
      rating: 5.0,
      reviews: 987,
      category: 'Adventure',
      highlights: ['Helicopter Flight', 'Canyon Floor Landing', 'Champagne Toast'],
      includes: ['Helicopter Ride', 'Champagne', 'Hotel Pickup', 'Snacks'],
      groupSize: 'Small group (max 6)',
      cancellation: 'Free cancellation up to 72 hours',
    },
    {
      id: 6,
      name: 'Barcelona Tapas & Wine Walking Tour',
      location: 'Barcelona, Spain',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=400&fit=crop',
      duration: '3 hours',
      price: 85,
      originalPrice: 100,
      rating: 4.8,
      reviews: 2156,
      category: 'Food & Wine',
      highlights: ['7 Tapas Tastings', 'Wine Pairings', 'Local Guide'],
      includes: ['Food Samples', 'Wine', 'English Guide'],
      groupSize: 'Small group (max 12)',
      cancellation: 'Free cancellation up to 24 hours',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tours & Activities</h1>
          <p className="text-gray-600">Showing {tours.length} experiences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card variant="default">
              <CardContent className="p-6 space-y-6">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Sort By
                  </label>
                  <Select
                    options={[
                      { value: 'recommended', label: 'Recommended' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Highest Rating' },
                      { value: 'duration', label: 'Duration' },
                    ]}
                  />
                </div>

                {/* Price Range */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Price Range (per person)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}+</span>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Category
                  </label>
                  <div className="space-y-2">
                    <Checkbox id="cultural" label="Cultural & Historical" />
                    <Checkbox id="adventure" label="Adventure & Outdoor" />
                    <Checkbox id="food" label="Food & Wine" />
                    <Checkbox id="nature" label="Nature & Wildlife" />
                    <Checkbox id="water" label="Water Sports" />
                    <Checkbox id="city" label="City Tours" />
                  </div>
                </div>

                {/* Duration */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Duration
                  </label>
                  <div className="space-y-2">
                    <Checkbox id="1-3h" label="1-3 hours" />
                    <Checkbox id="3-6h" label="3-6 hours" />
                    <Checkbox id="6-12h" label="6-12 hours" />
                    <Checkbox id="full-day" label="Full day (12+ hours)" />
                    <Checkbox id="multi-day" label="Multi-day" />
                  </div>
                </div>

                {/* Group Size */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Group Size
                  </label>
                  <div className="space-y-2">
                    <Checkbox id="private" label="Private tour" />
                    <Checkbox id="small" label="Small group (≤15)" />
                    <Checkbox id="large" label="Large group" />
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Cancellation
                  </label>
                  <div className="space-y-2">
                    <Checkbox id="free-cancel" label="Free cancellation" />
                  </div>
                </div>

                <Button variant="outline" fullWidth>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tours Grid */}
          <div className="lg:col-span-3 space-y-6">
            {tours.map((tour) => (
              <Card key={tour.id} variant="default" className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tour Image */}
                    <div className="md:col-span-1 relative">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-64 md:h-full object-cover"
                      />
                      {tour.originalPrice && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="danger">
                            Save {Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)}%
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="default" className="bg-gray-900/70 text-white border-0">
                          {tour.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Tour Details */}
                    <div className="md:col-span-2 p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <Link href={`/tours/${tour.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-sky-600 mb-2">
                              {tour.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <span>📍 {tour.location}</span>
                            <span>•</span>
                            <span>⏱️ {tour.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              <span className="text-amber-500">★</span>
                              <span className="font-semibold">{tour.rating}</span>
                            </div>
                            <span className="text-sm text-gray-600">({tour.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Highlights:</p>
                        <div className="flex flex-wrap gap-2">
                          {tour.highlights.map((highlight, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* What's Included */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">What's Included:</p>
                        <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                          {tour.includes.map((item, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <span className="text-emerald-600">✓</span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-end justify-between pt-4 border-t">
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs text-gray-600">From</span>
                            {tour.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${tour.originalPrice}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-gray-900">
                              ${tour.price}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {tour.groupSize} • {tour.cancellation}
                          </div>
                        </div>
                        <Link href={`/tours/${tour.id}`}>
                          <Button variant="primary" size="lg">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More */}
            <div className="text-center pt-6">
              <Button variant="outline" size="lg">
                Load More Tours
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
