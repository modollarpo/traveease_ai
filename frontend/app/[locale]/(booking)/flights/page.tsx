'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';

export default function FlightSearchPage() {
  const [tripType, setTripType] = useState('roundtrip');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: '1',
    cabin: 'economy',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to results page
    window.location.href = '/flights/results';
  };

  const popularRoutes = [
    {
      from: 'New York',
      to: 'London',
      price: '$450',
      icon: '🇺🇸 → 🇬🇧',
    },
    {
      from: 'San Francisco',
      to: 'Tokyo',
      price: '$650',
      icon: '🇺🇸 → 🇯🇵',
    },
    {
      from: 'Los Angeles',
      to: 'Sydney',
      price: '$750',
      icon: '🇺🇸 → 🇦🇺',
    },
    {
      from: 'Miami',
      to: 'Mexico City',
      price: '$280',
      icon: '🇺🇸 → 🇲🇽',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Find & Book Flights</h1>
          <p className="text-sky-100">Search millions of flights and save up to 80% on your bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Search Card */}
        <Card variant="elevated" className="mb-12">
          <form onSubmit={handleSearch} className="p-8">
            {/* Trip Type Tabs */}
            <div className="flex gap-4 mb-6">
              {['roundtrip', 'oneway', 'multicity'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTripType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    tripType === type
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'roundtrip'
                    ? 'Round Trip'
                    : type === 'oneway'
                    ? 'One Way'
                    : 'Multi-City'}
                </button>
              ))}
            </div>

            {/* Search Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              {/* From */}
              <div className="lg:col-span-2">
                <Input
                  label="From"
                  placeholder="Departure city"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  required
                />
              </div>

              {/* To */}
              <div className="lg:col-span-2">
                <Input
                  label="To"
                  placeholder="Destination city"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  }
                  required
                />
              </div>

              {/* Swap Button */}
              <button
                type="button"
                className="flex items-center justify-center p-3 rounded-lg border-2 border-gray-300 hover:border-sky-500 transition-colors lg:col-span-1 mt-6"
                title="Swap"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4" />
                </svg>
              </button>
            </div>

            {/* Date & Passenger Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Input
                label="Depart"
                type="date"
                name="departDate"
                value={formData.departDate}
                onChange={handleChange}
                required
              />

              {tripType === 'roundtrip' && (
                <Input
                  label="Return"
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  required
                />
              )}

              <select
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 self-end"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>

              <select
                name="cabin"
                value={formData.cabin}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 self-end"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1 md:flex-none"
              >
                Search Flights
              </Button>
              <Button type="reset" variant="outline" size="lg">
                Clear
              </Button>
            </div>
          </form>
        </Card>

        {/* Popular Routes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRoutes.map((route, index) => (
              <Card key={index} variant="default" interactive={true}>
                <div className="p-6 text-center">
                  <p className="text-4xl mb-3">{route.icon}</p>
                  <p className="font-semibold text-gray-900">
                    {route.from} → {route.to}
                  </p>
                  <p className="text-2xl font-bold text-sky-600 mt-3">
                    {route.price}
                  </p>
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        from: route.from,
                        to: route.to,
                      });
                    }}
                  >
                    Select
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Book With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: '✈️',
                title: 'Best Prices',
                desc: 'Compare and book the lowest fares',
              },
              {
                icon: '🛡️',
                title: 'Secure Booking',
                desc: 'Your payment is 100% protected',
              },
              {
                icon: '24/7',
                title: '24/7 Support',
                desc: 'Available in 50+ languages',
              },
              {
                icon: '⏱️',
                title: 'Instant Confirmation',
                desc: 'Get your e-ticket in seconds',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <p className="text-4xl mb-3">{feature.icon}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
