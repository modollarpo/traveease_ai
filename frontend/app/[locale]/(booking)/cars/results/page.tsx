'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

export default function CarResultsPage() {
  const [sortBy, setSortBy] = useState('recommended');

  const cars = [
    {
      id: 1,
      name: 'Toyota Corolla',
      category: 'Economy',
      passengers: 5,
      bags: 2,
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
      pricePerDay: 45,
      supplier: 'Hertz',
      mileage: 'Unlimited',
      features: ['Air Conditioning', 'Bluetooth', 'USB Ports'],
    },
    {
      id: 2,
      name: 'BMW 3 Series',
      category: 'Luxury',
      passengers: 5,
      bags: 3,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      pricePerDay: 120,
      supplier: 'Avis',
      mileage: 'Unlimited',
      features: ['Air Conditioning', 'GPS', 'Leather Seats', 'Premium Audio'],
    },
    {
      id: 3,
      name: 'Mercedes-Benz E-Class',
      category: 'Premium',
      passengers: 5,
      bags: 3,
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
      pricePerDay: 150,
      supplier: 'Sixt',
      mileage: 'Unlimited',
      features: ['Air Conditioning', 'GPS', 'Leather Seats', 'Premium Audio', 'Sunroof'],
    },
    {
      id: 4,
      name: 'Ford Transit Van',
      category: 'Van',
      passengers: 9,
      bags: 5,
      transmission: 'Manual',
      fuelType: 'Diesel',
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=300&fit=crop',
      pricePerDay: 85,
      supplier: 'Budget',
      mileage: 'Unlimited',
      features: ['Air Conditioning', 'Extra Space', 'Cargo Area'],
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
            <Link href="/cars" className="hover:text-sky-600">Car Rentals</Link>
            <span>›</span>
            <span className="text-gray-900">Search Results</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Car Rentals in Paris</h1>
          <p className="text-gray-600 mt-2">Mar 15 - Mar 22, 2026 • Pick-up: CDG Airport</p>
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
                    ]}
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Car Type</h3>
                  <div className="space-y-2">
                    {['Economy', 'Compact', 'Luxury', 'SUV', 'Van'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Transmission</h3>
                  <div className="space-y-2">
                    {['Automatic', 'Manual'].map((transmission) => (
                      <label key={transmission} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">{transmission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Fuel Type</h3>
                  <div className="space-y-2">
                    {['Petrol', 'Diesel', 'Hybrid', 'Electric'].map((fuel) => (
                      <label key={fuel} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">{fuel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Supplier</h3>
                  <div className="space-y-2">
                    {['Hertz', 'Avis', 'Budget', 'Sixt', 'Europcar'].map((supplier) => (
                      <label key={supplier} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">{supplier}</span>
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
              <p className="text-gray-600">{cars.length} cars available</p>
            </div>

            {cars.map((car) => (
              <Card key={car.id} variant="default" interactive>
                <CardContent className="p-0">
                  <div className="flex gap-6">
                    {/* Image */}
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-72 h-48 object-cover rounded-l-lg flex-shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 py-4 pr-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <Badge variant="info" size="sm" className="mb-2">
                            {car.category}
                          </Badge>
                          <h3 className="text-xl font-semibold text-gray-900">{car.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">or similar • {car.supplier}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                          <span className="text-2xl mb-1">👥</span>
                          <span className="text-gray-600">{car.passengers} seats</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                          <span className="text-2xl mb-1">💼</span>
                          <span className="text-gray-600">{car.bags} bags</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                          <span className="text-2xl mb-1">⚙️</span>
                          <span className="text-gray-600">{car.transmission}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                          <span className="text-2xl mb-1">⛽</span>
                          <span className="text-gray-600">{car.fuelType}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {car.features.map((feature) => (
                          <Badge key={feature} variant="gray" size="sm">
                            {feature}
                          </Badge>
                        ))}
                        <Badge variant="success" size="sm">
                          {car.mileage} Mileage
                        </Badge>
                      </div>

                      <div className="flex items-end justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Total (7 days)</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${car.pricePerDay * 7}
                          </p>
                          <p className="text-xs text-gray-600">${car.pricePerDay}/day</p>
                        </div>
                        <Link href={`/cars/${car.id}`}>
                          <Button variant="primary" size="md">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
