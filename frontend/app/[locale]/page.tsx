'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AtriumHero } from '@/components/home/AtriumHero';

export default function HomePage() {

  const destinations = [
    {
      name: 'Paris',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=500&fit=crop',
      price: 'From $899',
      description: 'City of lights and romance',
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1540959375944-7049f642e9a1?w=400&h=500&fit=crop',
      price: 'From $1,299',
      description: 'Modern metropolis meets tradition',
    },
    {
      name: 'Dubai',
      country: 'UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=500&fit=crop',
      price: 'From $799',
      description: 'Luxury and desert adventures',
    },
    {
      name: 'New York',
      country: 'USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=500&fit=crop',
      price: 'From $699',
      description: 'The city that never sleeps',
    },
  ];

  return (
    <div className="app-container space-y-16">
      <AtriumHero />

      {/* Destinations & marketplace */}
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Instant global inventory.</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Curated routes from Amadeus, local DMCs, and on-ground partners.
              </p>
            </div>
            <Button variant="ghost" className="hidden sm:inline-flex text-xs">
              View all destinations
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {destinations.map((dest) => (
              <Card
                key={dest.name}
                variant="default"
                interactive
                className="overflow-hidden bg-background/40 border-border/60"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="h-40 w-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/80">
                      <span className="font-medium">{dest.price}</span>
                      <span className="rounded-full bg-black/40 px-2 py-0.5">
                        {dest.country}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">{dest.name}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{dest.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card variant="default" className="glass-panel border-border/60">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Marketplace snapshot
            </p>
            <h3 className="text-lg font-semibold text-foreground">
              One checkout, many vendors.
            </h3>
            <p className="text-sm text-muted-foreground">
              Split a single payment across flights, hotels, tours, and cars in
              one click. Traveease stays merchant-of-record while vendors get
              paid out in their local currencies.
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Stripe Connect, PayPal, Flutterwave, Paystack orchestrated by region</li>
              <li>• Support for BNPL (Klarna, Afterpay, PayPal Pay Later)</li>
              <li>• Full bitemporal audit trail for every split and refund</li>
            </ul>
            <Link href="/marketplace">
              <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
                Explore marketplace API
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Enterprise pillars */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Built for enterprise-grade travel.</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              From price locks to refunds, every step is modeled in a Saga.
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            All flows enforce atomic inventory holds before capture, full
            idempotency on webhooks, and replay-safe reconciliation.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card variant="default" className="glass-panel border-border/60">
            <CardContent className="space-y-3 p-5">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-lg">
                🤖
              </div>
              <h3 className="text-base font-semibold text-foreground">Agentic concierge</h3>
              <p className="text-sm text-muted-foreground">
                LangGraph agents watch every trip, track price drops, and
                propose rebooking paths that respect corporate rules.
              </p>
            </CardContent>
          </Card>
          <Card variant="default" className="glass-panel border-border/60">
            <CardContent className="space-y-3 p-5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-lg">
                💸
              </div>
              <h3 className="text-base font-semibold text-foreground">Financial orchestration</h3>
              <p className="text-sm text-muted-foreground">
                BigInt ledgers, mid-market FX at auth time, and region-aware
                routing through global and local gateways.
              </p>
            </CardContent>
          </Card>
          <Card variant="default" className="glass-panel border-border/60">
            <CardContent className="space-y-3 p-5">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-lg">
                🛡️
              </div>
              <h3 className="text-base font-semibold text-foreground">Compliance by design</h3>
              <p className="text-sm text-muted-foreground">
                GDPR/NDPR masking, PCI-friendly logs, and full audit views for
                finance and risk teams.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to action */}
      <section className="glass-panel border-primary/40 bg-primary/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Ready to launch your next market?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              Spin up a branded travel experience with unified checkout,
              localized payouts, and multilingual ledgers in weeks, not months.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Create an account
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="border-primary/40 text-primary hover:bg-primary/10">
                View developer docs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
