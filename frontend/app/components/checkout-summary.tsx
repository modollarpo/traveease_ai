'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface CheckoutProps {
  basePrice: number;
  stampDuty: number;
  vat: number;
  currency: string;
}

export function CheckoutSummary({ basePrice, stampDuty, vat, currency }: CheckoutProps) {
  const t = useTranslations('booking');
  const total = basePrice + stampDuty + vat;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 max-w-md"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('checkoutTitle')}</h2>
      
      <motion.div variants={itemVariants} className="mb-4 pb-4 border-b border-gray-300">
        <div className="flex justify-between text-gray-700">
          <span>Base Price:</span>
          <span className="font-semibold">{currency} {basePrice.toLocaleString()}</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-4 pb-4 border-b border-gray-300">
        <div className="flex justify-between text-gray-700">
          <span>{t('stampDuty')}:</span>
          <span className="font-semibold text-orange-600">{currency} {stampDuty.toLocaleString()}</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 pb-4 border-b border-gray-300">
        <div className="flex justify-between text-gray-700">
          <span>{t('vat')}:</span>
          <span className="font-semibold text-blue-600">{currency} {vat.toLocaleString()}</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex justify-between text-xl font-bold text-gray-900">
          <span>{t('total')}:</span>
          <span className="text-orange-600">{currency} {total.toLocaleString()}</span>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
      >
        {t('confirmBooking')}
      </motion.button>
    </motion.div>
  );
}
