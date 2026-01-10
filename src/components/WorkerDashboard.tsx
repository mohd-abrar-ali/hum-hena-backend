
import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { ServiceCategory, PlatformFeeConfig, WorkerProfile } from '../types';
import { Power, IndianRupee, TrendingUp, Shield, Loader2, Check, Clock } from 'lucide-react';
import { saveWorkerProfile } from '../services/firestoreService';
import { uploadFile } from '../services/apiService';
import { SKILL_TAGS } from '../constants';
import { useTranslation } from '../translations';
import { WorkerPortfolio } from './WorkerPortfolio';
import { WorkerWallet } from './WorkerWallet';

interface WorkerDashboardProps {
    categories: ServiceCategory[];
    feeConfig: PlatformFeeConfig;
    currentWorker: WorkerProfile;
    onUpdateWorker: (worker: WorkerProfile) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ categories, feeConfig, currentWorker, onUpdateWorker }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'verification'>('stats');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingID, setIsUploadingID] = useState(false);
  const [tempBio, setTempBio] = useState(currentWorker.bio || '');
  const [tempTags, setTempTags] = useState<string[]>(currentWorker.tags || []);
  const [showWallet, setShowWallet] = useState(false);
  
  const lang = (localStorage.getItem('sl_lang') || 'en') as any;
  const t = useTranslation(lang);

  const idProofRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
      setIsSaving(true);
      const updated = { ...currentWorker, bio: tempBio, tags: tempTags };
      await saveWorkerProfile(updated);
      onUpdateWorker(updated);
      setIsSaving(false);
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;

      setIsUploadingID(true);
      try {
          const url = await uploadFile(file);
          const updated = { 
              ...currentWorker, 
              idProofUrl: url,
              verificationStatus: 'pending' as const
          };
          await saveWorkerProfile(updated);
          onUpdateWorker(updated);
          alert("Document uploaded! Admin verification pending.");
      } catch (error) {
          alert("Failed to upload document.");
      } finally {
          setIsUploadingID(false);
      }
  };

  const toggleTag = (tag: string) => {
    setTempTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleOnline = () => {
    if (currentWorker.verificationStatus !== 'verified') {
        alert("You must be verified by admin to go online.");
        return;
    }
    const updated = {...currentWorker, isOnline: !currentWorker.isOnline};
    onUpdateWorker(updated);
    saveWorkerProfile(updated);
  };

  const availableSkillTags = currentWorker.skill ? SKILL_TAGS[currentWorker.skill] || [] : [];

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden relative">
      <div className="bg-white px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={currentWorker.avatarUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="avatar" />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${currentWorker.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <div>
                      <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">{currentWorker.name}</h1>
                      <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">{currentWorker.skill}</span>
                          {currentWorker.verificationStatus === 'pending' && <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">Pending Verification</span>}
                      </div>
                  </div>
              </div>
              <button onClick={toggleOnline} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${currentWorker.isOnline ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                  <Power className="w-4 h-4" /> {currentWorker.isOnline ? 'Online' : 'Offline'}
              </button>
          </div>

          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
              <button onClick={() => setActiveTab('stats')} className={`flex-1 min-w-[70px] py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Stats</button>
              <button onClick={() => setActiveTab('profile')} className={`flex-1 min-w-[70px] py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Profile</button>
              <button onClick={() => setActiveTab('verification')} className={`flex-1 min-w-[70px] py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'verification' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Auth</button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {activeTab === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => setShowWallet(true)}
                        className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Net Earnings</p>
                            <IndianRupee className="w-5 h-5 text-white opacity-20" />
                        </div>
                        <h2 className="text-4xl font-black">₹{currentWorker.totalEarned?.toLocaleString()}</h2>
                        {/* Fixed Wallet Button Colors - Forced Text Color */}
                        <Button 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); setShowWallet(true); }} 
                            className="bg-white !text-slate-900 mt-6 rounded-lg w-full hover:bg-slate-100 border-none font-black"
                            style={{ color: '#0f172a' }}
                        >
                            Withdraw / Wallet
                        </Button>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Jobs Done</p>
                        <h2 className="text-4xl font-black text-slate-900">{currentWorker.lifetimeJobsCompleted}</h2>
                        <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] mt-4 uppercase">
                            <TrendingUp className="w-4 h-4" /> 100% Reliable
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-slate-900 uppercase text-[10px]">Expert Bio</h3>
                            <button onClick={handleSaveProfile} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                        <textarea value={tempBio} onChange={(e) => setTempBio(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl text-sm font-medium h-32 outline-none focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all mb-6" />
                        
                        {availableSkillTags.length > 0 && (
                            <div>
                                <h3 className="font-black text-slate-900 uppercase text-[10px] mb-3">Skill Tags</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {availableSkillTags.map(tag => {
                                        const isSelected = tempTags.includes(tag);
                                        return (
                                            <button 
                                                key={tag} 
                                                onClick={() => toggleTag(tag)} 
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                                    isSelected 
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                <span>{tag}</span>
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <WorkerPortfolio worker={currentWorker} onUpdate={onUpdateWorker} />
                    </div>
                </div>
            )}

            {activeTab === 'verification' && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center shadow-sm max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Expert Auth</h3>
                    <p className="text-sm text-slate-400 mt-2 mb-6 font-medium">
                        Status: <span className={`uppercase font-black ${currentWorker.verificationStatus === 'verified' ? 'text-green-600' : 'text-amber-500'}`}>{currentWorker.verificationStatus}</span>
                    </p>
                    
                    {currentWorker.idProofUrl ? (
                        <div className="space-y-4">
                            <div className="aspect-video bg-slate-50 rounded-2xl overflow-hidden border">
                                <img src={currentWorker.idProofUrl} className="w-full h-full object-cover" />
                            </div>
                            {currentWorker.verificationStatus !== 'verified' && (
                                <div className="p-4 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Admin Review Pending
                                </div>
                            )}
                            <Button variant="outline" fullWidth onClick={() => idProofRef.current?.click()} disabled={isUploadingID}>
                                {isUploadingID ? <Loader2 className="animate-spin" /> : 'Update ID'}
                            </Button>
                        </div>
                    ) : (
                        <Button fullWidth onClick={() => idProofRef.current?.click()} disabled={isUploadingID}>
                            {isUploadingID ? <Loader2 className="animate-spin" /> : 'Upload ID Signal'}
                        </Button>
                    )}
                    <input type="file" ref={idProofRef} className="hidden" onChange={handleIdUpload} />
                </div>
            )}
        </div>
      </div>

      {showWallet && (
          <WorkerWallet worker={currentWorker} onClose={() => setShowWallet(false)} />
      )}
    </div>
  );
};
