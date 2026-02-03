'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';

export default function HomePage() {
  const [searchType, setSearchType] = useState('flights');

  const destinations = [
    {
      name: 'Paris',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=500&fit=crop',
      price: 'From $899',
      description: 'City of lights and romance',
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1540959375944-7049f642e9a1?w=400&h=500&fit=crop',
      price: 'From $1,299',
      description: 'Modern metropolis meets tradition',
    },
    {
      name: 'Dubai',
      country: 'UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=500&fit=crop',
      price: 'From $799',
      description: 'Luxury and desert adventures',
    },
    {
      name: 'New York',
      country: 'USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=500&fit=crop',
      price: 'From $699',
      description: 'The city that never sleeps',
    },
  ];

  const deals = [
    { title: '50% Off Hotels in Europe', description: 'Book now for summer travel', badge: 'Hot Deal' },
    { title: 'Free Car Rental Upgrade', description: 'On bookings over $500', badge: 'Limited Time' },
    { title: 'Earn 2x Points', description: 'On all flight bookings', badge: 'Rewards' },
  ];

  const searchTabs = [
    {
      label: 'Flights',
      value: 'flights',
      icon: '✈️',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="From (City or Airport)" />
            <Input placeholder="To (City or Airport)" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input type="date" placeholder="Departure" />
            <Input type="date" placeholder="Return" />
            <Input placeholder="Passengers" defaultValue="1 Adult" />
          </div>
          <Link href="/flights/results">
            <Button variant="primary" size="lg" fullWidth>
              Search Flights
            </Button>
          </Link>
        </div>
      ),
    },
    {
      label: 'Hotels',
      value: 'hotels',
      icon: '🏨',
      content: (
        <div className="space-y-4">
          <Input placeholder="Destination or Hotel Name" />
          <div className="grid grid-cols-3 gap-4">
            <Input type="date" placeholder="Check-in" />
            <Input type="date" placeholder="Check-out" />
            <Input placeholder="Guests" defaultValue="2 Adults" />
          </div>
          <Link href="/hotels/results">
            <Button variant="primary" size="lg" fullWidth>
              Search Hotels
            </Button>
          </Link>
        </div>
      ),
    },
    {
      label: 'Cars',
      value: 'cars',
      icon: '🚗',
      content: (
        <div className="space-y-4">
          <Input placeholder="Pick-up Location" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="datetime-local" placeholder="Pick-up Date & Time" />
            <Input type="datetime-local" placeholder="Drop-off Date & Time" />
          </div>
          <Link href="/cars/results">
            <Button variant="primary" size="lg" fullWidth>
              Search Cars
            </Button>
          </Link>
        </div>
      ),
    },
    {
      label: 'Tours',
      value: 'tours',
      icon: '🎫',
      content: (
        <div className="space-y-4">
          <Input placeholder="Destination" />
          <Input type="date" placeholder="Travel Date" />
          <Link href="/tours/results">
            <Button variant="primary" size="lg" fullWidth>
              Search Tours
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-sky-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Your Journey Begins Here
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Book flights, hotels, cars, and tours with AI-powered recommendations.
            Travel smarter with Traveease.
          </p>

          {/* Search Box */}
          <Card variant="elevated" className="max-w-4xl">
            <CardContent className="p-6">
              <Tabs tabs={searchTabs} defaultValue="flights" />
            </CardContent>
          </Card>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#ffffff"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            />
          </svg>
        </div>
      </div>

      {/* Popular Destinations */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
              <p className="text-gray-600 mt-2">Explore the world's most amazing places</p>
            </div>
            <Button variant="outline">View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Card key={dest.name} variant="default" interactive className="overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{dest.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{dest.country}</p>
                    <p className="text-xs text-gray-500 mb-3">{dest.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sky-600 font-semibold">{dest.price}</span>
                      <Button variant="primary" size="sm">
                        Explore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Exclusive Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deals.map((deal, index) => (
              <Card key={index} variant="elevated">
                <CardContent className="p-6">
                  <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-full mb-3">
                    {deal.badge}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{deal.title}</h3>
                  <p className="text-gray-600 mb-4">{deal.description}</p>
                  <Button variant="primary" size="sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose Traveease?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Search</h3>
              <p className="text-gray-600">
                Smart recommendations based on your preferences and budget
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">
                Find the lowest prices or we'll refund the difference
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Coverage</h3>
              <p className="text-gray-600">
                Access millions of options worldwide in 150+ countries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-500 to-blue-600 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join millions of travelers and start booking your dream trip today
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="bg-white text-sky-600 hover:bg-gray-100">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/flights">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-sky-600">
                Explore Destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Traveease</h3>
            <p className="text-gray-400 text-sm">
              Your AI-native travel operating system for seamless booking experiences.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/press">Press</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/cookies">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; 2026 Traveease. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
