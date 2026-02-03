'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';

export default function InsurancePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: '1',
    tripCost: '',
    coverageType: 'comprehensive',
  });

  const handleGetQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      destination: formData.destination,
      start: formData.startDate,
      end: formData.endDate,
      travelers: formData.travelers,
      cost: formData.tripCost,
      type: formData.coverageType,
    });
    router.push(`/insurance/quote?${params.toString()}`);
  };

  const plans = [
    {
      name: 'Basic',
      price: '$29',
      period: 'per trip',
      icon: '🛡️',
      color: 'cyan',
      features: [
        { included: true, text: 'Medical Emergency ($50k)' },
        { included: true, text: 'Emergency Evacuation' },
        { included: true, text: 'Trip Cancellation (50%)' },
        { included: false, text: 'Baggage Loss' },
        { included: false, text: 'Adventure Sports' },
        { included: false, text: '24/7 Assistance' },
      ],
      bestFor: 'Short domestic trips',
    },
    {
      name: 'Standard',
      price: '$79',
      period: 'per trip',
      icon: '⭐',
      color: 'sky',
      popular: true,
      features: [
        { included: true, text: 'Medical Emergency ($100k)' },
        { included: true, text: 'Emergency Evacuation' },
        { included: true, text: 'Trip Cancellation (100%)' },
        { included: true, text: 'Baggage Loss ($2k)' },
        { included: true, text: 'Flight Delay' },
        { included: true, text: '24/7 Assistance' },
      ],
      bestFor: 'International travel',
    },
    {
      name: 'Premium',
      price: '$149',
      period: 'per trip',
      icon: '👑',
      color: 'purple',
      features: [
        { included: true, text: 'Medical Emergency ($250k)' },
        { included: true, text: 'Emergency Evacuation' },
        { included: true, text: 'Trip Cancellation (100%)' },
        { included: true, text: 'Baggage Loss ($5k)' },
        { included: true, text: 'Adventure Sports' },
        { included: true, text: 'Cancel for Any Reason' },
        { included: true, text: 'Rental Car Coverage' },
        { included: true, text: '24/7 Concierge' },
      ],
      bestFor: 'Luxury & adventure trips',
    },
  ];

  const coverageTypes = [
    {
      type: 'Trip Cancellation',
      icon: '✖️',
      description: 'Get reimbursed if you need to cancel your trip for covered reasons',
      coverage: 'Up to 100% of trip cost',
    },
    {
      type: 'Medical Emergency',
      icon: '🏥',
      description: 'Coverage for medical expenses and emergency evacuation abroad',
      coverage: 'Up to $250,000',
    },
    {
      type: 'Baggage Protection',
      icon: '🧳',
      description: 'Coverage for lost, stolen, or damaged luggage and personal items',
      coverage: 'Up to $5,000',
    },
    {
      type: 'Flight Delay',
      icon: '⏰',
      description: 'Reimbursement for expenses due to flight delays or missed connections',
      coverage: 'Up to $500',
    },
    {
      type: 'Adventure Sports',
      icon: '🏔️',
      description: 'Coverage for skiing, diving, hiking, and other adventure activities',
      coverage: 'Included in medical',
    },
    {
      type: '24/7 Assistance',
      icon: '☎️',
      description: 'Round-the-clock support for emergencies and travel issues',
      coverage: 'Always available',
    },
  ];

  const claims = [
    {
      step: '1',
      title: 'Report Incident',
      description: 'Contact us within 24 hours of the incident',
      icon: '📞',
    },
    {
      step: '2',
      title: 'Submit Documents',
      description: 'Upload receipts, medical reports, or police reports',
      icon: '📄',
    },
    {
      step: '3',
      title: 'Review Process',
      description: 'Our team reviews your claim within 5 business days',
      icon: '🔍',
    },
    {
      step: '4',
      title: 'Get Reimbursed',
      description: 'Approved claims paid within 7-10 business days',
      icon: '💰',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-700 text-white pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Travel with Peace of Mind</h1>
          <p className="text-xl text-cyan-100 mb-8">Comprehensive travel insurance for every journey</p>

          {/* Quote Form */}
          <Card variant="elevated" className="bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleGetQuote} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Destination */}
                  <Input
                    label="Destination"
                    placeholder="Where are you going?"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />

                  {/* Number of Travelers */}
                  <Select
                    label="Number of Travelers"
                    value={formData.travelers}
                    onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                    options={[
                      { value: '1', label: '1 Traveler' },
                      { value: '2', label: '2 Travelers' },
                      { value: '3', label: '3 Travelers' },
                      { value: '4', label: '4 Travelers' },
                      { value: '5', label: '5+ Travelers (Family)' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <Input
                    label="Trip Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />

                  {/* End Date */}
                  <Input
                    label="Trip End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Trip Cost */}
                  <Input
                    label="Total Trip Cost (USD)"
                    type="number"
                    placeholder="5000"
                    value={formData.tripCost}
                    onChange={(e) => setFormData({ ...formData, tripCost: e.target.value })}
                    required
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />

                  {/* Coverage Type */}
                  <Select
                    label="Coverage Type"
                    value={formData.coverageType}
                    onChange={(e) => setFormData({ ...formData, coverageType: e.target.value })}
                    options={[
                      { value: 'basic', label: 'Basic - Essential Coverage' },
                      { value: 'comprehensive', label: 'Comprehensive - Recommended' },
                      { value: 'premium', label: 'Premium - Full Protection' },
                    ]}
                  />
                </div>

                {/* Get Quote Button */}
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Get Instant Quote
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insurance Plans */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Our Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              variant={plan.popular ? 'elevated' : 'default'}
              className={plan.popular ? 'border-2 border-sky-500 relative' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="primary" size="sm">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{plan.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-cyan-600">{plan.price}</span>
                    <span className="text-sm text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plan.bestFor}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={feature.included ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm line-through'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="md"
                  fullWidth
                >
                  Select {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Coverage Types */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What's Covered</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverageTypes.map((coverage, index) => (
              <Card key={index} variant="outlined">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{coverage.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{coverage.type}</h3>
                      <p className="text-sm text-gray-600 mb-3">{coverage.description}</p>
                      <Badge variant="info" size="sm">
                        {coverage.coverage}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Claims Process */}
      <div className="bg-cyan-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Simple Claims Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {claims.map((claim, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {claim.step}
                  </div>
                  {index < claims.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-cyan-300" />
                  )}
                </div>
                <div className="text-4xl mb-3">{claim.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{claim.title}</h3>
                <p className="text-sm text-gray-600">{claim.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">95% Claim Approval Rate</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We pride ourselves on fast, fair claim processing. Most claims are approved within 5 business days
              and paid within 10 business days.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="md">
                File a Claim
              </Button>
              <Button variant="outline" size="md">
                Track Claim Status
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'When should I buy travel insurance?',
                a: 'It\'s best to purchase travel insurance within 14 days of making your initial trip deposit to maximize coverage benefits.',
              },
              {
                q: 'Can I cancel my policy and get a refund?',
                a: 'Yes, most policies offer a free-look period of 10-14 days where you can cancel for a full refund if you haven\'t started your trip.',
              },
              {
                q: 'Does travel insurance cover COVID-19?',
                a: 'Yes, our policies include coverage for COVID-19 related cancellations, medical expenses, and quarantine costs.',
              },
              {
                q: 'What is "Cancel for Any Reason" coverage?',
                a: 'This optional upgrade allows you to cancel your trip for any reason and receive 75% of your trip costs back.',
              },
            ].map((faq, index) => (
              <Card key={index} variant="outlined">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
