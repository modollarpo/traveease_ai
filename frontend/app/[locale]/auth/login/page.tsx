import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <div className="app-container flex min-h-[70vh] items-center justify-center py-10">
      <Card className="glass-panel max-w-md w-full border-white/12">
        <CardContent className="space-y-6 p-6 md:p-8">
          <header className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-ghost-white/60">
              Access Traveease
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-ghost-white">
              Sign in to your workspace
            </h1>
            <p className="text-xs md:text-sm text-ghost-white/75">
              Use your email or SSO provider to manage trips, vendors, and ledgers.
            </p>
          </header>

          <form className="space-y-4">
            <div className="space-y-1 text-xs text-ghost-white/80">
              <label htmlFor="email" className="block">Work email</label>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-ghost-white placeholder:text-ghost-white/45 focus:border-neo-mint focus:outline-none"
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-1 text-xs text-ghost-white/80">
              <label htmlFor="password" className="block">Password</label>
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-ghost-white placeholder:text-ghost-white/45 focus:border-neo-mint focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full gummy-button bg-neo-mint text-traveease-blue hover:bg-neo-mint/90"
            >
              Continue
            </Button>
          </form>

          <p className="text-[11px] text-ghost-white/70">
            No workspace yet?{' '}
            <Link href="/signup" className="underline-offset-2 hover:underline">
              Talk to sales
            </Link>
            {' '}about launching Traveease for your market.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
