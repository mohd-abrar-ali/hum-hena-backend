
import React from 'react';
import { UserRole } from '../types';
import { User, Hammer, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../translations';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  // We assume language is already set in App and role selection is the next step
  // Since RoleSelection doesn't have direct access to language prop, 
  // and we didn't want to over-complicate App.tsx, 
  // we can read it from localStorage or pass it down.
  // For simplicity, let's read from local storage here.
  const lang = (localStorage.getItem('sl_lang') || 'en') as any;
  const t = useTranslation(lang);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden safe-top safe-bottom">
      {/* Soft Positive Background Elements */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="mb-10 md:mb-14 text-center relative z-10 animate-slideDown">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-3xl mb-6 shadow-[0_20px_40px_rgba(37,99,235,0.2)] rotate-3">
            <MapPin className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Hum Hena</h1>
        <p className="text-blue-600/60 mt-3 md:mt-4 text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase">{t.welcome}</p>
      </div>

      <div className="grid gap-5 md:gap-6 w-full max-w-sm relative z-10">
        <button 
          onClick={() => onSelect(UserRole.CUSTOMER)}
          className="bg-white p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_rgba(30,41,59,0.08)] transition-all active:scale-95 group text-left flex items-center gap-5 md:gap-6 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-blue-600/10 shrink-0">
            <User className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight leading-none">{t.hire_expert}</h3>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{t.i_need_work}</p>
          </div>
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 shrink-0" />
        </button>

        <button 
          onClick={() => onSelect(UserRole.WORKER)}
          className="bg-slate-900 p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] transition-all active:scale-95 group text-left flex items-center gap-5 md:gap-6 border border-slate-800 hover:bg-black"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
            <Hammer className="w-6 h-6 md:w-7 md:h-7 text-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white text-lg md:text-xl tracking-tight leading-none">{t.i_am_expert}</h3>
            <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest mt-2">{t.i_want_to_earn}</p>
          </div>
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white/20 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0" />
        </button>
      </div>
      
      <div className="mt-14 md:mt-20 text-center relative z-10 animate-fadeIn">
        <div className="flex items-center justify-center gap-3 md:gap-4 opacity-40">
           <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
           <span className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Powered by Local Network</span>
           <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
        </div>
      </div>
    </div>
  );
};
