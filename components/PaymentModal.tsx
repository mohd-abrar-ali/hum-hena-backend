
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { X, CreditCard, Smartphone, Banknote, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  amount: number;
  workerName: string;
  onClose: () => void;
  onSuccess: (method: 'UPI' | 'CARD' | 'CASH') => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ amount, workerName, onClose, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate API delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Wait a moment before closing/triggering success
      setTimeout(() => {
        onSuccess(selectedMethod);
        onClose();
      }, 2000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-scaleIn text-center">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
           <p className="text-slate-500">₹{amount} paid to {workerName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Secure Payment
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 mb-1">Total Amount Payable</p>
            <h1 className="text-4xl font-bold text-slate-900">₹{amount}</h1>
            <p className="text-xs text-blue-600 font-medium mt-2 bg-blue-50 inline-block px-2 py-1 rounded">Paying: {workerName}</p>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Select Payment Method</p>
          <div className="space-y-3 mb-8">
            
            {/* UPI Option */}
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMethod === 'UPI' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
            }`}>
              <input type="radio" name="payment" className="hidden" checked={selectedMethod === 'UPI'} onChange={() => setSelectedMethod('UPI')} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                  selectedMethod === 'UPI' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400'
              }`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className={`font-bold block ${selectedMethod === 'UPI' ? 'text-blue-900' : 'text-slate-900'}`}>UPI</span>
                <span className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</span>
              </div>
              {selectedMethod === 'UPI' && <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm ring-2 ring-white"></div>}
            </label>

            {/* Card Option */}
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMethod === 'CARD' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
            }`}>
              <input type="radio" name="payment" className="hidden" checked={selectedMethod === 'CARD'} onChange={() => setSelectedMethod('CARD')} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                  selectedMethod === 'CARD' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400'
              }`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className={`font-bold block ${selectedMethod === 'CARD' ? 'text-indigo-900' : 'text-slate-900'}`}>Card</span>
                <span className="text-xs text-slate-500">Credit or Debit Card</span>
              </div>
               {selectedMethod === 'CARD' && <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-sm ring-2 ring-white"></div>}
            </label>

            {/* Cash Option */}
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMethod === 'CASH' ? 'border-green-500 bg-green-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
            }`}>
              <input type="radio" name="payment" className="hidden" checked={selectedMethod === 'CASH'} onChange={() => setSelectedMethod('CASH')} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                  selectedMethod === 'CASH' ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400'
              }`}>
                <Banknote className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className={`font-bold block ${selectedMethod === 'CASH' ? 'text-green-900' : 'text-slate-900'}`}>Cash</span>
                <span className="text-xs text-slate-500">Pay cash after service</span>
              </div>
               {selectedMethod === 'CASH' && <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm ring-2 ring-white"></div>}
            </label>
          </div>

          <Button fullWidth size="lg" onClick={handlePay} disabled={isProcessing} className="shadow-lg shadow-blue-500/30">
            {isProcessing ? (
               <>
                 <Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...
               </>
            ) : (
               `Pay ₹${amount}`
            )}
          </Button>
          
          <p className="text-center text-[10px] text-slate-400 mt-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Payments are secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};
