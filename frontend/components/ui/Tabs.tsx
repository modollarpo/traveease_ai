// Tabs Component - Tabbed content interface
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  label: string;
  value: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value || '');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  const activeTabData = tabs.find((tab) => tab.value === activeTab);

  return (
    <div className="w-full">
      {/* Tab List */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 relative',
              'flex items-center gap-2',
              activeTab === tab.value
                ? 'text-sky-600 border-b-2 border-sky-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-6 animate-in fade-in duration-300">
        {activeTabData?.content}
      </div>
    </div>
  );
};

export default Tabs;
