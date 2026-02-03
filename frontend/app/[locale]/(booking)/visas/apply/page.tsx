'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Stepper } from '@/components/ui/Stepper';
import { Badge } from '@/components/ui/Badge';

export default function VisaApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const steps = [
    { label: 'Personal Information', completed: currentStep > 1, current: currentStep === 1 },
    { label: 'Travel Details', completed: currentStep > 2, current: currentStep === 2 },
    { label: 'Documents Upload', completed: currentStep > 3, current: currentStep === 3 },
    { label: 'Review & Payment', completed: false, current: currentStep === 4 },
  ];

  const visaDetails = {
    country: 'United States',
    type: 'Tourist Visa (B-2)',
    processingTime: '7-15 business days',
    validity: '10 years',
    fee: 160,
    serviceFee: 35,
  };

  const requiredDocuments = [
    { id: 'passport', name: 'Valid Passport', required: true, description: 'Must be valid for at least 6 months beyond stay' },
    { id: 'photo', name: 'Passport Photo', required: true, description: '2x2 inches, white background' },
    { id: 'itinerary', name: 'Travel Itinerary', required: true, description: 'Flight bookings and accommodation' },
    { id: 'financial', name: 'Financial Proof', required: true, description: 'Bank statements (last 3 months)' },
    { id: 'employment', name: 'Employment Letter', required: false, description: 'Letter from employer (if employed)' },
    { id: 'invitation', name: 'Invitation Letter', required: false, description: 'If visiting family/friends' },
  ];

  const handleDocumentUpload = (docId: string) => {
    setUploadedDocuments((prev) => [...prev, docId]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/visas" className="hover:text-sky-600">Visas</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Apply for Visa</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visa Info */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Visa Application: {visaDetails.country}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{visaDetails.type}</Badge>
                      <span className="text-sm text-gray-600">Processing: {visaDetails.processingTime}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stepper */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <Stepper steps={steps} />
              </CardContent>
            </Card>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="First Name (as per passport)" placeholder="John" required />
                      <Input label="Last Name (as per passport)" placeholder="Doe" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Middle Name (if any)" placeholder="Michael" />
                      <Input label="Date of Birth" type="date" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Gender"
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                        ]}
                        required
                      />
                      <Select
                        label="Nationality"
                        options={[
                          { value: 'us', label: 'United States' },
                          { value: 'uk', label: 'United Kingdom' },
                          { value: 'ca', label: 'Canada' },
                        ]}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Passport Number" placeholder="ABC123456" required />
                      <Input label="Passport Expiry Date" type="date" required />
                    </div>

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      helperText="We'll send updates to this email"
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      required
                    />

                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setCurrentStep(2)}
                      >
                        Continue to Travel Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Travel Details */}
            {currentStep === 2 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Travel Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Select
                      label="Purpose of Visit"
                      options={[
                        { value: 'tourism', label: 'Tourism' },
                        { value: 'business', label: 'Business' },
                        { value: 'family', label: 'Visiting Family/Friends' },
                        { value: 'education', label: 'Education' },
                        { value: 'medical', label: 'Medical Treatment' },
                      ]}
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Intended Arrival Date" type="date" required />
                      <Input label="Intended Departure Date" type="date" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Port of Entry" placeholder="JFK International Airport" required />
                      <Input label="Port of Exit" placeholder="JFK International Airport" />
                    </div>

                    <Input
                      label="Accommodation Address"
                      placeholder="Hotel name and address"
                      required
                    />

                    <TextArea
                      label="Detailed Travel Plan"
                      placeholder="Describe your planned activities during your stay..."
                      rows={4}
                      helperText="Provide as much detail as possible"
                    />

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Employment Information</h4>
                      <div className="space-y-4">
                        <Select
                          label="Employment Status"
                          options={[
                            { value: 'employed', label: 'Employed' },
                            { value: 'self-employed', label: 'Self-Employed' },
                            { value: 'student', label: 'Student' },
                            { value: 'retired', label: 'Retired' },
                            { value: 'unemployed', label: 'Unemployed' },
                          ]}
                          required
                        />
                        <Input label="Employer Name" placeholder="Company name" />
                        <Input label="Job Title" placeholder="Software Engineer" />
                        <Input label="Monthly Income" type="number" placeholder="5000" />
                      </div>
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
                        Continue to Documents
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Required Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-amber-900">
                        <span className="font-semibold">Important:</span> All documents must be in PDF or JPG format. 
                        File size limit: 5MB per document.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {requiredDocuments.map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                                {doc.required && (
                                  <Badge variant="danger" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{doc.description}</p>
                            </div>
                            {uploadedDocuments.includes(doc.id) ? (
                              <Badge variant="success">✓ Uploaded</Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentUpload(doc.id)}
                              >
                                Upload
                              </Button>
                            )}
                          </div>
                          {uploadedDocuments.includes(doc.id) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                              <span>📄</span>
                              <span>document_{doc.id}.pdf</span>
                              <button className="ml-auto text-rose-600 hover:text-rose-700">
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Photo Requirements</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Dimensions: 2 x 2 inches (51 x 51 mm)</li>
                        <li>• White or off-white background</li>
                        <li>• Taken within the last 6 months</li>
                        <li>• Neutral facial expression, both eyes open</li>
                        <li>• No glasses or headwear (unless for religious purposes)</li>
                      </ul>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep(2)}
                      >
                        ← Back
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setCurrentStep(4)}
                        className="flex-1"
                        disabled={uploadedDocuments.length < 4}
                      >
                        Continue to Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Payment */}
            {currentStep === 4 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Review Your Application</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Full Name:</span>
                            <span className="ml-2 font-medium">John Doe</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date of Birth:</span>
                            <span className="ml-2 font-medium">01/15/1990</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Passport No:</span>
                            <span className="ml-2 font-medium">ABC123456</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Nationality:</span>
                            <span className="ml-2 font-medium">United States</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Travel Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Purpose:</span>
                            <span className="ml-2 font-medium">Tourism</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="ml-2 font-medium">14 days</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Arrival:</span>
                            <span className="ml-2 font-medium">March 15, 2026</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Departure:</span>
                            <span className="ml-2 font-medium">March 29, 2026</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2 text-sm">
                          {uploadedDocuments.map((docId) => (
                            <div key={docId} className="flex items-center gap-2">
                              <span className="text-emerald-600">✓</span>
                              <span className="text-gray-700">
                                {requiredDocuments.find((d) => d.id === docId)?.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Checkbox
                        id="accuracy"
                        label="I confirm that all information provided is accurate and complete"
                        required
                      />
                      <Checkbox
                        id="terms"
                        label="I agree to the visa application terms and conditions"
                        required
                      />
                      <Checkbox
                        id="embassy"
                        label="I understand that the final decision rests with the embassy/consulate"
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep(3)}
                      >
                        ← Back
                      </Button>
                      <Link href="/visas/payment" className="flex-1">
                        <Button variant="primary" size="lg" fullWidth>
                          Proceed to Payment
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Application Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Application Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Destination</p>
                      <p className="font-medium text-gray-900">{visaDetails.country}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-1">Visa Type</p>
                      <p className="font-medium text-gray-900">{visaDetails.type}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-1">Processing Time</p>
                      <p className="font-medium text-gray-900">{visaDetails.processingTime}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-1">Validity</p>
                      <p className="font-medium text-gray-900">{visaDetails.validity}</p>
                    </div>

                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visa Fee</span>
                        <span className="font-medium">${visaDetails.fee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-medium">${visaDetails.serviceFee}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ${visaDetails.fee + visaDetails.serviceFee}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-sky-600">ℹ️</span>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Processing Guarantee</p>
                        <p className="text-gray-600">We'll submit your application within 24 hours</p>
                      </div>
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
