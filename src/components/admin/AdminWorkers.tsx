
import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, UserX, UserCheck, Trash2, X, ShieldCheck, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { getAllWorkers, saveWorkerProfile, setWorkerStatus, deleteWorker } from '../../services/firestoreService';
import { WorkerProfile } from '../../types';
import { Button } from '../ui/Button';
import { AVAILABLE_SKILLS } from '../../constants';

export const AdminWorkers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VERIFICATIONS'>('ALL');

  const fetchWorkers = async () => {
      setIsLoading(true);
      setError(null);
      try {
          const data = await getAllWorkers(true); // admin mode = true (fetch all regardless of status)
          setWorkers(data);
      } catch (e) {
          console.error(e);
          setError("Failed to synchronize expert directory.");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData(e.currentTarget);
      const phone = formData.get('phone') as string;
      const name = formData.get('name') as string;
      const skill = formData.get('skill') as string;
      const rate = Number(formData.get('rate'));

      if (!phone || !name || !skill || !rate) {
          setError("All profile fields are mandatory for node activation.");
          setIsSubmitting(false);
          return;
      }

      const newWorker: WorkerProfile = {
          id: `wrk-${Date.now()}`,
          phone,
          name,
          skill,
          rating: 5.0,
          reviewCount: 0,
          distanceKm: 0,
          hourlyRate: rate,
          isOnline: true,
          avatarUrl: `https://i.pravatar.cc/150?u=${phone}`,
          bio: 'Verified professional profile created by administrator.',
          verificationStatus: 'verified',
          coordinates: { x: 50, y: 50 },
          lifetimeJobsCompleted: 0,
          totalEarned: 0,
          status: 'active'
      };

      try {
          await saveWorkerProfile(newWorker);
          setIsAdding(false);
          await fetchWorkers();
      } catch (err: any) {
          console.error("Worker Creation Error:", err);
          setError(err.message || "Database collision or network error.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleVerification = async (worker: WorkerProfile, status: 'verified' | 'unverified') => {
      const updated = { ...worker, verificationStatus: status };
      await saveWorkerProfile(updated);
      fetchWorkers();
  };

  const handleToggleStatus = async (worker: WorkerProfile) => {
      const newStatus = worker.status === 'suspended' ? 'active' : 'suspended';
      try {
          await setWorkerStatus(worker.id, newStatus);
          await fetchWorkers();
      } catch (e) {
          alert("Status toggle failed.");
      }
  };

  const pendingWorkers = workers.filter(w => w.verificationStatus === 'pending');
  const filteredWorkers = workers.filter(w => 
      (w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.skill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone?.includes(searchTerm)) &&
      (activeTab === 'ALL' || w.verificationStatus === 'pending')
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-xl font-black text-slate-900">Experts Directory</h2>
                <div className="flex gap-4 mt-2">
                    <button onClick={() => setActiveTab('ALL')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'ALL' ? 'text-blue-600 underline' : 'text-slate-400'}`}>All Experts</button>
                    <button onClick={() => setActiveTab('VERIFICATIONS')} className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${activeTab === 'VERIFICATIONS' ? 'text-blue-600 underline' : 'text-slate-400'}`}>
                        Pending Verifications 
                        {pendingWorkers.length > 0 && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">{pendingWorkers.length}</span>}
                    </button>
                </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button onClick={fetchWorkers} disabled={isLoading} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-100 transition-all active:scale-95">
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <div className="relative flex-1 md:flex-none">
                    <input 
                        type="text" 
                        placeholder="Search experts..." 
                        className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-full md:w-64 outline-none focus:border-blue-500 font-medium" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <Button onClick={() => setIsAdding(true)} className="rounded-xl whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-2" /> Add Professional
                </Button>
            </div>
        </div>

        {activeTab === 'VERIFICATIONS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingWorkers.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No pending verifications</div>
                ) : (
                    pendingWorkers.map(worker => (
                        <div key={worker.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <img src={worker.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-black text-slate-900">{worker.name}</h4>
                                    <p className="text-xs text-slate-500">{worker.phone}</p>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID Proof</p>
                                {worker.idProofUrl ? (
                                    <img src={worker.idProofUrl} className="w-full h-32 object-cover rounded-xl border border-slate-100" />
                                ) : (
                                    <div className="w-full h-32 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 text-xs">No Image</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button fullWidth className="bg-green-600 hover:bg-green-700 h-10 text-xs" onClick={() => handleVerification(worker, 'verified')}>
                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button fullWidth variant="danger" className="h-10 text-xs" onClick={() => handleVerification(worker, 'unverified')}>
                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'ALL' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading && workers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-32 text-slate-300">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Records...</span>
                    </div>
                ) : filteredWorkers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-32 text-slate-300">
                        <UserX className="w-12 h-12 mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Experts Found</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b text-slate-400 uppercase font-black text-[9px] tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Expert Profile</th>
                                    <th className="px-8 py-6">Service Category</th>
                                    <th className="px-8 py-6">Verification</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredWorkers.map((worker) => (
                                    <tr key={worker.id} className={`hover:bg-slate-50 transition-colors ${worker.status === 'suspended' ? 'bg-red-50/20' : ''}`}>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <img src={worker.avatarUrl} className="w-10 h-10 rounded-2xl object-cover border border-slate-100 shadow-sm" alt="" />
                                                <div>
                                                    <p className="font-black text-slate-900 leading-none">{worker.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{worker.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                                {worker.skill}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                worker.verificationStatus === 'verified' ? 'bg-green-50 text-green-600 border-green-100' :
                                                worker.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-slate-50 text-slate-400 border-slate-200'
                                            }`}>
                                                {worker.verificationStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleToggleStatus(worker)} 
                                                    className={`p-2 rounded-xl transition-all ${worker.status === 'suspended' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`} 
                                                    title="Toggle Access"
                                                >
                                                    {worker.status === 'suspended' ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                                                </button>
                                                <button 
                                                    onClick={() => { if(confirm("Permanently delete this expert?")) deleteWorker(worker.id).then(fetchWorkers); }} 
                                                    className="p-2 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-slate-100" 
                                                    title="Delete Profile"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

        {/* Add Worker Modal (Same as before) */}
        {isAdding && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
                <form onSubmit={handleCreateWorker} className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-scaleIn space-y-6 relative">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                            <h3 className="text-2xl font-black text-slate-900">New Pro Profile</h3>
                        </div>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-red-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 border border-red-100 animate-slideDown">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                            <input name="name" required disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contact Phone</label>
                            <input name="phone" required disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500 disabled:opacity-50" placeholder="10-digit mobile" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Primary Skill</label>
                            <select name="skill" required disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500 appearance-none disabled:opacity-50">
                                <option value="">Select Category</option>
                                {AVAILABLE_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Base Project Rate (₹)</label>
                            <input name="rate" type="number" required disabled={isSubmitting} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" fullWidth onClick={() => setIsAdding(false)} disabled={isSubmitting} className="h-14 font-black">Cancel</Button>
                        <Button type="submit" fullWidth disabled={isSubmitting} className="h-14 rounded-2xl shadow-xl shadow-blue-600/20">
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Launch Node Access'}
                        </Button>
                    </div>
                </form>
            </div>
        )}
    </div>
  );
};
