
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'center';
}

interface GuidedTourProps {
  steps: TourStep[];
  onFinish: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ steps, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState({ top: 0, left: 0, width: 0, height: 0 });
  
  const step = steps[currentStep];

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlight({ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [currentStep, step.targetId]);

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden animate-fadeIn">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] transition-all duration-500"
        style={{
          clipPath: `polygon(0% 0%, 0% 100%, ${spotlight.left}px 100%, ${spotlight.left}px ${spotlight.top}px, ${spotlight.left + spotlight.width}px ${spotlight.top}px, ${spotlight.left + spotlight.width}px ${spotlight.top + spotlight.height}px, ${spotlight.left}px ${spotlight.top + spotlight.height}px, ${spotlight.left}px 100%, 100% 100%, 100% 0%)`
        }}
      />

      <div 
        className={`absolute z-[10001] w-72 bg-white rounded-[2rem] shadow-2xl p-6 transition-all duration-500 animate-scaleIn`}
        style={{
          top: step.position === 'bottom' ? spotlight.top + spotlight.height + 20 : spotlight.top - 220,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg mb-2 inline-block">Step {currentStep + 1} of {steps.length}</span>
        <h3 className="text-lg font-black text-slate-900 mb-2">{step.title}</h3>
        <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">{step.content}</p>
        <Button fullWidth onClick={() => currentStep < steps.length - 1 ? setCurrentStep(s => s + 1) : onFinish()} className="h-12 rounded-xl">
           {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
