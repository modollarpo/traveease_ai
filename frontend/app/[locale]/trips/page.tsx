'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { puffyTap, fadeInUp, staggerContainer } from '@/lib/motion';
import { ConciergeAgentWidget } from '@/components/trips/ConciergeAgentWidget';
import { useState } from 'react';

// Load Mapbox only in the browser.
const MapboxMap = dynamic(() => import('@/components/trips/TripMap'), {
  ssr: false,
});

const sampleTrip = {
  id: 'trip-1',
  route: 'Lagos → Nairobi → Maasai Mara',
  days: 5,
  segments: [
    { label: 'Flight', detail: 'LOS → NBO · 5h 40m', time: '08:25' },
    { label: 'Transfer', detail: 'SUV to hotel · 45m', time: '14:30' },
    { label: 'Experience', detail: 'Sunset safari drive', time: '17:00' },
  ],
};

export default function MyTripsPage() {
  const [visaStatus, setVisaStatus] = useState<string | null>(null);

  const handleVisaCheck = async () => {
    try {
      setVisaStatus('Checking visa eligibility…');
      const res = await fetch('/api/visas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'eligibility',
          payload: {
            citizenCountry: 'NG',
            destinationCountry: 'KE',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Visa check failed');
      }
      setVisaStatus(
        data.eligible
          ? `Eligible: ${data.visa_type} · est. ${data.processing_time_days} days`
          : 'Visa may be required; additional checks needed.',
      );
    } catch (e: any) {
      setVisaStatus(e?.message ?? 'Unable to check visas right now.');
    }
  };

  return (
    <div className="app-container py-8 pb-20 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ghost-white/60">
          The Concierge Vault
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ghost-white">
          Your live trips & real-time rebooking.
        </h1>
        <p className="max-w-2xl text-sm md:text-base text-ghost-white/80">
          Every flight, transfer, and local experience lives in a single, living
          itinerary. When reality shifts, your agentic concierge reshapes the day.
        </p>
      </header>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start"
      >
        <motion.div variants={fadeInUp} className="space-y-4">
          <Card className="glass-panel border-white/10 h-[420px]">
            <CardContent className="h-full p-0 overflow-hidden">
              <MapboxMap />
            </CardContent>
          </Card>

          <Card className="glass-soft border-white/10">
            <CardContent className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-neo-mint/80">
                  Todays flow
                </p>
                <p className="text-sm md:text-base font-semibold text-ghost-white">
                  {sampleTrip.route}
                </p>
                <p className="text-[11px] text-ghost-white/70">
                  Day 2 of {sampleTrip.days}. The concierge keeps transfers and
                  experiences in sync with live flight status.
                </p>
              </div>
              <motion.div {...puffyTap}>
                <Button variant="primary" size="sm" className="gummy-button bg-neo-mint text-traveease-blue hover:bg-neo-mint/90">
                  Export branded itinerary PDF
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <Card className="glass-soft border-white/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ghost-white/60">
                    Digital boarding passes
                  </p>
                  <p className="text-sm font-semibold text-ghost-white">
                    Designed for touch, optimised for mobile.
                  </p>
                </div>
                <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] text-ghost-white/80">
                  Tilt or drag to feel the card
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {[0, 1].map((idx) => (
                  <motion.div
                    key={idx}
                    className="relative rounded-3xl bg-gradient-to-br from-traveease-blue via-slate-900 to-black p-4 text-ghost-white shadow-gummy"
                    initial={{ rotateX: 12, rotateY: -8, y: 4, scale: 0.98 }}
                    whileHover={{ rotateX: 4, rotateY: 4, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                  >
                    <div className="flex items-center justify-between text-[11px] text-ghost-white/80">
                      <span>TRV-EASE</span>
                      <span>Boarding pass</span>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold leading-none">LOS</p>
                        <p className="text-[11px] text-ghost-white/70">Lagos</p>
                      </div>
                      <div className="flex-1 text-center text-xs text-ghost-white/70">
                        <p>Nonstop • Seat 12A</p>
                        <p>Gate C4 • Group 2</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold leading-none">NBO</p>
                        <p className="text-[11px] text-ghost-white/70">Nairobi</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-ghost-white/70">
                      <span>Depart 08:25</span>
                      <span>Arrive 14:05</span>
                      <span>PNR TRV123</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-soft border-white/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ghost-white/60">
                    Visa & compliance
                  </p>
                  <p className="text-sm font-semibold text-ghost-white">
                    Keep passports, visas & NDPR in one flow.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-ghost-white/70">
                For this Lagos → Nairobi safari, we pre-check if a Nigerian
                passport holder needs a visa and estimate processing time
                before you lock in flights.
              </p>
              <div className="flex items-center justify-between gap-3">
                <motion.div {...puffyTap}>
                  <Button
                    size="sm"
                    variant="primary"
                    className="gummy-button bg-neo-mint text-traveease-blue hover:bg-neo-mint/90"
                    onClick={handleVisaCheck}
                  >
                    Check visa for this trip
                  </Button>
                </motion.div>
                <p className="text-[10px] text-ghost-white/60">
                  Powered by VisaService · NDPR-masked passport data.
                </p>
              </div>
              {visaStatus && (
                <p className="text-[11px] text-neo-mint">
                  {visaStatus}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      <ConciergeAgentWidget />
    </div>
  );
}
