import { setRequestLocale } from 'next-intl/server';
import { ContextAwareSearchBar } from '@/components/search-bar';
import { BentoGrid } from '@/components/bento-grid';
import { CheckoutSummary } from '@/components/checkout-summary';

export default function Home({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <ContextAwareSearchBar />
        <BentoGrid />
        
        <div className="mt-16 flex justify-center">
          <CheckoutSummary 
            basePrice={100000}
            stampDuty={5000}
            vat={7875}
            currency="₦"
          />
        </div>
      </div>
    </main>
  );
}
