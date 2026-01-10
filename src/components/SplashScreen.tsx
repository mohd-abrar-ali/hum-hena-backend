
import React, { useEffect, useState } from 'react';
import { MapPin, Hammer, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Accelerated timings for an instant-feel startup
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 500); // Start fade-out at 0.5s

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 800); // Handover to main app at 0.8s

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-all duration-400 ease-in-out ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Soft Background Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white"></div>

      <div className="relative mb-8">
        {/* Simplified Logo Container */}
        <div className="relative w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.2)] rotate-3">
            <MapPin className="w-12 h-12 text-white" />
            <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-2xl shadow-lg border border-slate-50">
                <Hammer className="w-5 h-5 text-blue-600" />
            </div>
        </div>
        
        {/* Subtle pulse behind the logo */}
        <div className="absolute inset-0 w-24 h-24 bg-blue-500/10 rounded-[2.5rem] animate-ping"></div>
      </div>

      <div className="text-center space-y-3 relative z-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-3">
          Hum Hena
          <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
        </h1>
        <p className="text-slate-400 text-[10px] font-black tracking-[0.6em] uppercase">
          Local Expert Protocol
        </p>
      </div>

      {/* Modern Minimal Loading */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
         <div className="h-full bg-blue-600 w-1/3 rounded-full animate-[loading_0.8s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
