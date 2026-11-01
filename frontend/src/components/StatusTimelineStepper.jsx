import React from 'react';
import { Check, Clock, AlertCircle, Wrench, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { key: 'SUBMITTED', label: 'Submitted', icon: Clock },
  { key: 'TRIAGED', label: 'AI Triaged', icon: AlertCircle },
  { key: 'ASSIGNED', label: 'Assigned', icon: Wrench },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Clock },
  { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle2 },
];

export default function StatusTimelineStepper({ currentStatus }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        {/* Continuous track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-500 z-0" 
          style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-500 text-white border-2 border-emerald-500 ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-white text-emerald-600 border-2 border-emerald-500 ring-4 ring-emerald-100 font-extrabold'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-3.5 h-3.5" />}
              </div>
              <span
                className={`text-[11px] mt-1.5 whitespace-nowrap font-semibold ${
                  isCurrent ? 'text-emerald-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}