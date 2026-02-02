'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface BentoItemProps {
  title: string;
  icon: string;
  count: number;
  confidence: number;
}

function BentoItem({ title, icon, count, confidence }: BentoItemProps) {
  const t = useTranslations('dashboard');
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mt-2">{count} options</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-gray-700">{t('confidenceScore')}:</span>
        <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-green-500"
          />
        </div>
        <span className="text-sm font-semibold text-gray-800">{confidence}%</span>
      </div>
    </motion.div>
  );
}

export function BentoGrid() {
  const t = useTranslations('dashboard');
  const items = [
    { title: t('flights'), icon: '✈️', count: 12, confidence: 92 },
    { title: t('hotels'), icon: '🏨', count: 8, confidence: 88 },
    { title: t('cars'), icon: '🚗', count: 15, confidence: 85 },
    { title: t('activities'), icon: '🎭', count: 20, confidence: 90 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
      {items.map((item, i) => (
        <BentoItem key={i} {...item} />
      ))}
    </div>
  );
}
