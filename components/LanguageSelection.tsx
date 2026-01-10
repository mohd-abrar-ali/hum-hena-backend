
import React from 'react';
import { Language } from '../types';
import { Check, Globe } from 'lucide-react';
import { Button } from './ui/Button';

interface LanguageSelectionProps {
  currentLanguage: Language;
  onSelect: (lang: Language) => void;
  onConfirm: () => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ currentLanguage, onSelect, onConfirm }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden safe-top safe-bottom">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
      
      <div className="mb-12 text-center relative z-10 animate-slideDown">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-2xl rotate-3">
            <Globe className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Select Language</h1>
        <p className="text-slate-400 mt-2 text-[10px] font-black tracking-[0.3em] uppercase">अपनी भाषा चुनें</p>
      </div>

      <div className="grid gap-4 w-full max-w-sm relative z-10">
        <button 
          onClick={() => onSelect('en')}
          className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${currentLanguage === 'en' ? 'border-blue-600 bg-blue-50/50 shadow-lg' : 'border-slate-100 bg-white hover:border-blue-200'}`}
        >
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${currentLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>A</div>
             <div>
                <h3 className="font-black text-slate-900 text-lg">English</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Default Language</p>
             </div>
          </div>
          {currentLanguage === 'en' && <div className="bg-blue-600 text-white p-1 rounded-full"><Check className="w-4 h-4" /></div>}
        </button>

        <button 
          onClick={() => onSelect('hi')}
          className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${currentLanguage === 'hi' ? 'border-blue-600 bg-blue-50/50 shadow-lg' : 'border-slate-100 bg-white hover:border-blue-200'}`}
        >
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${currentLanguage === 'hi' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>अ</div>
             <div>
                <h3 className="font-black text-slate-900 text-lg">हिन्दी</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hindi Language</p>
             </div>
          </div>
          {currentLanguage === 'hi' && <div className="bg-blue-600 text-white p-1 rounded-full"><Check className="w-4 h-4" /></div>}
        </button>
      </div>

      <div className="mt-12 w-full max-w-sm relative z-10">
        <Button fullWidth size="lg" onClick={onConfirm} className="h-16 rounded-[1.5rem] text-sm">
            {currentLanguage === 'en' ? 'Continue' : 'जारी रखें'}
        </Button>
      </div>
    </div>
  );
};
