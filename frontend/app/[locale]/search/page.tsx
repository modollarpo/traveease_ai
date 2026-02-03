'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatMultiCurrency } from '@/lib/money';
import { fadeInUp, staggerContainer } from '@/lib/motion';

const fxMock = {
  'USD_NGN': 1600,
  'USD_EUR': 0.9,
  'NGN_USD': 1 / 1600,
  'NGN_EUR': 0.9 / 1600,
  'EUR_USD': 1.1,
  'EUR_NGN': 1.1 * 1600,
};

const flights = [
  {
    id: 'trip-1',
    from: 'Lagos',
    to: 'Nairobi',
    provider: 'Amadeus',
    partner: 'Local African carrier',
    duration: '5h 40m',
    stops: 1,
    baseMinor: 85000, // USD 850.00
    savings: 0.18,
  },
  {
    id: 'trip-2',
    from: 'Lagos',
    to: 'Nairobi',
    provider: 'Wakanow',
    partner: 'Major alliance carrier',
    duration: '7h 10m',
    stops: 2,
    baseMinor: 92000,
    savings: 0.1,
  },
];

const cars = [
  {
    id: 'car-1',
    vendor: 'Treepz',
    name: 'Toyota Land Cruiser',
    image:
      'https://images.unsplash.com/photo-1511391037251-0c2790fbcc88?auto=format&fit=crop&w=800&q=80',
    pickup: 'Nairobi Jomo Kenyatta Intl.',
    includesDriver: true,
    baseMinor: 22000,
  },
  {
    id: 'car-2',
    vendor: 'Local SUV Partner',
    name: 'Range Rover Sport',
    image:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    pickup: 'Nairobi Wilson Airport',
    includesDriver: false,
    baseMinor: 28000,
  },
];

const experiences = [
  {
    id: 'xp-1',
    title: 'Sunrise Hot-Air Balloon over Maasai Mara',
    provider: 'Viator / Local DMC',
    vibeScore: 0.98,
    baseMinor: 45000,
  },
  {
    id: 'xp-2',
    title: 'Private Maasai cultural immersion & drumming night',
    provider: 'Curated local collective',
    vibeScore: 0.94,
    baseMinor: 27000,
  },
];

