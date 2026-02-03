// Stepper Component - Multi-step form indicator
import React from 'react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <button
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200',
                index < currentStep
                  ? 'bg-emerald-500 text-white'
                  : index === currentStep
                  ? 'bg-sky-500 text-white ring-4 ring-sky-100'
                  : 'bg-gray-200 text-gray-600',
                onStepClick && 'cursor-pointer hover:shadow-lg'
              )}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </button>
            
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 rounded-full transition-all duration-200',
                  index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between mt-4 text-sm">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'text-center transition-colors duration-200',
              index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
            )}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
