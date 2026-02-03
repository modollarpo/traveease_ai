'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function InsuranceQuotePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Coverage',
      price: 35,
      recommended: false,
      coverage: [
        { item: 'Medical Emergency', amount: '$50,000', included: true },
        { item: 'Trip Cancellation', amount: '$5,000', included: true },
        { item: 'Lost Baggage', amount: '$1,000', included: true },
        { item: 'Flight Delay', amount: '$500', included: true },
        { item: 'Emergency Evacuation', amount: '$25,000', included: false },
        { item: 'Adventure Sports', amount: 'Not covered', included: false },
        { item: 'COVID-19 Coverage', amount: 'Not covered', included: false },
      ],
    },
    {
      id: 'standard',
      name: 'Standard Coverage',
      price: 65,
      recommended: true,
      coverage: [
        { item: 'Medical Emergency', amount: '$100,000', included: true },
        { item: 'Trip Cancellation', amount: '$10,000', included: true },
        { item: 'Lost Baggage', amount: '$2,500', included: true },
        { item: 'Flight Delay', amount: '$1,000', included: true },
        { item: 'Emergency Evacuation', amount: '$100,000', included: true },
        { item: 'Adventure Sports', amount: '$50,000', included: true },
        { item: 'COVID-19 Coverage', amount: 'Included', included: true },
      ],
    },
    {
      id: 'premium',
      name: 'Premium Coverage',
      price: 95,
      recommended: false,
      coverage: [
        { item: 'Medical Emergency', amount: '$250,000', included: true },
        { item: 'Trip Cancellation', amount: '$25,000', included: true },
        { item: 'Lost Baggage', amount: '$5,000', included: true },
        { item: 'Flight Delay', amount: '$2,000', included: true },
        { item: 'Emergency Evacuation', amount: '$250,000', included: true },
        { item: 'Adventure Sports', amount: '$100,000', included: true },
        { item: 'COVID-19 Coverage', amount: 'Enhanced', included: true },
        { item: 'Rental Car Damage', amount: '$10,000', included: true },
        { item: 'Cancel for Any Reason', amount: '75% refund', included: true },
      ],
    },
  ];

  const tripDetails = {
    destination: 'Paris, France',
    startDate: 'March 15, 2026',
    endDate: 'March 29, 2026',
    duration: '14 days',
    travelers: 2,
    tripCost: '$3,500',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/insurance" className="hover:text-sky-600">Insurance</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Compare Plans</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Travel Insurance Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Protect your trip with comprehensive travel insurance. 
            Compare plans and select the coverage that's right for you.
          </p>
        </div>

        {/* Trip Summary */}
        <Card variant="elevated" className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <p className="text-gray-600 mb-1">Destination</p>
                <p className="font-semibold text-gray-900">{tripDetails.destination}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Travel Dates</p>
                <p className="font-semibold text-gray-900">{tripDetails.startDate} - {tripDetails.endDate}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Duration</p>
                <p className="font-semibold text-gray-900">{tripDetails.duration}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Travelers</p>
                <p className="font-semibold text-gray-900">{tripDetails.travelers} Adults</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Trip Cost</p>
                <p className="font-semibold text-gray-900">{tripDetails.tripCost}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant={selectedPlan === plan.id ? 'elevated' : 'default'}
              className={`relative ${
                selectedPlan === plan.id ? 'ring-2 ring-sky-500' : ''
              } ${plan.recommended ? 'lg:scale-105 shadow-xl' : ''}`}
            >
              <CardContent className="p-0">
                {plan.recommended && (
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-center py-2 text-sm font-semibold">
                    ⭐ Most Popular
                  </div>
                )}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">per person</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">for {tripDetails.duration}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.coverage.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        {item.included ? (
                          <span className="text-emerald-600 flex-shrink-0 mt-0.5">✓</span>
                        ) : (
                          <span className="text-gray-400 flex-shrink-0 mt-0.5">✗</span>
                        )}
                        <div className="flex-1">
                          <p className={item.included ? 'text-gray-900' : 'text-gray-500'}>
                            {item.item}
                          </p>
                          <p className={`text-xs ${item.included ? 'text-gray-600' : 'text-gray-400'}`}>
                            {item.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant={selectedPlan === plan.id ? 'primary' : 'outline'}
                    size="lg"
                    fullWidth
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Benefits */}
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle>What's Included in All Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🏥</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">24/7 Medical Assistance</h4>
                  <p className="text-sm text-gray-600">
                    Access to emergency medical services anywhere in the world
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">📞</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Concierge Support</h4>
                  <p className="text-sm text-gray-600">
                    Multilingual support team available around the clock
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">💳</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instant Claims</h4>
                  <p className="text-sm text-gray-600">
                    Fast, easy claims process with mobile app submission
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        {selectedPlan && (
          <div className="text-center">
            <Link href="/insurance/purchase">
              <Button variant="primary" size="lg">
                Continue to Purchase ({plans.find((p) => p.id === selectedPlan)?.name} - ${plans.find((p) => p.id === selectedPlan)?.price}/person)
              </Button>
            </Link>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="default">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  When should I buy travel insurance?
                </h4>
                <p className="text-sm text-gray-600">
                  We recommend purchasing insurance as soon as you book your trip for maximum coverage, 
                  including trip cancellation benefits.
                </p>
              </CardContent>
            </Card>
            <Card variant="default">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Does this cover pre-existing medical conditions?
                </h4>
                <p className="text-sm text-gray-600">
                  Standard and Premium plans include coverage for pre-existing conditions if purchased 
                  within 14 days of your initial trip deposit.
                </p>
              </CardContent>
            </Card>
            <Card variant="default">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  How do I file a claim?
                </h4>
                <p className="text-sm text-gray-600">
                  Claims can be filed through our mobile app or website. Simply upload receipts and 
                  documentation, and we'll process your claim within 5-7 business days.
                </p>
              </CardContent>
            </Card>
            <Card variant="default">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I cancel my insurance policy?
                </h4>
                <p className="text-sm text-gray-600">
                  Yes, you can cancel within 14 days of purchase for a full refund, provided you haven't 
                  already started your trip or filed a claim.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
