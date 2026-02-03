'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Toast } from '@/components/ui/Toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'traveler',
    agreeToTerms: false,
    subscribeNewsletter: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
        }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/verification-sent';
      }, 2000);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Traveease</h1>
          <p className="text-gray-600 mt-2">Join millions of travelers worldwide</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600 text-sm mb-8">Start booking amazing trips in minutes</p>

          {/* Error Toast */}
          {errors.submit && (
            <Toast
              type="error"
              message={errors.submit}
              onClose={() => setErrors({ ...errors, submit: '' })}
              duration={5000}
            />
          )}

          {/* Success Toast */}
          {success && (
            <Toast
              type="success"
              message="Account created! Redirecting..."
              duration={2000}
            />
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="traveler">Traveler</option>
                <option value="vendor">Travel Vendor</option>
                <option value="agent">Travel Agent</option>
              </select>
            </div>

            {/* Password */}
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText="At least 8 characters with uppercase, numbers, and symbols"
              required
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            {/* Terms Checkbox */}
            <Checkbox
              label="I agree to Terms of Service and Privacy Policy"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            {errors.agreeToTerms && (
              <p className="text-sm text-rose-600">{errors.agreeToTerms}</p>
            )}

            {/* Newsletter Checkbox */}
            <Checkbox
              label="Send me exclusive deals and travel tips"
              description="We'll email you about special offers and new features"
              name="subscribeNewsletter"
              checked={formData.subscribeNewsletter}
              onChange={handleChange}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              size="lg"
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-8">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs mt-6">
          <p>
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="hover:text-sky-600 transition-colors">
              Terms of Service
            </Link>
            {' and '}
            <Link href="/privacy" className="hover:text-sky-600 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
