import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export default function ArchitectureDocsPage() {
  return (
    <div className="app-container py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ghost-white/60">
          Architecture Blueprint
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ghost-white">
          Traveease · AI-native Travel Operating System
        </h1>
        <p className="max-w-2xl text-sm md:text-base text-ghost-white/80">
          High-level overview of how the Atrium, Curator, Vault and Concierge
          layers connect to payments, GDS, local mobility, and the ledger.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-soft border-white/10">
          <CardContent className="p-5 space-y-2 text-sm text-ghost-white/80">
            <h2 className="text-base font-semibold text-ghost-white">
              Frontend experience layers
            </h2>
            <ul className="list-disc list-inside space-y-1 text-[13px]">
              <li>Atrium: intent-driven NL search and agentic orchestration.</li>
              <li>Curator: Bento results canvas with multi-currency intelligence.</li>
              <li>Vault: private-banking style checkout over marketplace APIs.</li>
              <li>Concierge: live trips dashboard, map, and LangGraph agents.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-soft border-white/10">
          <CardContent className="p-5 space-y-2 text-sm text-ghost-white/80">
            <h2 className="text-base font-semibold text-ghost-white">
              Backend + ledger services
            </h2>
            <ul className="list-disc list-inside space-y-1 text-[13px]">
              <li>PaymentGatewayOrchestrator routes via Stripe / PayPal / Flutterwave / Paystack.</li>
              <li>MarketplaceSplitService manages multi-vendor charges and refunds.</li>
              <li>MarketplaceCheckoutService powers the Vault one-intent checkout.</li>
              <li>Ledger + FX tables store BigInt amounts and mid-market rates.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
