'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ToursSearchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    category: '',
    participants: '2',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      destination: formData.destination,
      date: formData.date,
      category: formData.category,
      participants: formData.participants,
    });
    router.push(`/tours/results?${params.toString()}`);
  };

  const featuredTours = [
    {
      title: 'Eiffel Tower Summit & Seine Cruise',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&h=300&fit=crop',
      duration: '4 hours',
      rating: 4.9,
      reviews: 3847,
      price: '$85',
      category: 'Cultural',
      highlights: ['Skip-the-line tickets', 'Expert guide', 'River cruise'],
    },
    {
      title: 'Mt. Fuji Day Trip & Onsen Experience',
      location: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=300&fit=crop',
      duration: 'Full day',
      rating: 5.0,
      reviews: 1523,
      price: '$150',
      category: 'Nature',
      highlights: ['Hot spring bath', 'Traditional lunch', 'Mountain views'],
    },
    {
      title: 'Statue of Liberty & Ellis Island Tour',
      location: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=400&h=300&fit=crop',
      duration: '5 hours',
      rating: 4.8,
      reviews: 5142,
      price: '$65',
      category: 'Historical',
      highlights: ['Ferry tickets', 'Audio guide', 'Museum access'],
    },
    {
      title: 'Desert Safari & Bedouin Dinner',
      location: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=400&h=300&fit=crop',
      duration: '6 hours',
      rating: 4.9,
      reviews: 2987,
      price: '$120',
      category: 'Adventure',
      highlights: ['Dune bashing', 'Camel ride', 'BBQ dinner'],
    },
    {
      title: 'Vatican Museums & Sistine Chapel',
      location: 'Rome, Italy',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop',
      duration: '3 hours',
      rating: 4.9,
      reviews: 4521,
      price: '$75',
      category: 'Cultural',
      highlights: ['Priority entrance', 'Expert guide', 'Small group'],
    },
    {
      title: 'Great Barrier Reef Snorkeling',
      location: 'Cairns, Australia',
      image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop',
      duration: 'Full day',
      rating: 5.0,
      reviews: 2147,
      price: '$180',
      category: 'Adventure',
      highlights: ['Snorkel gear', 'Lunch included', 'Marine guide'],
    },
  ];

  const categories = [
    { name: 'Cultural', icon: '🏛️', count: '15,000+' },
    { name: 'Adventure', icon: '⛰️', count: '12,000+' },
    { name: 'Food & Wine', icon: '🍷', count: '8,000+' },
    { name: 'Nature', icon: '🌳', count: '10,000+' },
    { name: 'Historical', icon: '📜', count: '9,000+' },
    { name: 'Water Sports', icon: '🏄', count: '6,000+' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-700 text-white pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Discover Amazing Tours & Activities</h1>
          <p className="text-xl text-purple-100 mb-8">Book unforgettable experiences with local experts worldwide</p>

          {/* Search Card */}
          <Card variant="elevated" className="bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Destination */}
                  <Input
                    label="Where do you want to explore?"
                    placeholder="City or destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    }
                  />

                  {/* Date */}
                  <Input
                    label="When?"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={[
                      { value: '', label: 'All Categories' },
                      { value: 'cultural', label: 'Cultural & Historical' },
                      { value: 'adventure', label: 'Adventure & Outdoor' },
                      { value: 'food', label: 'Food & Wine' },
                      { value: 'nature', label: 'Nature & Wildlife' },
                      { value: 'water', label: 'Water Sports' },
                    ]}
                  />

                  {/* Participants */}
                  <Select
                    label="Participants"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    options={[
                      { value: '1', label: '1 Person' },
                      { value: '2', label: '2 People' },
                      { value: '3', label: '3 People' },
                      { value: '4', label: '4 People' },
                      { value: '5', label: '5+ People' },
                    ]}
                  />
                </div>

                {/* Search Button */}
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Tours
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Tours */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top-Rated Tours & Experiences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTours.map((tour, index) => (
            <Card key={index} variant="default" interactive={true}>
              <CardContent className="p-0">
                <div className="relative">
                  <img src={tour.image} alt={tour.title} className="w-full h-48 object-cover rounded-t-lg" />
                  <Badge
                    variant="warning"
                    className="absolute top-3 right-3"
                  >
                    {tour.category}
                  </Badge>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {tour.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{tour.location}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-900">{tour.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({tour.reviews.toLocaleString()} reviews)</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tour.duration}
                  </div>

                  <div className="space-y-1 mb-4">
                    {tour.highlights.slice(0, 2).map((highlight, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {highlight}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <span className="text-xs text-gray-600">From</span>
                      <p className="text-xl font-bold text-purple-600">{tour.price}</p>
                    </div>
                    <Button variant="primary" size="sm">
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Card key={index} variant="default" interactive={true}>
                <CardContent className="text-center py-6">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
