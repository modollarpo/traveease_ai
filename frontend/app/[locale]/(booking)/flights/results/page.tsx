'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';

export default function FlightResultsPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    airline: [] as string[],
    stops: [] as string[],
    priceRange: [0, 5000],
  });

  const [sortBy, setSortBy] = useState('price');

  const flights = [
    {
      id: 1,
      airline: 'Air France',
      logo: '✈️',
      departure: '08:00',
      arrival: '20:15',
      departureAirport: 'JFK',
      arrivalAirport: 'CDG',
      duration: '7h 15m',
      stops: 0,
      price: 1200,
      rating: 4.8,
      reviews: 2400,
      badge: 'Best Value',
    },
    {
      id: 2,
      airline: 'United Airlines',
      logo: '✈️',
      departure: '10:30',
      arrival: '22:45',
      departureAirport: 'JFK',
      arrivalAirport: 'CDG',
      duration: '7h 15m',
      stops: 0,
      price: 950,
      rating: 4.6,
      reviews: 1800,
      badge: 'Cheapest',
    },
    {
      id: 3,
      airline: 'Delta Air Lines',
      logo: '✈️',
      departure: '14:00',
      arrival: '02:20',
      departureAirport: 'JFK',
      arrivalAirport: 'CDG',
      duration: '8h 20m',
      stops: 1,
      price: 850,
      rating: 4.5,
      reviews: 1500,
      badge: '',
    },
    {
      id: 4,
      airline: 'Air France',
      logo: '✈️',
      departure: '18:00',
      arrival: '06:30',
      departureAirport: 'JFK',
      arrivalAirport: 'CDG',
      duration: '7h 30m',
      stops: 0,
      price: 1400,
      rating: 4.9,
      reviews: 3100,
      badge: 'Best Rated',
    },
  ];

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].includes(value)
        ? (prev[category as keyof typeof prev] as string[]).filter((v) => v !== value)
        : [...(prev[category as keyof typeof prev] as string[]), value],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Flights from New York (JFK) to Paris (CDG)
          </h1>
          <p className="text-gray-600">
            March 15, 2026 • 1 Passenger • Economy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="default">
              <div className="p-6 space-y-6">
                {/* Sort */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="price">Price (Low to High)</option>
                    <option value="duration">Duration</option>
                    <option value="rating">Rating</option>
                    <option value="departure">Departure Time</option>
                  </select>
                </div>

                {/* Airline Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Airlines</h3>
                  <div className="space-y-2">
                    {['Air France', 'United Airlines', 'Delta Air Lines'].map((airline) => (
                      <Checkbox
                        key={airline}
                        label={airline}
                        checked={selectedFilters.airline.includes(airline)}
                        onChange={() => handleFilterChange('airline', airline)}
                      />
                    ))}
                  </div>
                </div>

                {/* Stops Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Stops</h3>
                  <div className="space-y-2">
                    {['Non-stop', '1 Stop', '2+ Stops'].map((stop) => (
                      <Checkbox
                        key={stop}
                        label={stop}
                        checked={selectedFilters.stops.includes(stop)}
                        onChange={() => handleFilterChange('stops', stop)}
                      />
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={selectedFilters.priceRange[1]}
                      onChange={(e) =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], parseInt(e.target.value)],
                        }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">${selectedFilters.priceRange[0]}</span>
                      <span className="font-semibold text-gray-900">
                        ${selectedFilters.priceRange[1]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <Button variant="outline" fullWidth size="md">
                  Reset Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Flight Results */}
          <div className="lg:col-span-3 space-y-4">
            {flights.length === 0 ? (
              <Card variant="default" className="text-center py-12">
                <p className="text-gray-600">No flights found. Try adjusting your filters.</p>
              </Card>
            ) : (
              flights.map((flight) => (
                <Card key={flight.id} variant="default" interactive={true}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                      {/* Airline */}
                      <div className="md:col-span-1">
                        <p className="text-xl font-semibold text-gray-900">
                          {flight.airline}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {flight.rating} ⭐ ({flight.reviews.toLocaleString()})
                        </p>
                      </div>

                      {/* Flight Times */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {flight.departure}
                            </p>
                            <p className="text-sm text-gray-600">{flight.departureAirport}</p>
                          </div>

                          <div className="text-center flex-1">
                            <div className="relative h-1 bg-gray-200 rounded mb-2">
                              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600 rounded w-1/2" />
                            </div>
                            <p className="text-xs text-gray-600">{flight.duration}</p>
                            {flight.stops === 0 ? (
                              <Badge variant="success" size="sm" className="mt-1">
                                Non-stop
                              </Badge>
                            ) : (
                              <Badge variant="warning" size="sm" className="mt-1">
                                {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>

                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {flight.arrival}
                            </p>
                            <p className="text-sm text-gray-600">{flight.arrivalAirport}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="md:col-span-2 flex items-center justify-between">
                        <div className="text-right">
                          {flight.badge && (
                            <Badge variant="info" size="sm" className="mb-2">
                              {flight.badge}
                            </Badge>
                          )}
                          <p className="text-3xl font-bold text-sky-600">
                            ${flight.price}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">per person</p>
                        </div>

                        <Link href={`/flights/${flight.id}`}>
                          <Button variant="primary" size="md">
                            Select
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
