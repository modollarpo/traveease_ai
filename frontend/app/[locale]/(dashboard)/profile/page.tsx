'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    nationality: 'US',
    dateOfBirth: '1990-01-15',
    passportNumber: 'ABC123456',
    passportExpiry: '2032-01-15',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    {
      label: 'Personal Info',
      value: 'personal',
      icon: '👤',
      content: (
        <div className="space-y-6">
          <Card variant="default">
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />

                <Select
                  label="Nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  options={[
                    { value: 'US', label: '🇺🇸 United States' },
                    { value: 'UK', label: '🇬🇧 United Kingdom' },
                    { value: 'CA', label: '🇨🇦 Canada' },
                    { value: 'AU', label: '🇦🇺 Australia' },
                  ]}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                isLoading={isSaving}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      ),
    },
    {
      label: 'Travel Documents',
      value: 'documents',
      icon: '📄',
      content: (
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Passport Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Input
                label="Passport Number"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
              />

              <Input
                label="Passport Expiry Date"
                type="date"
                name="passportExpiry"
                value={formData.passportExpiry}
                onChange={handleChange}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Your passport expires in{' '}
                  <span className="font-semibold">6 years 11 months</span> on Jan 15, 2032.
                  Valid for most international travel.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      ),
    },
    {
      label: 'Address',
      value: 'address',
      icon: '📍',
      content: (
        <div className="space-y-6">
          <Card variant="default">
            <CardContent className="pt-6 space-y-5">
              <Input
                label="Street Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
                <Input
                  label="State/Province"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Zip/Postal Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
                <Select
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  options={[
                    { value: 'US', label: 'United States' },
                    { value: 'CA', label: 'Canada' },
                    { value: 'UK', label: 'United Kingdom' },
                  ]}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      ),
    },
    {
      label: 'Security',
      value: 'security',
      icon: '🔒',
      content: (
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Last changed 3 months ago</p>
                <Button variant="outline" fullWidth>
                  Change Password
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-800">Enabled</p>
                    <p className="text-xs text-green-700">via Authenticator App</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Connected Devices
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        MacBook Pro
                      </p>
                      <p className="text-xs text-gray-600">
                        Last active: Today at 10:30 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        iPhone 15
                      </p>
                      <p className="text-xs text-gray-600">
                        Last active: Yesterday at 4:15 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-sky-200"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{formData.email}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant="success">Email Verified</Badge>
              <Badge variant="info">Pro Member</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="md">
          Change Photo
        </Button>
      </div>

      {/* Success Toast */}
      {saveSuccess && (
        <Toast
          type="success"
          message="Changes saved successfully!"
          duration={3000}
        />
      )}

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        defaultValue="personal"
        onChange={setActiveTab}
      />
    </div>
  );
}
