
import React, { useState, useEffect } from 'react';
// Added Smartphone to the list of imported icons from lucide-react
import { Wallet, Check, X, Clock, IndianRupee, ExternalLink, Loader2, ArrowUpRight, Search, ShieldCheck, Banknote, Smartphone } from 'lucide-react';
import { listenToWithdrawals, updateWithdrawalStatus } from '../../services/firestoreService';
import { WithdrawalRequest } from '../../types';
import { Button } from '../ui/Button';

export const AdminWithdrawals: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = listenToWithdrawals((data: WithdrawalRequest[]) => {
      setRequests(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    await updateWithdrawalStatus(id, status);
    setProcessingId(null);
  };

  const filteredRequests = requests.filter(r => 
    r.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Withdrawal Protocol</h2>
          <p className="text-sm text-slate-500 font-medium">Manage expert payout requests and UPI settlements.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search workers or UPI IDs..." 
            className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm w-72 outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((req) => (
          <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg leading-none">{req.workerName}</h4>
                <div className="flex items-center gap-2 mt-2">
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                     req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                     req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                   }`}>
                     {req.status}
                   </span>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                     <Clock className="w-3 h-3" /> {new Date(req.requestedAt).toLocaleDateString()}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center gap-8 px-6">
                <div className="text-center md:text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Transfer Amount</p>
                    <div className="flex items-center gap-1 text-slate-900 font-black text-2xl">
                        <IndianRupee className="w-5 h-5 text-green-600" /> {req.amount}
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Details</p>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        {req.method === 'UPI' ? <Smartphone className="w-4 h-4 text-blue-500" /> : <Banknote className="w-4 h-4 text-indigo-500" />}
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{req.details}</span>
                    </div>
                </div>
            </div>

            {req.status === 'PENDING' && (
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                  disabled={processingId === req.id}
                  className="flex-1 md:w-12 h-14 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center border border-red-100"
                >
                  <X className="w-5 h-5" />
                </button>
                <Button 
                  onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                  disabled={processingId === req.id}
                  className="flex-[3] md:w-48 h-14 rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/10 font-black text-[10px] uppercase tracking-widest"
                >
                  {processingId === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-4 h-4 mr-2 text-green-400" /> Approve Transfer</>}
                </Button>
              </div>
            )}

            {req.status !== 'PENDING' && (
                <div className="text-slate-300 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${req.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'}`} />
                    Finalized
                </div>
            )}
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
            <IndianRupee className="w-16 h-16 mb-6 text-slate-100" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">No Pending Withdrawals</p>
          </div>
        )}
      </div>
    </div>
  );
};
