
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Loader2, MapPin, Smartphone, ShieldAlert, RefreshCw } from 'lucide-react';
import { getUserProfile } from '../services/firestoreService';

interface AuthScreenProps {
  onSuccess: (phone: string) => void;
  roleText: string;
  onBack: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, roleText, onBack }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Resend Logic
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setIsLoading(true);
    setError(null);
    try {
        const profile = await getUserProfile(phone);
        if (profile && profile.status === 'suspended') {
            setError("Account suspended. Contact support.");
            setIsLoading(false);
            return;
        }
        setStep('OTP');
        setTimer(30);
        setCanResend(false);
    } catch (e) {
        setError("Network signal error.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
      setCanResend(false);
      setTimer(30);
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
          setIsLoading(false);
          // In a real app, trigger SMS API here
      }, 1000);
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        if (code === '123456') onSuccess(phone);
        else setError("Invalid code. Try 123456.");
    }, 800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`auth-otp-${index + 1}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 relative overflow-hidden">
       <div className="w-full max-w-xs flex flex-col items-center relative z-10">
          <div className="mb-12 text-center">
             <div className="w-20 h-20 bg-blue-600 rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 mx-auto rotate-3">
                <MapPin className="w-10 h-10 text-white" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
                {step === 'PHONE' ? 'Hum Hena' : 'Verification'}
             </h1>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                {step === 'PHONE' ? 'Make Your Account First' : 'Enter Your OTP'}
             </p>
          </div>

          <div className="w-full space-y-8">
             {error && <div className="p-4 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> {error}</div>}

             {step === 'PHONE' ? (
                <>
                    <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-3xl px-6 py-5 focus-within:border-blue-600 focus-within:shadow-xl transition-all shadow-sm">
                        <span className="font-black text-slate-400 text-lg tracking-tighter select-none">+91</span>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <input 
                            type="tel"
                            autoFocus
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="Phone Number"
                            className="flex-1 bg-transparent border-none p-0 font-black text-xl text-slate-900 focus:ring-0 outline-none placeholder:text-slate-300"
                        />
                        <Smartphone className="w-5 h-5 text-slate-300" />
                    </div>
                    <Button fullWidth onClick={handleSendOtp} disabled={phone.length < 10 || isLoading} className="h-16 rounded-[1.5rem] shadow-2xl shadow-blue-600/30 text-lg font-black tracking-wide">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Get OTP'}
                    </Button>
                    <button onClick={onBack} className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                        Back
                    </button>
                </>
             ) : (
                <>
                    <div className="flex gap-2 justify-between">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                id={`auth-otp-${idx}`}
                                type="tel"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                className="w-12 h-16 bg-white border-2 border-slate-200 rounded-2xl text-center text-2xl font-black text-slate-900 focus:border-blue-600 focus:shadow-xl outline-none transition-all"
                            />
                        ))}
                    </div>
                    
                    <div className="flex justify-end">
                        {canResend ? (
                            <button 
                                onClick={handleResendOtp} 
                                className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1 hover:underline"
                            >
                                <RefreshCw className="w-3 h-3" /> Resend Code
                            </button>
                        ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Resend in {timer}s
                            </span>
                        )}
                    </div>

                    <Button fullWidth onClick={handleVerify} disabled={otp.join('').length < 6 || isLoading} className="h-16 rounded-[1.5rem] shadow-2xl shadow-blue-600/30 text-lg font-black tracking-wide">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm'}
                    </Button>
                    <button onClick={() => setStep('PHONE')} className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Change Number</button>
                </>
             )}
          </div>
       </div>
    </div>
  );
};
