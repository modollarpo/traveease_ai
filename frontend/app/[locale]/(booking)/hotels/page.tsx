'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';

export default function HotelsSearchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    rooms: '1',
    guests: '2',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      destination: formData.destination,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      rooms: formData.rooms,
      guests: formData.guests,
    });
    router.push(`/hotels/results?${params.toString()}`);
  };

  const featuredHotels = [
    {
      name: 'Le Marais Grand Hotel',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 2847,
      pricePerNight: '$350',
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant'],
    },
    {
      name: 'Tokyo Bay Resort',
      location: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 1523,
      pricePerNight: '$420',
      amenities: ['Ocean View', 'Hot Tub', 'Gym', 'Bar'],
    },
    {
      name: 'Manhattan Skyline Hotel',
      location: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 3142,
      pricePerNight: '$280',
      amenities: ['City View', 'Breakfast', 'Concierge', 'Parking'],
    },
    {
      name: 'Burj Vista Luxury Suites',
      location: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      rating: 5.0,
      reviews: 987,
      pricePerNight: '$580',
      amenities: ['Butler Service', 'Infinity Pool', 'Fine Dining', 'Helipad'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 text-white pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Find Your Perfect Hotel</h1>
          <p className="text-xl text-emerald-100 mb-8">Book from over 2 million hotels worldwide with best price guarantee</p>

          {/* Search Card */}
          <Card variant="elevated" className="bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Destination */}
                <Input
                  label="Where are you going?"
                  placeholder="City, hotel name, or region"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />

                {/* Dates & Guests */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    label="Check-in"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    required
                  />

                  <Input
                    label="Check-out"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    required
                  />

                  <Select
                    label="Rooms"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    options={[
                      { value: '1', label: '1 Room' },
                      { value: '2', label: '2 Rooms' },
                      { value: '3', label: '3 Rooms' },
                      { value: '4', label: '4+ Rooms' },
                    ]}
                  />

                  <Select
                    label="Guests"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    options={[
                      { value: '1', label: '1 Guest' },
                      { value: '2', label: '2 Guests' },
                      { value: '3', label: '3 Guests' },
                      { value: '4', label: '4 Guests' },
                      { value: '5', label: '5+ Guests' },
                    ]}
                  />
                </div>

                {/* Search Button */}
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Hotels
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Hotels */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Hotels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredHotels.map((hotel, index) => (
            <Card key={index} variant="default" interactive={true}>
              <CardContent className="p-0">
                <div className="flex gap-4">
                  <img src={hotel.image} alt={hotel.name} className="w-48 h-48 object-cover rounded-l-lg" />
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                        <p className="text-sm text-gray-600">{hotel.location}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-emerald-700">{hotel.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">{hotel.reviews.toLocaleString()} reviews</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-600">From</span>
                        <p className="text-xl font-bold text-emerald-600">{hotel.pricePerNight}</p>
                        <span className="text-xs text-gray-500">per night</span>
                      </div>
                      <Button variant="primary" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Hotel Categories */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Property Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Hotels', icon: '🏨', count: '1.2M+' },
              { name: 'Resorts', icon: '🏖️', count: '450K+' },
              { name: 'Apartments', icon: '🏠', count: '800K+' },
              { name: 'Villas', icon: '🏡', count: '320K+' },
            ].map((type, index) => (
              <Card key={index} variant="default" interactive={true}>
                <CardContent className="text-center py-8">
                  <div className="text-5xl mb-3">{type.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{type.count} properties</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
