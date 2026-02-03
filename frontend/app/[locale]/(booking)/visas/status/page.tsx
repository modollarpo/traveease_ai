'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function VisaStatusPage() {
  const application = {
    reference: 'VISA-US-2024-78901',
    country: 'United States',
    type: 'Tourist Visa (B-2)',
    applicant: 'John Doe',
    submittedDate: 'February 15, 2026',
    currentStatus: 'Under Review',
    estimatedCompletion: 'March 1, 2026',
  };

  const timeline = [
    {
      status: 'Application Submitted',
      date: 'Feb 15, 2026 - 10:30 AM',
      completed: true,
      description: 'Your application has been received and is being processed.',
    },
    {
      status: 'Documents Verified',
      date: 'Feb 16, 2026 - 2:15 PM',
      completed: true,
      description: 'All required documents have been verified and accepted.',
    },
    {
      status: 'Under Embassy Review',
      date: 'Feb 18, 2026 - 9:00 AM',
      completed: true,
      description: 'Your application is currently being reviewed by the embassy.',
      current: true,
    },
    {
      status: 'Interview Scheduled',
      date: 'Pending',
      completed: false,
      description: 'Interview appointment will be scheduled if required.',
    },
    {
      status: 'Visa Decision',
      date: 'Est. Mar 1, 2026',
      completed: false,
      description: 'Final decision on your visa application.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Visa Application Status</h1>
          <p className="text-gray-600">Track the progress of your visa application</p>
        </div>

        {/* Application Summary */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Application Reference</p>
                  <p className="text-lg font-bold text-gray-900">{application.reference}</p>
                </div>
                <Badge variant="warning">{application.currentStatus}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div>
                  <p className="text-gray-600">Destination</p>
                  <p className="font-medium text-gray-900">{application.country}</p>
                </div>
                <div>
                  <p className="text-gray-600">Visa Type</p>
                  <p className="font-medium text-gray-900">{application.type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Applicant Name</p>
                  <p className="font-medium text-gray-900">{application.applicant}</p>
                </div>
                <div>
                  <p className="text-gray-600">Submitted On</p>
                  <p className="font-medium text-gray-900">{application.submittedDate}</p>
                </div>
              </div>

              <div className="border-t pt-4 bg-sky-50 -mx-6 px-6 py-4">
                <p className="text-sm text-sky-900">
                  <span className="font-semibold">Estimated Completion:</span> {application.estimatedCompletion}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-xs text-gray-600 pt-1">
                    {item.date}
                  </div>
                  <div className="flex-1 pb-6 border-l-2 border-gray-200 pl-6 relative">
                    <div
                      className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-4 border-white ${
                        item.completed
                          ? 'bg-emerald-600'
                          : item.current
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-gray-300'
                      }`}
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{item.status}</h4>
                      {item.current && <Badge variant="warning" className="text-xs">In Progress</Badge>}
                      {item.completed && <Badge variant="success" className="text-xs">✓ Completed</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Required (if any) */}
        <Card variant="default" className="mb-6 border-l-4 border-amber-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <span className="text-amber-600 text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Action May Be Required</h3>
                <p className="text-sm text-gray-600 mb-4">
                  The embassy may request an interview. We'll notify you immediately if this is required. 
                  Please ensure your phone and email are accessible.
                </p>
                <Button variant="outline" size="sm">
                  Update Contact Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg flex-shrink-0">1️⃣</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Embassy Review</p>
                  <p className="text-gray-600">
                    Your application is currently being reviewed. This typically takes 5-7 business days.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg flex-shrink-0">2️⃣</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Interview (If Required)</p>
                  <p className="text-gray-600">
                    Some applications may require an in-person interview. You'll receive an appointment email if needed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg flex-shrink-0">3️⃣</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Visa Decision</p>
                  <p className="text-gray-600">
                    You'll be notified of the decision by email. If approved, your visa will be processed for pickup/delivery.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-600 text-lg flex-shrink-0">4️⃣</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Passport Return</p>
                  <p className="text-gray-600">
                    Your passport with the visa stamp will be returned via courier or available for pickup.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button variant="primary" size="lg">
            📧 Email Status Update
          </Button>
          <Button variant="outline" size="lg">
            📱 Set Up SMS Alerts
          </Button>
          <Button variant="outline" size="lg">
            🖨️ Print Status Report
          </Button>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="lg">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Support Banner */}
        <div className="mt-8 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Questions About Your Application?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our visa specialists are available 24/7 to assist you
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="sm">
              💬 Live Chat
            </Button>
            <Button variant="outline" size="sm">
              📞 Call Support
            </Button>
            <Button variant="outline" size="sm">
              📧 Email Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
