'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';

export default function CarsSearchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '10:00',
    dropoffDate: '',
    dropoffTime: '10:00',
    driverAge: '30',
    sameLocation: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      pickup: formData.pickupLocation,
      dropoff: formData.sameLocation ? formData.pickupLocation : formData.dropoffLocation,
      pickupDate: formData.pickupDate,
      dropoffDate: formData.dropoffDate,
      age: formData.driverAge,
    });
    router.push(`/cars/results?${params.toString()}`);
  };

  const carTypes = [
    {
      type: 'Economy',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=300&h=200&fit=crop',
      example: 'Toyota Yaris or similar',
      passengers: 5,
      bags: 2,
      pricePerDay: '$35',
      features: ['Manual', 'A/C', 'Bluetooth'],
    },
    {
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=300&h=200&fit=crop',
      example: 'Toyota RAV4 or similar',
      passengers: 5,
      bags: 4,
      pricePerDay: '$75',
      features: ['Automatic', '4WD', 'GPS'],
    },
    {
      type: 'Luxury',
      image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=300&h=200&fit=crop',
      example: 'BMW 5 Series or similar',
      passengers: 5,
      bags: 3,
      pricePerDay: '$150',
      features: ['Automatic', 'Leather', 'Premium Audio'],
    },
    {
      type: 'Van',
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=300&h=200&fit=crop',
      example: 'Ford Transit or similar',
      passengers: 9,
      bags: 6,
      pricePerDay: '$95',
      features: ['Automatic', 'Extra Space', 'Climate Control'],
    },
  ];

  const rentalCompanies = [
    { name: 'Hertz', logo: '🚗' },
    { name: 'Enterprise', logo: '🚙' },
    { name: 'Avis', logo: '🚕' },
    { name: 'Budget', logo: '🚐' },
    { name: 'Europcar', logo: '🚓' },
    { name: 'Sixt', logo: '🚔' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-r from-orange-600 to-amber-700 text-white pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Rent a Car Anywhere</h1>
          <p className="text-xl text-orange-100 mb-8">Compare prices from top rental companies worldwide</p>

          {/* Search Card */}
          <Card variant="elevated" className="bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-5">
                {/* Pick-up Location */}
                <Input
                  label="Pick-up Location"
                  placeholder="City, airport, or address"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  required
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  }
                />

                {/* Same Location Checkbox */}
                <Checkbox
                  label="Return to same location"
                  checked={formData.sameLocation}
                  onChange={(e) => setFormData({ ...formData, sameLocation: e.target.checked })}
                />

                {/* Drop-off Location (if different) */}
                {!formData.sameLocation && (
                  <Input
                    label="Drop-off Location"
                    placeholder="City, airport, or address"
                    value={formData.dropoffLocation}
                    onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                    required
                  />
                )}

                {/* Pick-up Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Pick-up Date"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      required
                    />
                    <Input
                      label="Time"
                      type="time"
                      value={formData.pickupTime}
                      onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Drop-off Date"
                      type="date"
                      value={formData.dropoffDate}
                      onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                      required
                    />
                    <Input
                      label="Time"
                      type="time"
                      value={formData.dropoffTime}
                      onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Driver Age */}
                <Select
                  label="Driver's Age"
                  value={formData.driverAge}
                  onChange={(e) => setFormData({ ...formData, driverAge: e.target.value })}
                  options={[
                    { value: '21', label: '21-24 years' },
                    { value: '25', label: '25-29 years' },
                    { value: '30', label: '30+ years' },
                  ]}
                />

                {/* Search Button */}
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Cars
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Car Types */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Car Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {carTypes.map((car, index) => (
            <Card key={index} variant="default" interactive={true}>
              <CardContent className="p-0">
                <img src={car.image} alt={car.type} className="w-full h-48 object-cover rounded-t-lg" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{car.type}</h3>
                      <p className="text-sm text-gray-600">{car.example}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">From</p>
                      <p className="text-2xl font-bold text-orange-600">{car.pricePerDay}</p>
                      <p className="text-xs text-gray-500">per day</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    <span>👥 {car.passengers} passengers</span>
                    <span>💼 {car.bags} bags</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {car.features.map((feature, i) => (
                      <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" fullWidth>
                    View {car.type} Cars
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rental Companies */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Rental Partners</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {rentalCompanies.map((company, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-3xl">
                  {company.logo}
                </div>
                <p className="text-sm font-medium text-gray-700">{company.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Cancellation</h3>
              <p className="text-gray-600">Cancel up to 48 hours before pickup with no fees</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hidden Fees</h3>
              <p className="text-gray-600">What you see is what you pay - no surprises at the counter</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Vehicles</h3>
              <p className="text-gray-600">All cars are regularly maintained and safety-checked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
