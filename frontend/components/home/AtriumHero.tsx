"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { puffyTap, fadeInUp, staggerContainer } from "@/lib/motion";

const AGENT_THOUGHTS = [
  "Checking Amadeus for best fare classes…",
  "Sourcing SUVs with Treepz & local partners…",
  "Scoring options by reliability & refund flexibility…",
];

const SEARCH_TABS = [
  {
    label: "Trips",
    value: "trips",
    icon: "✨",
  },
  {
    label: "Flights",
    value: "flights",
    icon: "✈️",
  },
  {
    label: "Stays",
    value: "🏨",
    icon: "🛏️",
  },
  {
    label: "Cars",
    value: "cars",
    icon: "🚗",
  },
];

export function AtriumHero() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trips");
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const locale = useLocale();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire this into the AI Concierge + unified search endpoint.
  };

  const copyByLocale: Record<string, { title: string; subtitle: string; inputLabel: string; inputPlaceholder: string; cta: string; disclaimer: string; docs: string }> = {
    en: {
      title: "Design your whole trip in one sentence.",
      subtitle:
        "Type how you actually travel – Traveease orchestrates flights, stays, cars, and local gems across Africa and beyond.",
      inputLabel: "Describe your ideal journey",
      inputPlaceholder:
        "Plan a 5-day luxury safari in Serengeti with an SUV and a stopover in Nairobi",
      cta: "Let the Concierge plan it",
      disclaimer:
        "We parse intent, lock inventory atomically, then orchestrate payments across vendors.",
      docs: "View architecture blueprint",
    },
    fr: {
      title: "Imaginez votre voyage en une phrase.",
      subtitle:
        "Décrivez votre envie, Traveease orchestre vols, séjours, voitures et expériences locales à travers l’Afrique et au-delà.",
      inputLabel: "Décrivez votre voyage idéal",
      inputPlaceholder:
        "Planifier un safari de 5 jours de luxe au Serengeti avec un SUV et une escale à Nairobi",
      cta: "Laisser le Concierge s’en charger",
      disclaimer:
        "Nous comprenons votre intention, sécurisons les stocks puis orchestrons les paiements entre les vendeurs.",
      docs: "Voir le blueprint d’architecture",
    },
    "ng-pidgin": {
      title: "Talk your waka for one line.",
      subtitle:
        "Yarn how you wan waka – Traveease go arrange flight, lodge, motor and local enjoyment for you.",
      inputLabel: "Explain your dream waka",
      inputPlaceholder:
        "Plan 5 days soft safari for Serengeti with SUV and small stop for Nairobi",
      cta: "Make Concierge plan am",
      disclaimer:
        "We go understand wetin you mean, hold seat sharp-sharp, then share payment give all vendors.",
      docs: "See architecture blueprint",
    },
  };

  const { title, subtitle, inputLabel, inputPlaceholder, cta, disclaimer, docs } =
    copyByLocale[locale] ?? copyByLocale["en"];

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(79,255,176,0.18),_transparent_55%),_radial-gradient(circle_at_bottom_right,_rgba(217,119,6,0.4),_transparent_55%),_rgba(10,37,64,0.96)] px-4 py-10 md:px-10 md:py-14">
      {/* Background media overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light">
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center blur-md md:blur-xl" />
      </div>

      <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[11px] font-medium text-ghost-white/80 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-neo-mint" />
            <span>AI-native travel OS • 2026 pattern</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-ghost-white"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="max-w-xl text-sm md:text-base text-ghost-white/80"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center gap-4 text-[11px] text-ghost-white/75"
          >
            <span>Atomic holds before capture</span>
            <span className="h-1 w-1 rounded-full bg-ghost-white/40" />
            <span>BNPL-ready marketplace splits</span>
            <span className="h-1 w-1 rounded-full bg-ghost-white/40" />
            <span>150+ countries • Multi-currency ledgers</span>
          </motion.div>

          {/* Locale toggle */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[11px] text-ghost-white/80 ring-1 ring-white/10">
            <span className="px-2 py-1 rounded-full bg-ghost-white/10 font-medium">EN</span>
            <LocaleSwitcher currentLocale={locale} />
          </motion.div>
        </motion.div>

        {/* Command Center */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="animate"
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="glass-panel border-white/15">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 text-xs text-ghost-white/80">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1">
                  <span className="text-[13px]">🧠</span>
                  <span>Agentic Command Center</span>
                </span>
                <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] text-ghost-white/60">
                  LangGraph • Amadeus • Treepz
                </span>
              </div>

              {/* Search tabs */}
              <div className="flex gap-1 rounded-full bg-black/40 p-1 text-[11px]">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex-1 rounded-full px-3 py-1.5 flex items-center justify-center gap-1 transition-colors ${
                      activeTab === tab.value
                        ? "bg-ghost-white text-traveease-blue shadow-gummy-sm"
                        : "text-ghost-white/70 hover:bg-white/5"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Natural language input */}
              <form onSubmit={onSubmit} className="space-y-3">
                <label className="block text-[11px] font-medium text-ghost-white/80">
                  {inputLabel}
                </label>
                <div className="flex flex-col gap-2 rounded-2xl bg-black/40 p-2 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-lg">💬</span>
                    <Input
                      className="border-none bg-transparent px-0 text-sm text-ghost-white placeholder:text-ghost-white/45 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder={inputPlaceholder}
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setThoughtIndex((prev) => (prev + 1) % AGENT_THOUGHTS.length);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2 text-[11px] text-ghost-white/70">
                    <AnimatePresence mode="wait" initial={false}>
                      {query && (
                        <motion.div
                          key={thoughtIndex}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-neo-mint" />
                          <span>{AGENT_THOUGHTS[thoughtIndex]}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      {...puffyTap}
                      className="ml-auto"
                    >
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="gummy-button bg-neo-mint text-traveease-blue hover:bg-neo-mint/90"
                      >
                        {cta}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[10px] text-ghost-white/60">
                <p>
                  {disclaimer}
                </p>
                <Link href="/docs/architecture" className="underline-offset-2 hover:underline">
                  {docs}
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const locales = [
    { code: "en", label: "English", chip: "EN" },
    { code: "fr", label: "Français", chip: "FR" },
    { code: "ng-pidgin", label: "Naija Pidgin", chip: "Start Waka" },
  ];

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <Link key={loc.code} href={`/${loc.code}`} className="group">
          <span
            className={`px-2 py-1 rounded-full transition-colors ${
              currentLocale === loc.code
                ? "bg-ghost-white/15 text-ghost-white"
                : "text-ghost-white/60 group-hover:bg-ghost-white/10 group-hover:text-ghost-white"
            }`}
          >
            {loc.chip}
          </span>
        </Link>
      ))}
    </div>
  );
}
