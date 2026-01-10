
import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { UserRole } from '../types';
import { submitReport } from '../services/firestoreService';

interface ReportModalProps {
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reportedRole: UserRole;
  jobId?: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ 
  reporterId, 
  reporterName, 
  reportedId, 
  reportedName, 
  reportedRole,
  jobId,
  onClose 
}) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reasons = [
    'Harassment or Abuse',
    'Payment Dispute',
    'Identity Mismatch',
    'Safety Concern',
    'Fraudulent Activity',
    'Professional Misconduct',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!reason || !details) return;
    setIsSubmitting(true);
    try {
        await submitReport({
            reporterId,
            reporterName,
            reportedId,
            reportedName,
            reportedRole,
            jobId,
            reason,
            details
        });
        setIsSuccess(true);
        setTimeout(onClose, 2000);
    } catch (e) {
        alert("Report failed to send.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-scaleIn">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Report Logged</h2>
          <p className="text-slate-500 text-sm leading-relaxed">Our Trust & Safety team will review the signal and take appropriate action immediately.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                <ShieldAlert className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-900 leading-none">Safety Protocol</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reporting Misconduct</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Account</p>
                <p className="text-sm font-bold text-slate-900">{reportedName}</p>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{reportedRole}</p>
            </div>

            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Reason for Report</label>
                <div className="grid grid-cols-1 gap-2">
                    {reasons.map(r => (
                        <button 
                            key={r}
                            onClick={() => setReason(r)}
                            className={`p-4 rounded-xl border-2 text-left text-xs font-bold transition-all ${
                                reason === r ? 'bg-red-50 border-red-500 text-red-900' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Evidence Details</label>
                <textarea 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide specific details about what happened..."
                    className="w-full h-32 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-red-500 outline-none transition-all resize-none"
                />
            </div>
        </div>

        <div className="p-8 border-t border-slate-50 shrink-0">
            <Button 
                fullWidth 
                size="lg" 
                variant="danger" 
                onClick={handleSubmit}
                disabled={!reason || !details || isSubmitting}
                className="h-16 rounded-2xl shadow-xl shadow-red-600/20 font-black text-base"
            >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Log Misconduct Signal'}
            </Button>
            <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Anonymous Peer Review Enabled
            </p>
        </div>
      </div>
    </div>
  );
};
