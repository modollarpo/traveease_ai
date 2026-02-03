'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

export default function HotelResultsPage() {
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const hotels = [
    {
      id: 1,
      name: 'Le Marais Boutique Hotel',
      location: 'Le Marais, Paris, France',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 1247,
      pricePerNight: 250,
      amenities: ['Free WiFi', 'Breakfast', 'Pool', 'Spa', 'Gym'],
      distance: '0.8 km from city center',
      cancellation: 'Free cancellation',
    },
    {
      id: 2,
      name: 'Grand Paris Luxury Suites',
      location: 'Champs-Élysées, Paris, France',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 2134,
      pricePerNight: 450,
      amenities: ['Free WiFi', 'Breakfast', 'Pool', 'Spa', 'Concierge'],
      distance: '0.3 km from city center',
      cancellation: 'Free cancellation',
    },
    {
      id: 3,
      name: 'Budget Inn Paris',
      location: 'Montmartre, Paris, France',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
      rating: 4.2,
      reviews: 543,
      pricePerNight: 120,
      amenities: ['Free WiFi', 'Breakfast'],
      distance: '2.5 km from city center',
      cancellation: 'Non-refundable',
    },
    {
      id: 4,
      name: 'Eiffel Tower View Hotel',
      location: '7th Arrondissement, Paris, France',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 892,
      pricePerNight: 380,
      amenities: ['Free WiFi', 'Breakfast', 'Rooftop Bar', 'Spa'],
      distance: '0.5 km from Eiffel Tower',
      cancellation: 'Free cancellation',
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
            <span className="text-gray-900">Search Results</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels in Paris</h1>
          <p className="text-gray-600 mt-2">Mar 15 - Mar 22, 2026 • 2 adults • 1 room</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="default" className="sticky top-6">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                      { value: 'recommended', label: 'Recommended' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Highest Rated' },
                      { value: 'distance', label: 'Distance' },
                    ]}
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}+</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Star Rating</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <label key={stars} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">
                          {'⭐'.repeat(stars)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="space-y-2">
                    {['Free WiFi', 'Breakfast', 'Pool', 'Spa', 'Gym', 'Parking'].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="outline" fullWidth size="sm">
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">{hotels.length} hotels found</p>
              <Button variant="outline" size="sm">
                Map View
              </Button>
            </div>

            {hotels.map((hotel) => (
              <Card key={hotel.id} variant="default" interactive>
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    {/* Image */}
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-64 h-48 object-cover rounded-l-lg flex-shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 py-4 pr-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">📍 {hotel.location}</p>
                          <p className="text-xs text-gray-500 mt-1">{hotel.distance}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-lg font-bold text-gray-900">{hotel.rating}</span>
                            <span className="text-yellow-500">⭐</span>
                          </div>
                          <p className="text-xs text-gray-600">{hotel.reviews} reviews</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.slice(0, 4).map((amenity) => (
                          <Badge key={amenity} variant="gray" size="sm">
                            {amenity}
                          </Badge>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <Badge variant="gray" size="sm">
                            +{hotel.amenities.length - 4} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <Badge variant="success" size="sm">
                            {hotel.cancellation}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">From</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${hotel.pricePerNight}
                          </p>
                          <p className="text-xs text-gray-600">per night</p>
                          <Link href={`/hotels/${hotel.id}`}>
                            <Button variant="primary" size="md" className="mt-3">
                              View Rooms
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More */}
            <div className="text-center pt-6">
              <Button variant="outline" size="lg">
                Load More Hotels
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
