import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="app-container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-400/60">
            <span className="text-xl">✈️</span>
          </div>
          <div className="leading-tight">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight text-slate-50">Traveease</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300 border border-emerald-500/40">
                AI Travel OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Global multi-vendor travel marketplace</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-200/80 md:flex">
          <Link href="/en/flights" className="hover:text-sky-300 transition-colors">Flights</Link>
          <Link href="/en/hotels" className="hover:text-sky-300 transition-colors">Hotels</Link>
          <Link href="/en/cars" className="hover:text-sky-300 transition-colors">Cars</Link>
          <Link href="/en/tours" className="hover:text-sky-300 transition-colors">Tours & Experiences</Link>
          <Link href="/en/dashboard" className="hover:text-sky-300 transition-colors">Trips</Link>
          <Link href="/en/vendor" className="hover:text-sky-300 transition-colors">For Vendors</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-full border border-slate-700/70 px-3 py-1.5 text-xs font-medium text-slate-200/80 hover:border-slate-500 hover:text-slate-50 md:inline-flex">
            🌍 EN • USD
          </button>
          <Link href="/en/auth/login">
            <Button variant="ghost" size="sm" className="hidden text-slate-100 md:inline-flex">
              Sign in
            </Button>
          </Link>
          <Link href="/en/booking">
            <Button size="sm" className="shadow-lg shadow-sky-500/40">
              Book a trip
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
