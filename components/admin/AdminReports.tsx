
import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Clock, Check, Loader2, MessageCircle, AlertTriangle, Trash2, UserX } from 'lucide-react';
import { listenToReports, updateReportStatus, setWorkerStatus, setUserStatus } from '../../services/firestoreService';
import { Report, UserRole } from '../../types';
import { Button } from '../ui/Button';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RESOLVED'>('PENDING');

  useEffect(() => {
    const unsub = listenToReports(setReports);
    setIsLoading(false);
    return () => unsub();
  }, []);

  const handleResolve = async (id: string) => {
    await updateReportStatus(id, 'RESOLVED');
  };

  const handleSuspend = async (report: Report) => {
    if (report.reportedRole === UserRole.WORKER) {
        await setWorkerStatus(report.reportedId, 'suspended');
    } else {
        await setUserStatus(report.reportedId, 'suspended');
    }
    await updateReportStatus(report.id, 'RESOLVED');
    alert(`Account ${report.reportedName} has been suspended across the network.`);
  };

  const filteredReports = reports.filter(r => r.status === activeTab);

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex gap-8 border-b border-slate-100 w-full md:w-auto">
                <button onClick={() => setActiveTab('PENDING')} className={`pb-4 px-1 text-xs font-black uppercase tracking-widest border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'PENDING' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Pending Signals ({reports.filter(r => r.status === 'PENDING').length})</button>
                <button onClick={() => setActiveTab('RESOLVED')} className={`pb-4 px-1 text-xs font-black uppercase tracking-widest border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'RESOLVED' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Resolved Signals ({reports.filter(r => r.status === 'RESOLVED').length})</button>
            </div>
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span className="text-[10px] font-black text-red-800 uppercase tracking-widest">Protocol Safety Dashboard</span>
            </div>
        </div>

        {filteredReports.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                <ShieldCheck className="w-16 h-16 mb-6 text-slate-100" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">No Misconduct Signals Detected</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReports.map(report => (
                    <div key={report.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all relative group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-lg leading-none">{report.reason}</h4>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" /> {new Date(report.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-slate-50 px-3 py-1 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">#{report.id.slice(-5)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reporter Signal</p>
                                <p className="text-sm font-bold text-slate-900">{report.reporterName}</p>
                            </div>
                            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Reported Target</p>
                                <p className="text-sm font-bold text-slate-900">{report.reportedName}</p>
                                <p className="text-[8px] font-black text-red-600 uppercase tracking-tighter mt-1">{report.reportedRole}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-inner text-white/90 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <MessageCircle className="w-16 h-16" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest mb-2 text-blue-400">Statement Details</p>
                            <p className="text-sm italic font-medium leading-relaxed">"{report.details}"</p>
                            {report.jobId && (
                                <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Related Interaction: <span className="text-white">{report.jobId}</span></p>
                            )}
                        </div>

                        {activeTab === 'PENDING' && (
                            <div className="flex gap-3 mt-2">
                                <button 
                                    onClick={() => handleResolve(report.id)}
                                    className="flex-1 h-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Dismiss Report
                                </button>
                                <button 
                                    onClick={() => handleSuspend(report)}
                                    className="flex-[2] h-14 rounded-2xl bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                                >
                                    <UserX className="w-5 h-5" /> Terminate Node Access
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
