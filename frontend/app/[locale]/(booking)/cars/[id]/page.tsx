'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Stepper } from '@/components/ui/Stepper';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';

export default function CarBookingPage({ params }: { params: { id: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);

  const steps = [
    { label: 'Insurance & Extras', completed: currentStep > 1, current: currentStep === 1 },
    { label: 'Driver Details', completed: currentStep > 2, current: currentStep === 2 },
    { label: 'Review & Pay', completed: false, current: currentStep === 3 },
  ];

  const insuranceOptions = [
    {
      id: 'basic',
      name: 'Basic Protection',
      price: 15,
      coverage: [
        'Collision Damage Waiver (CDW)',
        'Third Party Liability',
        '$500 Excess/Deductible',
      ],
    },
    {
      id: 'standard',
      name: 'Standard Protection',
      price: 25,
      coverage: [
        'All Basic Protection benefits',
        'Theft Protection',
        'Windscreen & Tire Protection',
        '$100 Excess/Deductible',
      ],
      recommended: true,
    },
    {
      id: 'premium',
      name: 'Premium Protection',
      price: 35,
      coverage: [
        'All Standard Protection benefits',
        'Personal Accident Insurance',
        'Roadside Assistance',
        'Zero Excess/Deductible',
      ],
    },
  ];

  const extras = [
    { id: 'gps', name: 'GPS Navigation', price: 10 },
    { id: 'childSeat', name: 'Child Safety Seat', price: 8 },
    { id: 'additionalDriver', name: 'Additional Driver', price: 12 },
    { id: 'wifi', name: 'Mobile WiFi Hotspot', price: 15 },
  ];

  const carDetails = {
    name: 'Toyota Corolla',
    category: 'Economy',
    supplier: 'Enterprise Rent-A-Car',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=400&fit=crop',
    specs: {
      passengers: 5,
      bags: 3,
      transmission: 'Automatic',
      fuelType: 'Gasoline',
    },
    features: ['Air Conditioning', 'Bluetooth', 'USB Ports'],
    dailyRate: 45,
    rentalDays: 7,
  };

  const tabContent = [
    {
      label: 'Overview',
      value: 'overview',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">About This Vehicle</h4>
            <p className="text-sm text-gray-600">
              The Toyota Corolla is a reliable and fuel-efficient sedan perfect for city driving and road trips. 
              With comfortable seating for up to 5 passengers and ample trunk space, it's ideal for both 
              business and leisure travel.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {carDetails.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-emerald-600">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Terms & Conditions',
      value: 'terms',
      content: (
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Rental Terms</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Minimum age requirement: 21 years old</li>
              <li>Valid driver's license required (held for at least 1 year)</li>
              <li>Credit card required for security deposit</li>
              <li>Additional driver fee: $12/day</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Fuel Policy</h4>
            <p>Full to Full - Pick up and return with a full tank of fuel</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h4>
            <p>Free cancellation up to 24 hours before pick-up. Late cancellations subject to fees.</p>
          </div>
        </div>
      ),
    },
    {
      label: 'Pick-up Location',
      value: 'location',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Enterprise - Downtown Office</h4>
            <p className="text-sm text-gray-600">123 Airport Road, Terminal 1</p>
            <p className="text-sm text-gray-600">New York, NY 10001</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Opening Hours</h4>
            <p className="text-sm text-gray-600">Monday - Sunday: 6:00 AM - 10:00 PM</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
            <p className="text-sm text-gray-600">Phone: +1 (555) 234-5678</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/cars" className="hover:text-sky-600">Cars</Link>
          <span className="mx-2">›</span>
          <Link href="/cars/results" className="hover:text-sky-600">Search Results</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{carDetails.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Info */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{carDetails.name}</h1>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{carDetails.category}</Badge>
                      <span className="text-sm text-gray-600">{carDetails.supplier}</span>
                    </div>
                  </div>
                </div>

                <img
                  src={carDetails.image}
                  alt={carDetails.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">👥</div>
                    <div className="text-sm text-gray-600">{carDetails.specs.passengers} Passengers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💼</div>
                    <div className="text-sm text-gray-600">{carDetails.specs.bags} Bags</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚙️</div>
                    <div className="text-sm text-gray-600">{carDetails.specs.transmission}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⛽</div>
                    <div className="text-sm text-gray-600">{carDetails.specs.fuelType}</div>
                  </div>
                </div>

                <Tabs tabs={tabContent} defaultValue="overview" />
              </CardContent>
            </Card>

            {/* Stepper */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <Stepper steps={steps} />
              </CardContent>
            </Card>

            {/* Step Content */}
            {currentStep === 1 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Choose Your Protection Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insuranceOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedInsurance === option.id
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedInsurance(option.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              checked={selectedInsurance === option.id}
                              onChange={() => setSelectedInsurance(option.id)}
                              className="w-4 h-4 text-sky-600"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{option.name}</h3>
                              {option.recommended && (
                                <Badge variant="success" className="mt-1">Recommended</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">${option.price}</div>
                            <div className="text-xs text-gray-600">per day</div>
                          </div>
                        </div>
                        <ul className="space-y-1 text-sm text-gray-600 ml-7">
                          {option.coverage.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-emerald-600">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Optional Extras</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {extras.map((extra) => (
                        <Checkbox
                          key={extra.id}
                          id={extra.id}
                          label={`${extra.name} (+$${extra.price}/day)`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedInsurance}
                    >
                      Continue to Driver Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Driver Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="First Name" placeholder="John" required />
                      <Input label="Last Name" placeholder="Doe" required />
                    </div>

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      required
                    />

                    <Input
                      label="Date of Birth"
                      type="date"
                      required
                      helperText="Driver must be at least 21 years old"
                    />

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Driver's License</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="License Number" placeholder="DL123456789" required />
                        <Input label="Expiry Date" type="date" required />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
                      <div className="space-y-4">
                        <Input label="Street Address" placeholder="123 Main St" required />
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="City" placeholder="New York" required />
                          <Input label="State/Province" placeholder="NY" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Postal Code" placeholder="10001" required />
                          <Input label="Country" placeholder="United States" required />
                        </div>
                      </div>
                    </div>

                    <TextArea
                      label="Special Requests (Optional)"
                      placeholder="Any special requirements or requests..."
                      rows={3}
                    />

                    <div className="space-y-3">
                      <Checkbox
                        id="terms"
                        label="I accept the rental terms and conditions"
                        required
                      />
                      <Checkbox
                        id="age"
                        label="I confirm I am at least 21 years old"
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep(1)}
                      >
                        ← Back
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setCurrentStep(3)}
                        className="flex-1"
                      >
                        Continue to Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Review Your Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Rental Summary</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Car Rental (7 days × $45)</span>
                          <span className="font-medium">$315.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Standard Protection (7 days × $25)</span>
                          <span className="font-medium">$175.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxes & Fees</span>
                          <span className="font-medium">$49.00</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-emerald-600">$539.00</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Driver Information</h4>
                      <div className="text-sm text-gray-600">
                        <p>John Doe</p>
                        <p>john.doe@example.com</p>
                        <p>+1 (555) 123-4567</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep(2)}
                      >
                        ← Back
                      </Button>
                      <Link href="/cars/confirmation" className="flex-1">
                        <Button variant="primary" size="lg" fullWidth>
                          Confirm & Pay
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pick-up</p>
                      <p className="font-medium text-gray-900">March 15, 2026</p>
                      <p className="text-sm text-gray-600">10:00 AM</p>
                      <p className="text-sm text-gray-600 mt-1">JFK Airport</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-1">Drop-off</p>
                      <p className="font-medium text-gray-900">March 22, 2026</p>
                      <p className="text-sm text-gray-600">10:00 AM</p>
                      <p className="text-sm text-gray-600 mt-1">JFK Airport</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-1">Rental Duration</p>
                      <p className="font-medium text-gray-900">7 Days</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">Selected Vehicle</p>
                      <p className="font-medium text-gray-900">{carDetails.name}</p>
                      <Badge variant="info" className="mt-1">{carDetails.category}</Badge>
                    </div>

                    {selectedInsurance && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-1">Protection Plan</p>
                        <p className="font-medium text-gray-900">
                          {insuranceOptions.find(opt => opt.id === selectedInsurance)?.name}
                        </p>
                      </div>
                    )}

                    <div className="border-t pt-4 bg-emerald-50 -mx-6 px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-emerald-800">
                        <span>✓</span>
                        <span>Unlimited Mileage</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-800 mt-1">
                        <span>✓</span>
                        <span>Free Cancellation (24h)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-sky-600 text-lg">ℹ️</span>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Need Help?</p>
                      <p className="text-gray-600">Contact our support team 24/7</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Get Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
