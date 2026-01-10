
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PlatformFeeConfig } from '../types';
import { useTranslation } from '../translations';

interface LandingPageProps {
  onGetStarted: () => void;
  config: PlatformFeeConfig;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, config }) => {
  const isVideo = config.landingBackgroundType === 'video';
  const backgroundUrl = isVideo ? config.landingVideoUrl : config.landingImageUrl;
  const lang = (localStorage.getItem('sl_lang') || 'en') as any;
  const t = useTranslation(lang);

  return (
    <div className="absolute inset-0 z-[80] flex flex-col items-center justify-end bg-black overflow-hidden animate-fadeIn">
      {/* Cinematic Dynamic Background */}
      <div className="absolute inset-0 z-0">
        {isVideo ? (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            key={backgroundUrl}
            className="w-full h-full object-cover object-center opacity-70 animate-fadeIn"
          >
            <source src={backgroundUrl} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={backgroundUrl} 
            className="w-full h-full object-cover object-center opacity-70 animate-fadeIn" 
            alt="Hum Hena Background" 
          />
        )}
        
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
      </div>

      {/* Action Section - Only "Get Started Now" */}
      <div className="relative z-10 w-full px-8 pb-20 animate-slideUp">
        <button 
          onClick={onGetStarted}
          className="group relative w-full h-20 bg-white rounded-[2.5rem] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:bg-slate-50 overflow-hidden"
        >
          {/* Button Text */}
          <span className="text-slate-900 text-xl font-black tracking-tight z-10">{t.get_started}</span>
          
          <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform z-10">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
          
          {/* Subtle Pulse Layer */}
          <div className="absolute inset-0 rounded-[2.5rem] ring-4 ring-white/30 animate-pulse"></div>
          
          {/* Glossy highlight effect */}
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-1000"></div>
        </button>
        
        {/* Footer Technical ID */}
        <div className="mt-8 text-center">
            <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.5em]">
               Hyperlocal Protocol Secured
            </p>
        </div>
      </div>
    </div>
  );
};
