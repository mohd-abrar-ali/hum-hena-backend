
import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, User, ShieldCheck } from 'lucide-react';
import { JobRequest } from '../types';

interface IncomingCallScreenProps {
  job: JobRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({ job, onAccept, onDecline }) => {
  const [ringCount, setRingCount] = useState(0);

  useEffect(() => {
    // Play a simulated ring sound or vibration pattern could go here
    const interval = setInterval(() => {
      setRingCount(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-900 flex flex-col items-center justify-between py-20 px-8 animate-fadeIn">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-10">
          <div className="absolute -inset-10 bg-blue-500/20 rounded-full animate-ping"></div>
          <div className="absolute -inset-20 bg-blue-500/10 rounded-full animate-pulse"></div>
          <img 
            src={job.workerAvatar || 'https://i.pravatar.cc/150?u=worker'} 
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl relative z-20"
            alt=""
          />
          <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2.5 rounded-2xl border-4 border-slate-900 shadow-xl z-30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight mb-2">{job.workerName || 'Worker'}</h2>
        <div className="bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Job Accepted • Calling...</span>
        </div>
        <p className="mt-8 text-white/40 font-medium text-sm leading-relaxed max-w-[200px]">
          Accept this call to start tracking your expert's arrival.
        </p>
      </div>

      <div className="w-full max-w-xs relative z-10 flex justify-around items-center">
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onDecline}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 active:scale-90 transition-all hover:bg-red-600"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Decline</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onAccept}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 active:scale-90 transition-all hover:bg-green-600 animate-bounce"
          >
            <Phone className="w-10 h-10 text-white fill-white" />
          </button>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Accept Call</span>
        </div>
      </div>

      <div className="relative z-10 text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">
        Secure Hyperlocal Signal
      </div>
    </div>
  );
};
