
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { IndianRupee, QrCode, Banknote, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { JobRequest } from '../types';

interface WorkerPaymentCollectionModalProps {
  job: JobRequest;
  onClose: () => void;
  onPaymentComplete: (method: 'CASH' | 'ONLINE') => void;
  qrCodeUrl?: string;
  upiId?: string;
}

export const WorkerPaymentCollectionModal: React.FC<WorkerPaymentCollectionModalProps> = ({ 
  job, onClose, onPaymentComplete, qrCodeUrl, upiId 
}) => {
  const [method, setMethod] = useState<'SELECT' | 'ONLINE'>('SELECT');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCash = () => {
    setIsSuccess(true);
    setTimeout(() => {
        onPaymentComplete('CASH');
    }, 1500);
  };

  const handleOnline = () => {
    setMethod('ONLINE');
  };

  const handleVerifyOnline = () => {
    setIsVerifying(true);
    // Simulate payment verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
          onPaymentComplete('ONLINE');
      }, 1500);
    }, 2000);
  };

  if (isSuccess) {
      return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-scaleIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Collected!</h2>
                <p className="text-slate-500 text-sm font-bold">Job marked as completed.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-scaleIn relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8 relative">
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-inner">
              <IndianRupee className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 leading-none">Collect Payment</h2>
           <p className="text-slate-500 font-black mt-2 text-3xl tracking-tight">₹{job.price}</p>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">From {job.customerName}</p>
        </div>

        {method === 'SELECT' ? (
          <div className="space-y-4">
             <button onClick={handleOnline} className="w-full bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl flex items-center gap-4 hover:border-blue-500 hover:bg-blue-100 transition-all group active:scale-95">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                   <QrCode className="w-6 h-6" />
                </div>
                <div className="text-left">
                   <h3 className="font-black text-slate-900 text-sm">Online Payment</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Customer scans QR</p>
                </div>
             </button>

             <button onClick={handleCash} className="w-full bg-green-50 border-2 border-green-100 p-4 rounded-2xl flex items-center gap-4 hover:border-green-500 hover:bg-green-100 transition-all group active:scale-95">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                   <Banknote className="w-6 h-6" />
                </div>
                <div className="text-left">
                   <h3 className="font-black text-slate-900 text-sm">Cash Payment</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Collect Cash Directly</p>
                </div>
             </button>
          </div>
        ) : (
          <div className="text-center space-y-6">
             <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-inner inline-block">
                <img 
                    src={qrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay"} 
                    className="w-48 h-48 object-contain" 
                    alt="Payment QR Code" 
                />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Scan to Pay</p>
                <div className="bg-slate-100 py-2 px-4 rounded-xl inline-block border border-slate-200">
                    <p className="text-xs font-black text-slate-900">{upiId || 'platform@upi'}</p>
                </div>
             </div>
             
             <div className="flex gap-3 pt-2">
               <button onClick={() => setMethod('SELECT')} className="p-4 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                   <ArrowLeft className="w-5 h-5" />
               </button>
               <Button fullWidth onClick={handleVerifyOnline} disabled={isVerifying} className="h-auto rounded-xl">
                  {isVerifying ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...</> : 'Payment Received'}
               </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