export default function SearchResultsPage() {
  const baseCurrency: 'USD' = 'USD';

  return (
    <div className="app-container py-10 space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ghost-white/60">
          Whole trip intelligence
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ghost-white">
          Lagos → Nairobi • 5 days in East Africa
        </h1>
        <p className="max-w-2xl text-sm md:text-base text-ghost-white/80">
          Instead of a long list, you get a trip canvas: flights, cars, and
          local experiences scored together by savings, reliability, and vibe.
        </p>
      </header>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-5 lg:grid-cols-3 auto-rows-[minmax(0,1fr)]"
      >
        {/* Slot 1: Flights (large) */}
        <motion.div
          variants={fadeInUp}
          className="lg:col-span-2 lg:row-span-2 flex flex-col gap-4"
        >
          <Card className="glass-panel border-white/10 h-full flex flex-col">
            <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neo-mint/70">
                    Flight intelligence
                  </p>
                  <h2 className="text-lg md:text-xl font-semibold text-ghost-white">
                    Amadeus × Wakanow • AI-ranked options
                  </h2>
                </div>
                <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] text-ghost-white/80">
                  AI-predicted savings vs. direct OTA
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {flights.map((f) => {
                  const prices = formatMultiCurrency(f.baseMinor, baseCurrency, fxMock);
                  return (
                    <div
                      key={f.id}
                      className="flex flex-col gap-2 rounded-2xl bg-black/40 p-3 ring-1 ring-white/10"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="text-xs text-ghost-white/70">
                            {f.from} → {f.to}
                          </p>
                          <p className="text-sm font-medium text-ghost-white">
                            {f.provider} · {f.partner}
                          </p>
                        </div>
                        <div className="text-right text-[11px] text-neo-mint">
                          <p className="font-semibold">
                            {(f.savings * 100).toFixed(0)}% predicted savings
                          </p>
                          <p className="text-ghost-white/60">vs. median route</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div className="flex items-center gap-3 text-[11px] text-ghost-white/70">
                          <span>{f.duration}</span>
                          <span className="h-1 w-1 rounded-full bg-ghost-white/40" />
                          <span>{f.stops === 0 ? 'Nonstop' : `${f.stops} stop(s)`}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {prices.map((p) => (
                            <span
                              key={p.code}
                              className="rounded-full bg-black/60 px-2 py-1 text-ghost-white/80"
                            >
                              {p.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-ghost-white/60">
                <p>
                  Rationale badges explain carbon impact, rebooking flexibility, and
                  safety scores for each route.
                </p>
                <Link href="/docs/rationale" className="underline-offset-2 hover:underline">
                  How we score options
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Slot 2: Cars (medium) */}
        <motion.div variants={fadeInUp} className="flex flex-col">
          <Card className="glass-panel border-white/10 h-full flex flex-col">
            <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-heritage-clay/80">
                    Ground mobility
                  </p>
                  <h2 className="text-base md:text-lg font-semibold text-ghost-white">
                    SUVs with document pre-verification
                  </h2>
                </div>
                <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] text-ghost-white/80">
                  Licences & insurance checked
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {cars.map((car) => {
                  const prices = formatMultiCurrency(car.baseMinor, baseCurrency, fxMock);
                  return (
                    <div
                      key={car.id}
                      className="overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10"
                    >
                      <div className="relative h-32 w-full overflow-hidden">
                        <img
                          src={car.image}
                          alt={car.name}
                          className="h-full w-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      </div>
                      <div className="space-y-2 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] text-ghost-white/70">{car.vendor}</p>
                            <p className="text-sm font-medium text-ghost-white">{car.name}</p>
                          </div>
                          <div className="flex flex-col items-end text-[10px] text-ghost-white/70">
                            <span className="rounded-full bg-black/40 px-2 py-0.5">
                              {car.includesDriver ? 'With driver' : 'Self-drive'}
                            </span>
                            <span className="mt-1 max-w-[140px] text-right">
                              Pickup: {car.pickup}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1 text-ghost-white/70">
                            <span>Upload licence & insurance</span>
                            <span className="h-1 w-1 rounded-full bg-neo-mint" />
                            <span>Pre-verified before you land</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {prices.map((p) => (
                              <span
                                key={p.code}
                                className="rounded-full bg-black/60 px-2 py-1 text-ghost-white/80"
                              >
                                {p.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button variant="outline" size="sm" className="mt-1 border-neo-mint/60 text-neo-mint hover:bg-neo-mint/10">
                Connect your mobility vendors
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Slot 3: Hidden gems (vertical) */}
        <motion.div variants={fadeInUp} className="flex flex-col">
          <Card className="glass-panel border-white/10 h-full flex flex-col">
            <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neo-mint/80">
                    Hidden gems
                  </p>
                  <h2 className="text-base md:text-lg font-semibold text-ghost-white">
                    Curated by vibe, not just stars
                  </h2>
                </div>
                <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] text-ghost-white/80">
                  Viator + local DMC graph
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {experiences.map((xp) => {
                  const prices = formatMultiCurrency(xp.baseMinor, baseCurrency, fxMock);
                  return (
                    <div
                      key={xp.id}
                      className="rounded-2xl bg-black/40 p-3 ring-1 ring-white/10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-ghost-white">{xp.title}</p>
                          <p className="text-[11px] text-ghost-white/60">{xp.provider}</p>
                        </div>
                        <div className="text-right text-[11px] text-neo-mint">
                          <p className="font-semibold">
                            {(xp.vibeScore * 100).toFixed(0)}% match
                          </p>
                          <p className="text-ghost-white/60">for your vibe</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1 text-ghost-white/70">
                          <span>Low crowd score</span>
                          <span className="h-1 w-1 rounded-full bg-neo-mint" />
                          <span>Verified local host</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prices.map((p) => (
                            <span
                              key={p.code}
                              className="rounded-full bg-black/60 px-2 py-1 text-ghost-white/80"
                            >
                              {p.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="pt-1 text-[11px] text-ghost-white/60">
                Confidence scores are tuned on African travel patterns, seasonality,
                and your groups past trips.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>
    </div>
  );
}
