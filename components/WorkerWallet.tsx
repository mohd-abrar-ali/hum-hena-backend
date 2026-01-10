
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Clock, X, Smartphone, Landmark, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { WorkerProfile, Transaction } from '../types';
import { getWorkerTransactions, requestWithdrawal } from '../services/firestoreService';

interface WorkerWalletProps {
  worker: WorkerProfile;
  onClose: () => void;
}

export const WorkerWallet: React.FC<WorkerWalletProps> = ({ worker, onClose }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [details, setDetails] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (activeTab === 'history') {
      setIsLoadingHistory(true);
      getWorkerTransactions(worker.id).then((data) => {
        setTransactions(data);
        setIsLoadingHistory(false);
      });
    }
  }, [activeTab, worker.id]);

  const handleWithdraw = async () => {
    const val = Number(amount);
    if (!val || val < 100) return alert("Minimum withdrawal is ₹100");
    if (val > (worker.totalEarned || 0)) return alert("Insufficient balance");
    if (!details) return alert("Please provide payment details");

    setIsSubmitting(true);
    try {
      await requestWithdrawal({
        workerId: worker.id,
        workerName: worker.name,
        amount: val,
        method,
        details
      });
      setSuccessMsg("Withdrawal requested successfully!");
      setAmount('');
      setDetails('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert("Failed to process request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">My Wallet</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Earnings & Payouts</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="px-6 pt-4 shrink-0">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('balance')} 
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                Withdraw
              </button>
              <button 
                onClick={() => setActiveTab('history')} 
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                History
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {activeTab === 'balance' && (
            <div className="space-y-6">
               <div className="bg-slate-900 text-white p-8 rounded-[2rem] text-center shadow-xl shadow-slate-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                      <IndianRupee className="w-32 h-32" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2">Available Balance</p>
                  <h1 className="text-5xl font-black mb-1">₹{worker.totalEarned?.toLocaleString() || 0}</h1>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Ready to Payout</p>
               </div>

               {successMsg && (
                 <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-2 border border-green-100 animate-slideDown">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-xs font-bold">{successMsg}</span>
                 </div>
               )}

               <div className="space-y-4">
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Withdraw Amount</label>
                      <div className="relative">
                          <IndianRupee className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                          <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Min ₹100"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-black focus:border-blue-500 outline-none transition-all"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Transfer Method</label>
                      <div className="flex gap-3 mb-4">
                          <button 
                            onClick={() => setMethod('UPI')}
                            className={`flex-1 py-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-2 transition-all ${method === 'UPI' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                          >
                              <Smartphone className="w-5 h-5" /> UPI
                          </button>
                          <button 
                            onClick={() => setMethod('BANK')}
                            className={`flex-1 py-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-2 transition-all ${method === 'BANK' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                          >
                              <Landmark className="w-5 h-5" /> Bank
                          </button>
                      </div>
                      
                      <textarea 
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder={method === 'UPI' ? "Enter UPI ID (e.g. 9876543210@upi)" : "Account Number, IFSC Code"}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all resize-none h-24"
                      />
                  </div>
               </div>

               <Button 
                 fullWidth 
                 size="lg" 
                 onClick={handleWithdraw} 
                 disabled={isSubmitting || !amount || !details}
                 className="h-16 rounded-2xl shadow-xl shadow-blue-600/20"
               >
                 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Withdrawal'}
               </Button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
                {isLoadingHistory ? (
                    <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-xs font-black uppercase tracking-widest">No Transactions Yet</p>
                    </div>
                ) : (
                    transactions.map(txn => (
                        <div key={txn.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${txn.type === 'CREDIT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {txn.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900">{txn.description}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{new Date(txn.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-black text-sm ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-slate-900'}`}>
                                    {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                                </p>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                    txn.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                                    txn.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>{txn.status}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
