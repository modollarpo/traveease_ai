import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import "../globals.css";

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

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const isValidLocale = locales.includes(params.locale);
  if (!isValidLocale) {
    notFound();
  }

  return (
    <html lang={params.locale}>
      <body>{children}</body>
    </html>
  );
}
