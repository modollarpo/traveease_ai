'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function VisaApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fromCountry: '',
    toCountry: '',
    visaType: '',
    travelDate: '',
  });

  const handleStartApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      from: formData.fromCountry,
      to: formData.toCountry,
      type: formData.visaType,
      date: formData.travelDate,
    });
    router.push(`/visas/application?${params.toString()}`);
  };

  const popularDestinations = [
    {
      country: 'United States',
      flag: '🇺🇸',
      types: ['Tourist B-2', 'Business B-1', 'Student F-1'],
      processingTime: '30-60 days',
      difficulty: 'Moderate',
      fee: '$160',
    },
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      types: ['Standard Visitor', 'Work', 'Student'],
      processingTime: '15-20 days',
      difficulty: 'Moderate',
      fee: '£100',
    },
    {
      country: 'Schengen (Europe)',
      flag: '🇪🇺',
      types: ['Tourist', 'Business', 'Transit'],
      processingTime: '15-30 days',
      difficulty: 'Easy',
      fee: '€80',
    },
    {
      country: 'Canada',
      flag: '🇨🇦',
      types: ['Visitor', 'Study', 'Work'],
      processingTime: '10-30 days',
      difficulty: 'Easy',
      fee: 'CAD $100',
    },
    {
      country: 'Australia',
      flag: '🇦🇺',
      types: ['eVisitor', 'Work', 'Student'],
      processingTime: '5-15 days',
      difficulty: 'Easy',
      fee: 'AUD $145',
    },
    {
      country: 'Dubai (UAE)',
      flag: '🇦🇪',
      types: ['Tourist', 'Transit', 'Visit'],
      processingTime: '3-5 days',
      difficulty: 'Easy',
      fee: 'AED 250',
    },
  ];

  const visaTypes = [
    {
      type: 'Tourist Visa',
      icon: '✈️',
      description: 'For leisure travel and vacation',
      duration: 'Up to 90 days',
    },
    {
      type: 'Business Visa',
      icon: '💼',
      description: 'For business meetings and conferences',
      duration: 'Varies',
    },
    {
      type: 'Student Visa',
      icon: '🎓',
      description: 'For academic studies',
      duration: 'Duration of course',
    },
    {
      type: 'Work Visa',
      icon: '🏢',
      description: 'For employment purposes',
      duration: 'Contract duration',
    },
  ];

  const requirements = [
    {
      title: 'Valid Passport',
      description: 'Must be valid for at least 6 months beyond travel dates',
      icon: '📕',
    },
    {
      title: 'Passport Photos',
      description: 'Recent photos meeting specific size requirements',
      icon: '📸',
    },
    {
      title: 'Application Form',
      description: 'Completed and signed visa application',
      icon: '📝',
    },
    {
      title: 'Financial Proof',
      description: 'Bank statements or sponsorship letter',
      icon: '💰',
    },
    {
      title: 'Travel Insurance',
      description: 'Coverage for medical emergencies',
      icon: '🏥',
    },
    {
      title: 'Supporting Docs',
      description: 'Invitation letters, hotel bookings, etc.',
      icon: '📄',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-blue-700 text-white pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Visa Application Made Simple</h1>
          <p className="text-xl text-indigo-100 mb-8">Get expert assistance with your visa application process</p>

          {/* Application Form */}
          <Card variant="elevated" className="bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleStartApplication} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Country */}
                  <Select
                    label="Your Current Country"
                    value={formData.fromCountry}
                    onChange={(e) => setFormData({ ...formData, fromCountry: e.target.value })}
                    required
                    options={[
                      { value: '', label: 'Select your country' },
                      { value: 'ng', label: '🇳🇬 Nigeria' },
                      { value: 'gh', label: '🇬🇭 Ghana' },
                      { value: 'ke', label: '🇰🇪 Kenya' },
                      { value: 'za', label: '🇿🇦 South Africa' },
                      { value: 'in', label: '🇮🇳 India' },
                      { value: 'cn', label: '🇨🇳 China' },
                    ]}
                  />

                  {/* To Country */}
                  <Select
                    label="Destination Country"
                    value={formData.toCountry}
                    onChange={(e) => setFormData({ ...formData, toCountry: e.target.value })}
                    required
                    options={[
                      { value: '', label: 'Where are you going?' },
                      { value: 'us', label: '🇺🇸 United States' },
                      { value: 'uk', label: '🇬🇧 United Kingdom' },
                      { value: 'schengen', label: '🇪🇺 Schengen Zone' },
                      { value: 'ca', label: '🇨🇦 Canada' },
                      { value: 'au', label: '🇦🇺 Australia' },
                      { value: 'ae', label: '🇦🇪 UAE (Dubai)' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visa Type */}
                  <Select
                    label="Visa Type"
                    value={formData.visaType}
                    onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                    required
                    options={[
                      { value: '', label: 'Select visa type' },
                      { value: 'tourist', label: '✈️ Tourist' },
                      { value: 'business', label: '💼 Business' },
                      { value: 'student', label: '🎓 Student' },
                      { value: 'work', label: '🏢 Work' },
                      { value: 'transit', label: '🔄 Transit' },
                    ]}
                  />

                  {/* Travel Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planned Travel Date
                    </label>
                    <input
                      type="date"
                      value={formData.travelDate}
                      onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Start Visa Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Visa Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularDestinations.map((destination, index) => (
            <Card key={index} variant="default" interactive={true}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{destination.flag}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{destination.country}</h3>
                    <Badge
                      variant={
                        destination.difficulty === 'Easy' ? 'success' :
                        destination.difficulty === 'Moderate' ? 'warning' : 'error'
                      }
                      size="sm"
                      className="mt-1"
                    >
                      {destination.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">Processing: {destination.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">Fee: {destination.fee}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-gray-700">Common Visa Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {destination.types.map((type, i) => (
                      <Badge key={i} variant="info" size="sm">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" size="sm" fullWidth>
                  View Requirements
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Visa Types */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Visa Types We Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visaTypes.map((visa, index) => (
              <Card key={index} variant="outlined" interactive={true}>
                <CardContent className="text-center py-8">
                  <div className="text-5xl mb-4">{visa.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{visa.type}</h3>
                  <p className="text-sm text-gray-600 mb-3">{visa.description}</p>
                  <Badge variant="primary" size="sm">
                    {visa.duration}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* General Requirements */}
      <div className="bg-indigo-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Common Visa Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requirements.map((req, index) => (
              <Card key={index} variant="default">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{req.icon}</div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{req.title}</h3>
                      <p className="text-sm text-gray-600">{req.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 bg-white rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 rounded-full p-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help with Your Application?</h3>
                <p className="text-gray-600 mb-4">
                  Our visa experts can review your documents, ensure completeness, and guide you through the entire process.
                </p>
                <Button variant="primary" size="md">
                  Speak with a Visa Expert
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
