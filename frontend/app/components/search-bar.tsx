'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ContextAwareSearchBar() {
  const t = useTranslations('home');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'inspiration' | 'booking'>('inspiration');

  const handleSearch = async () => {
    // Call backend agentic endpoint
    const response = await fetch('/api/agentic-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    setMode('booking');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full p-8 rounded-lg transition-all ${
        mode === 'inspiration' ? 'bg-gradient-to-r from-orange-100 to-red-100' : 'bg-blue-100'
      }`}
    >
      <h1 className="text-4xl font-bold mb-4 text-gray-800">{t('title')}</h1>
      <p className="text-lg text-gray-600 mb-6">{t('subtitle')}</p>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          {mode === 'inspiration' ? 'Search' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );
}
