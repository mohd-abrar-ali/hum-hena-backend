
import React, { useState } from 'react';
import { WorkerProfile, JobRequest } from '../types';
import { Button } from './ui/Button';
import { CheckCircle, Loader2, Lock, Sparkles, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  worker: WorkerProfile;
  onClose: (createdJob?: JobRequest) => void;
  onConfirm: (newJob: Partial<JobRequest>) => Promise<string>;
}

export const BookingModal: React.FC<BookingModalProps> = ({ worker, onClose, onConfirm }) => {
  const [step, setStep] = useState<'REQUEST' | 'SENDING' | 'DONE'>('REQUEST');
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async () => {
    setError(null);
    setStep('SENDING');
    try {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const generatedCompletionOtp = Math.floor(1000 + Math.random() * 9000).toString();
      
      const jobData: Partial<JobRequest> = {
        workerId: worker.id,
        workerName: worker.name,
        workerAvatar: worker.avatarUrl,
        skill: worker.skill,
        status: 'PENDING',
        otp: generatedOtp,
        completionOtp: generatedCompletionOtp,
        date: 'Today',
        description: `Verified ${worker.skill} booking`,
        price: worker.hourlyRate,
        platformFee: 0, 
        workerEarnings: 0
      };

      const jobId = await onConfirm(jobData);
      const createdJob = { ...jobData, id: jobId } as JobRequest;
      
      // Show success briefly then close
      setStep('DONE');
      setTimeout(() => {
          onClose(createdJob);
      }, 1500);

    } catch (err) {
      setError("Connection error. Try again.");
      setStep('REQUEST');
    }
  };

  if (step === 'DONE') {
      return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-scaleIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Request Sent!</h3>
                <p className="text-slate-500 text-sm">Check your Activity tab for updates.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
        
        <div className="p-10 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Book Expert</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Connect with <span className="font-bold text-slate-900">{worker.name}</span> instantly.
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="ghost" fullWidth onClick={() => onClose()} className="font-black text-slate-400" disabled={step === 'SENDING'}>Cancel</Button>
              <Button fullWidth onClick={handleSendRequest} disabled={step === 'SENDING'} className="h-16 rounded-2xl shadow-xl shadow-blue-600/20 text-lg">
                  {step === 'SENDING' ? <Loader2 className="animate-spin w-6 h-6" /> : 'Send Request'}
              </Button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-blue-400" /> Secure Protocol
            </div>
        </div>
      </div>
    </div>
  );
};
