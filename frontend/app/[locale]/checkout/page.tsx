'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { puffyTap, fadeInUp, staggerContainer } from '@/lib/motion';

export default function VaultCheckoutPage() {
  return (
    <div className="app-container py-10 pb-20 space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ghost-white/60">
          The Vault
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ghost-white">
          Private-banking grade checkout for marketplaces.
        </h1>
        <p className="max-w-2xl text-sm md:text-base text-ghost-white/80">
          One clean card field, one authorization, orchestrated payouts to every
          airline, hotel, guide, and DMC in your cart.
        </p>
      </header>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start"
      >
        <motion.div variants={fadeInUp} className="space-y-4">
          <Card className="glass-panel border-white/12">
            <CardContent className="p-5 md:p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ghost-white/60">
                    Card details
                  </p>
                  <p className="text-sm md:text-base font-semibold text-ghost-white">
                    Single-field card input powered by your PSP.
                  </p>
                </div>
                <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] text-ghost-white/80">
                  PCI scope minimised • NDPR aligned
                </span>
              </div>

              {/* Single-field card input shell */}
              <div className="space-y-3">
                <label className="text-[11px] font-medium text-ghost-white/80">
                  Card number · expiry · CVC · name (encrypted via Stripe Elements or equivalent)
                </label>
                <div className="rounded-2xl bg-black/40 p-3 ring-1 ring-white/12">
                  <div className="h-12 rounded-xl bg-slate-900/80 px-3 flex items-center text-[11px] text-slate-400">
                    {/* Placeholder for Stripe Elements-like single card element */}
                    <span>•••• •••• •••• 4242 · 12/28 · CVC · Adaeze Traveler</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 text-[11px] text-ghost-white/75">
                <div className="space-y-1">
                  <p className="font-semibold text-ghost-white/90">Gateway routing</p>
                  <p>
                    Stripe Connect / PayPal for global cards. Flutterwave / Paystack
                    when your IP or BIN indicates African corridors.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-ghost-white/90">Compliance & fees</p>
                  <p>
                    ₦50 CBN stamp duty applied automatically for NGN transactions
                    above ₦10,000. Passport and PNR data masked in all logs.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-ghost-white/80">
                <div className="space-y-0.5">
                  <p className="font-semibold">Total for this trip</p>
                  <p className="text-ghost-white/70">USD 1,500 · NGN 2,400,000 · EUR 1,350</p>
                  <p className="text-ghost-white/60">
                    Split across Airline ($1,000), Hotel ($300), Local Guide ($50) and
                    Traveease platform fee ($150).
                  </p>
                </div>
                <motion.div {...puffyTap}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="gummy-button bg-neo-mint text-traveease-blue hover:bg-neo-mint/90"
                  >
                    Authorise & secure all bookings
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <Card className="glass-soft border-white/10">
            <CardContent className="p-5 space-y-3 text-[11px] text-ghost-white/80">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ghost-white/60">
                How the Vault works
              </p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Traveease creates one marketplace checkout via the Vault API.</li>
                <li>
                  The PaymentGatewayOrchestrator picks Stripe / PayPal / Flutterwave /
                  Paystack based on IP, BIN and currency.
                </li>
                <li>
                  MarketplaceSplitService registers vendor splits: Airline $1,000 · Hotel
                  $300 · Local guide $50 · Platform $150.
                </li>
                <li>
                  Webhooks execute atomic transfers and ledger writes, keeping refunds
                  and partial cancellations fully reconcilable.
                </li>
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>
    </div>
  );
}
