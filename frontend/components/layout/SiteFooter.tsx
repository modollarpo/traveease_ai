export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80">
      <div className="app-container grid gap-10 py-10 md:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">About Traveease</h3>
          <p className="text-sm text-slate-400">
            An AI-native global travel operating system for flights, stays, mobility, and experiences across 150+ countries.
          </p>
          <p className="text-xs text-slate-500">
            Merchant of record for localized transport and curated experiences worldwide.
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Product</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>AI Trip Concierge</li>
            <li>Global Flight Engine</li>
            <li>Hotels & Shortlets</li>
            <li>Cars & Local Mobility</li>
            <li>Tours & Experiences Marketplace</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">For Business</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>Corporate Travel OS</li>
            <li>Vendor Portal</li>
            <li>Payment Orchestration</li>
            <li>Financial Ledger & Audit</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Compliance</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>GDPR / NDPR</li>
            <li>PCI-DSS Ready</li>
            <li>24/7 Global Support</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800/80 py-4">
        <div className="app-container flex flex-col items-center justify-between gap-3 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Traveease. All rights reserved.</p>
          <p>Settlement SLA: payments &lt;15s • bookings &lt;30s</p>
        </div>
      </div>
    </footer>
  );
}
