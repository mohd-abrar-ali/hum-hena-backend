
import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, User, Zap, MapPin, IndianRupee, ShieldCheck, Sparkles } from 'lucide-react';
import { JobRequest } from '../types';
import { useTranslation } from '../translations';

interface WorkerIncomingCallScreenProps {
  job: JobRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export const WorkerIncomingCallScreen: React.FC<WorkerIncomingCallScreenProps> = ({ job, onAccept, onDecline }) => {
  const [timer, setTimer] = useState(30);
  const lang = (localStorage.getItem('sl_lang') || 'en') as any;
  const t = useTranslation(lang);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [onDecline]);

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-950 flex flex-col items-center justify-between py-16 px-8 animate-fadeIn overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Top Header - Urgency Marker */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="bg-indigo-600 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-2xl shadow-indigo-600/40">
          <Zap className="w-3 h-3 text-white fill-white animate-bounce" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Priority Signal Detected</span>
        </div>
        <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
           Expires in {timer}s
        </div>
      </div>

      {/* Main Info Area */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <div className="relative mb-12">
          {/* Pulsing Radar */}
          <div className="absolute -inset-16 bg-indigo-500/10 rounded-full animate-[ping_3s_linear_infinite]"></div>
          <div className="absolute -inset-8 bg-indigo-500/20 rounded-full animate-[ping_2s_linear_infinite]"></div>
          
          <div className="w-36 h-36 bg-slate-900 rounded-[3rem] border-4 border-slate-800 shadow-2xl flex items-center justify-center relative z-20 overflow-hidden rotate-3">
             {job.customerAvatar ? (
               <img src={job.customerAvatar} className="w-full h-full object-cover opacity-80" alt="" />
             ) : (
               <User className="w-16 h-16 text-slate-700" />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          </div>
          
          <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-3 rounded-2xl border-4 border-slate-950 shadow-xl z-30">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Service Request</h3>
        <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-4">{t[job.skill] || job.skill} Work</h2>
        
        <div className="flex flex-col gap-4 w-full max-w-[280px]">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-inner text-left group">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-white font-bold text-lg leading-none">{job.customerName || 'Local Client'}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="h-px bg-white/5 mb-4"></div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Estimated Bounty</p>
                        <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-green-400" />
                            <span className="text-2xl font-black text-white tracking-tight">{job.price}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg">
                        <Sparkles className="w-3 h-3 text-green-400" />
                        <span className="text-[8px] font-black text-green-400 uppercase">Verified</span>
                    </div>
                </div>
            </div>
            
            <p className="text-white/40 text-xs font-medium italic leading-relaxed px-4">
                "{job.description || "Urgent arrival requested for professional inspection."}"
            </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="w-full max-w-xs relative z-10 flex justify-around items-center">
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onDecline}
            className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all hover:bg-red-500 group"
          >
            <PhoneOff className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ignore</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onAccept}
            className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_20px_60px_rgba(79,70,229,0.5)] active:scale-90 transition-all hover:bg-indigo-500 animate-bounce group"
          >
            <Phone className="w-10 h-10 text-white fill-white group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">{t.accept_job}</span>
        </div>
      </div>

      <div className="relative z-10 text-white/10 text-[8px] font-black uppercase tracking-[0.6em]">
        End-to-End Encrypted Node Connection
      </div>
    </div>
  );
};
