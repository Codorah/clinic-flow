import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Activity,
  Stethoscope,
  FlaskConical,
  Scan,
  Pill,
  Wallet,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { id: 'reception', label: 'Réception',    icon: <Users size={16} /> },
  { id: 'nurse',     label: 'Infirmerie',   icon: <Activity size={16} /> },
  { id: 'doctor',    label: 'Consultation', icon: <Stethoscope size={16} /> },
  { id: 'secondary', label: 'Para-clinique',icon: <FlaskConical size={16} /> },
  { id: 'radiology', label: 'Radiologie',   icon: <Scan size={16} /> },
  { id: 'billing',   label: 'Paiement',     icon: <Wallet size={16} /> },
  { id: 'exit',      label: 'Sortie',       icon: <CheckCircle2 size={16} /> },
];

interface FlowGuideProps {
  currentStepId: string;
}

export const FlowGuide: React.FC<FlowGuideProps> = ({ currentStepId }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-3">
                <div className={`
                  flex items-center gap-2 px-4 py-2 rounded-2xl transition-all
                  ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 
                    isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}
                `}>
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider whitespace-nowrap">{step.label}</span>
                  {isCompleted && <CheckCircle2 size={14} />}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight size={16} className={index < currentIndex ? 'text-emerald-300' : 'text-slate-200'} />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
