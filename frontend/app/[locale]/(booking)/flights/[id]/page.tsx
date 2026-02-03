'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Stepper } from '@/components/ui/Stepper';

export default function FlightBookingPage({ params }: { params: { id: string } }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [passengerData, setPassengerData] = useState([
    {
      id: 1,
      title: 'Mr.',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      email: '',
      phone: '',
    },
  ]);

  const [selectedServices, setSelectedServices] = useState({
    baggage: false,
    seatSelection: false,
    mealPreference: false,
    insurance: false,
  });

  const handlePassengerChange = (
    id: number,
    field: string,
    value: string
  ) => {
    setPassengerData((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const steps = [
    'Select Flight',
    'Passenger Info',
    'Add Services',
    'Review & Pay',
  ];

  const flight = {
    airline: 'Air France',
    departure: '08:00',
    arrival: '20:15',
    departureAirport: 'JFK',
    arrivalAirport: 'CDG',
    duration: '7h 15m',
    price: 1200,
    date: 'March 15, 2026',
  };

  const addOns = [
    {
      id: 'baggage',
      label: 'Extra Baggage (23kg)',
      price: 45,
      description: 'Add an extra checked baggage',
    },
    {
      id: 'seats',
      label: 'Seat Selection',
      price: 30,
      description: 'Choose your preferred seat',
    },
    {
      id: 'meals',
      label: 'Meal Preference',
      price: 0,
      description: 'Select dietary preferences',
    },
    {
      id: 'insurance',
      label: 'Travel Insurance',
      price: 35,
      description: 'Protect your trip',
    },
  ];

  const calculateTotal = () => {
    let total = flight.price;
    if (selectedServices.baggage) total += 45;
    if (selectedServices.seatSelection) total += 30;
    if (selectedServices.insurance) total += 35;
    return total;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Selected Flight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-sky-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Depart</p>
                      <p className="text-3xl font-bold text-gray-900">{flight.departure}</p>
                      <p className="text-sm text-gray-600 mt-2">{flight.departureAirport}</p>
                      <p className="text-xs text-gray-500">{flight.date}</p>
                    </div>

                    <div className="text-center">
                      <div className="relative h-1 bg-gray-300 rounded mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded w-1/2" />
                      </div>
                      <p className="font-semibold text-gray-900">
                        {flight.airline}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {flight.duration}
                      </p>
                      <Badge variant="success" size="sm" className="mt-2">
                        Non-stop
                      </Badge>
                    </div>

                    <div className="md:text-right">
                      <p className="text-sm text-gray-600 mb-1">Arrive</p>
                      <p className="text-3xl font-bold text-gray-900">{flight.arrival}</p>
                      <p className="text-sm text-gray-600 mt-2">{flight.arrivalAirport}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-lg font-semibold text-gray-900">
                  Price: <span className="text-sky-600">${flight.price}</span>
                </p>
              </CardFooter>
            </Card>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => setCurrentStep(1)}
            >
              Continue
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Passenger Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {passengerData.map((passenger, index) => (
                  <div
                    key={passenger.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <h3 className="font-semibold text-gray-900">
                      Passenger {index + 1}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Select
                        label="Title"
                        options={[
                          { value: 'Mr.', label: 'Mr.' },
                          { value: 'Ms.', label: 'Ms.' },
                          { value: 'Mrs.', label: 'Mrs.' },
                          { value: 'Dr.', label: 'Dr.' },
                        ]}
                        value={passenger.title}
                        onChange={(e) =>
                          handlePassengerChange(
                            passenger.id,
                            'title',
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label="First Name"
                        value={passenger.firstName}
                        onChange={(e) =>
                          handlePassengerChange(
                            passenger.id,
                            'firstName',
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label="Last Name"
                        value={passenger.lastName}
                        onChange={(e) =>
                          handlePassengerChange(
                            passenger.id,
                            'lastName',
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) =>
                          handlePassengerChange(
                            passenger.id,
                            'dateOfBirth',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Nationality"
                        value={passenger.nationality}
                        onChange={(e) =>
                          handlePassengerChange(
                            passenger.id,
                            'nationality',
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={passenger.email}
                        onChange={(e) =>
                          handlePassengerChange(
                            passenger.id,
                            'email',
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        value={passenger.phone}
                        onChange={(e) =>
                          handlePassengerChange(
                            passenger.id,
                            'phone',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => setCurrentStep(0)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => setCurrentStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Optional Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addOns.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-sky-50 transition-colors"
                  >
                    <div className="flex-1">
                      <Checkbox
                        label={addon.label}
                        description={addon.description}
                        checked={selectedServices[addon.id as keyof typeof selectedServices]}
                        onChange={(e) =>
                          setSelectedServices((prev) => ({
                            ...prev,
                            [addon.id]: e.target.checked,
                          }))
                        }
                      />
                    </div>
                    <p className="font-semibold text-gray-900 ml-4">
                      {addon.price === 0 ? 'Free' : `+$${addon.price}`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => setCurrentStep(3)}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      {flight.airline} Flight
                    </span>
                    <span className="font-semibold">${flight.price}</span>
                  </div>
                  {selectedServices.baggage && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Extra Baggage</span>
                      <span className="font-semibold">+$45</span>
                    </div>
                  )}
                  {selectedServices.seatSelection && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Seat Selection</span>
                      <span className="font-semibold">+$30</span>
                    </div>
                  )}
                  {selectedServices.insurance && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Travel Insurance</span>
                      <span className="font-semibold">+$35</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <span className="text-lg font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-sky-600">
                    ${calculateTotal()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border-2 border-sky-500 rounded-lg cursor-pointer bg-sky-50">
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Credit Card</p>
                      <p className="text-sm text-gray-600">
                        Visa, Mastercard, Amex
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-gray-300">
                    <input
                      type="radio"
                      name="payment"
                      className="w-4 h-4"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-600">
                        Fast and secure
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-gray-300">
                    <input
                      type="radio"
                      name="payment"
                      className="w-4 h-4"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        Apple Pay / Google Pay
                      </p>
                      <p className="text-sm text-gray-600">
                        One-click payment
                      </p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </Button>
              <Link href="/flights/confirmation" className="flex-1">
                <Button variant="primary" fullWidth size="lg">
                  Pay & Book
                </Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="mb-8">
          <Stepper
            steps={steps}
            currentStep={currentStep}
          />
        </div>

        {/* Content */}
        {renderStep()}
      </div>
    </div>
  );
}
