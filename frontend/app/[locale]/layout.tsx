import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import "../globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Traveease - AI Travel Marketplace",
  description: "Plan your perfect trip with AI-powered recommendations",
};

const locales = [
  "en",    // English
  "es",    // Spanish
  "fr",    // French
  "de",    // German
  "pt",    // Portuguese
  "ar",    // Arabic
  "zh",    // Simplified Chinese
  "ja",    // Japanese
  "ko",    // Korean
  "ru",    // Russian
  "it",    // Italian
  "nl",    // Dutch
  "yo",    // Yoruba (Nigerian)
  "ha",    // Hausa (Nigerian/West African)
  "sw",    // Swahili (East African)
];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const isValidLocale = locales.includes(locale);
  if (!isValidLocale) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className="antialiased">
        <div className="app-shell">
          <SiteHeader />
          <main className="app-main">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
