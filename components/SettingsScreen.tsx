
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, UserProfile, UserPreferences, Language } from '../types';
import { 
  Bell, Globe, LogOut, ChevronRight, Shield, HelpCircle, FileText, Camera, 
  User, X, Mail, Phone, Calendar, ArrowLeft, ChevronDown, RefreshCw, 
  Wallet, CreditCard, Receipt, Smartphone, Trash2, IndianRupee, 
  Plus, History, Briefcase, Settings, SlidersHorizontal, Lock, ShieldCheck, 
  LifeBuoy, MessageSquare, Info, ChevronUp, Check, Loader2, Edit2, Save, AlertTriangle
} from 'lucide-react';
import { Button } from './ui/Button';
import { getCMSContent, saveUserProfile, deleteUser, deleteWorker } from '../services/firestoreService';
import { useTranslation } from '../translations';

interface SettingsScreenProps {
  role: UserRole;
  onLogout: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigateToWorks?: () => void;
}

type SettingsView = 'MAIN' | 'PRIVACY' | 'HELP' | 'WALLET' | 'PREFERENCES' | 'TERMS' | 'LANGUAGE' | 'EDIT_PROFILE';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  role, 
  onLogout, 
  userProfile, 
  onUpdateProfile,
  onNavigateToWorks
}) => {
  const [currentView, setCurrentView] = useState<SettingsView>('MAIN');
  const [cmsPages, setCmsPages] = useState<any[]>([]);
  const [loadingCMS, setLoadingCMS] = useState(false);
  
  // Profile Edit State
  const [editForm, setEditForm] = useState<Partial<UserProfile> & { newPassword?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lang = userProfile.language || 'en';
  const t = useTranslation(lang);

  const isWorker = role === UserRole.WORKER;

  useEffect(() => {
    if (['PRIVACY', 'HELP', 'TERMS'].includes(currentView)) {
        setLoadingCMS(true);
        getCMSContent().then(data => {
            setCmsPages(data);
            setLoadingCMS(false);
        });
    }
  }, [currentView]);

  useEffect(() => {
      if (currentView === 'EDIT_PROFILE') {
          setEditForm({ ...userProfile, newPassword: '' });
      }
  }, [currentView, userProfile]);

  const handleLanguageChange = async (newLang: Language) => {
      localStorage.setItem('sl_lang', newLang);
      const updatedProfile = { ...userProfile, language: newLang };
      onUpdateProfile(updatedProfile);
      await saveUserProfile(updatedProfile);
  };

  const handleProfileSave = async () => {
      if (!editForm.firstName || !editForm.phone) return;
      setIsSaving(true);
      
      const updatedProfile = { ...userProfile, ...editForm };
      
      // Construct payload, including password if changed
      const payload: any = { ...updatedProfile };
      if (editForm.newPassword && editForm.newPassword.length > 0) {
          payload.password = editForm.newPassword;
      }
      delete payload.newPassword; // Don't save the temporary field to local state if not needed, but sending 'password' to backend

      // Persist to backend
      await saveUserProfile(payload);
      
      // Update local state (excluding password)
      onUpdateProfile(updatedProfile);
      
      setIsSaving(false);
      setCurrentView('MAIN');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleDeleteAccount = async () => {
      setIsDeleting(true);
      try {
          if (role === UserRole.WORKER) {
              // Delete worker record if any, then user record
              await deleteUser(userProfile.phone);
          } else {
              await deleteUser(userProfile.phone);
          }
          onLogout();
      } catch (e) {
          alert("Failed to delete account. Please try again.");
          setIsDeleting(false);
          setShowDeleteConfirm(false);
      }
  };

  const getPageContent = (slug: string) => {
      const page = cmsPages.find(p => p.slug === slug);
      return page ? { title: page.title, content: page.content } : { title: 'Loading...', content: '' };
  };

  const CMSRenderer = ({ slug }: { slug: string }) => {
    const { title, content } = getPageContent(slug);
    return (
        <div className="h-full bg-slate-50 flex flex-col animate-fadeIn">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 sticky top-0 bg-white z-10">
                <button onClick={() => setCurrentView('MAIN')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-700" /></button>
                <h1 className="text-lg font-black text-slate-900">{title}</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                {loadingCMS ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-700" /></div>
                ) : (
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{content}</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  if (currentView === 'PRIVACY') return <CMSRenderer slug="privacy" />;
  if (currentView === 'TERMS') return <CMSRenderer slug="terms" />;
  if (currentView === 'HELP') return <CMSRenderer slug="help" />;
  
  if (currentView === 'LANGUAGE') {
    return (
      <div className="h-full bg-slate-50 flex flex-col animate-fadeIn">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 sticky top-0 bg-white z-10">
          <button onClick={() => setCurrentView('MAIN')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-700" /></button>
          <h1 className="text-lg font-black text-slate-900">{t.change_language}</h1>
        </div>
        <div className="p-6 space-y-4">
             <button 
                onClick={() => handleLanguageChange('en')}
                className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${lang === 'en' ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900'}`}
             >
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${lang === 'en' ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-500'}`}>A</div>
                    <div className="text-left">
                        <p className="font-black text-lg">English</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${lang === 'en' ? 'text-blue-200' : 'text-slate-400'}`}>Default</p>
                    </div>
                 </div>
                 {lang === 'en' && <Check className="w-5 h-5" />}
             </button>

             <button 
                onClick={() => handleLanguageChange('hi')}
                className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${lang === 'hi' ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900'}`}
             >
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${lang === 'hi' ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-500'}`}>अ</div>
                    <div className="text-left">
                        <p className="font-black text-lg">हिन्दी</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${lang === 'hi' ? 'text-blue-200' : 'text-slate-400'}`}>Hindi</p>
                    </div>
                 </div>
                 {lang === 'hi' && <Check className="w-5 h-5" />}
             </button>
        </div>
      </div>
    );
  }
  
  if (currentView === 'WALLET') {
    // Basic User Wallet View - Workers use the WorkerWallet component in Dashboard
    return (
      <div className="h-full bg-slate-50 flex flex-col animate-fadeIn">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 sticky top-0 bg-white z-10">
          <button onClick={() => setCurrentView('MAIN')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-700" /></button>
          <h1 className="text-lg font-black text-slate-900">{t.wallet}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10"><IndianRupee className="w-32 h-32" /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2">Available Balance</p>
              <h2 className="text-5xl font-black mb-8 flex items-center gap-2"><IndianRupee className="w-8 h-8 text-green-400" /> {userProfile.walletBalance?.toFixed(2) || '0.00'}</h2>
              <div className="flex gap-3">
                <Button size="sm" className="bg-white border-none px-6" style={{ color: '#0f172a' }}><Plus className="w-4 h-4 mr-2" /> Top Up</Button>
                <Button size="sm" variant="ghost" className="text-white border border-white/40"><History className="w-4 h-4 mr-2" /> History</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'EDIT_PROFILE') {
      return (
        <div className="h-full bg-slate-50 flex flex-col animate-fadeIn">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentView('MAIN')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-700" /></button>
                    <h1 className="text-lg font-black text-slate-900">{t.edit_profile}</h1>
                </div>
                <button onClick={handleProfileSave} disabled={isSaving} className="text-blue-600 font-bold text-sm disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <img src={editForm.avatarUrl || userProfile.avatarUrl} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-lg" alt="" />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-xl border-2 border-white shadow-md active:scale-95 transition-all"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Change Photo</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                            <input 
                                type="text" 
                                value={editForm.firstName} 
                                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                            <input 
                                type="text" 
                                value={editForm.lastName} 
                                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                        <input 
                            type="tel" 
                            value={editForm.phone} 
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            value={editForm.email} 
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date of Birth</label>
                            <input 
                                type="date" 
                                value={editForm.dob || ''} 
                                onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                            <input 
                                type="password" 
                                value={editForm.newPassword || ''} 
                                onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                                placeholder="Change Password"
                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="h-full bg-slate-50 flex flex-col relative overflow-hidden">
      <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">{t.settings}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
           <div className="relative mb-4">
              <img src={userProfile.avatarUrl} className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-md" />
           </div>
           <h3 className="font-black text-slate-900 text-xl">{userProfile.firstName} {userProfile.lastName}</h3>
           <p className="text-xs text-slate-600 font-black uppercase tracking-widest mt-1">{userProfile.phone}</p>
           
           <button 
             onClick={() => setCurrentView('EDIT_PROFILE')} 
             className="mt-4 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 border border-slate-100 transition-all"
           >
               <Edit2 className="w-3 h-3" /> {t.edit_profile}
           </button>
        </div>

        {/* Dynamic Buttons based on Role */}
        <div className={`grid ${isWorker ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
          {!isWorker && (
            <button onClick={() => setCurrentView('WALLET')} className="bg-slate-900 text-white p-5 rounded-[2rem] flex flex-col items-start gap-3 shadow-xl text-left transition-all active:scale-95">
              <div className="bg-white/10 p-2.5 rounded-2xl"><Wallet className="w-5 h-5 text-blue-300" /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-white/60">{t.wallet}</p><p className="font-bold text-lg">₹{userProfile.walletBalance?.toFixed(0) || '0'}</p></div>
            </button>
          )}
          {!isWorker && (
            <button onClick={onNavigateToWorks} className="bg-white border border-slate-200 p-5 rounded-[2rem] flex flex-col items-start gap-3 shadow-sm text-left transition-all active:scale-95">
              <div className="bg-indigo-50 p-2.5 rounded-2xl"><Briefcase className="w-5 h-5 text-indigo-700" /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.my_kaam}</p><p className="font-bold text-lg text-slate-900">{t.history}</p></div>
            </button>
          )}
        </div>

        <div className="space-y-4">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">Personalization</h3>
           <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden divide-y divide-slate-100">
              <SettingsLink icon={<Globe className="w-5 h-5 text-blue-700" />} title={t.language} sub={t.change_language} onClick={() => setCurrentView('LANGUAGE')} />
              <SettingsLink icon={<Shield className="w-5 h-5 text-green-700" />} title={t.privacy} sub="Identity & Account safety" onClick={() => setCurrentView('PRIVACY')} />
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">App Support</h3>
           <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden divide-y divide-slate-100">
              <SettingsLink icon={<HelpCircle className="w-5 h-5 text-amber-700" />} title={t.help} sub="FAQs & Support chat" onClick={() => setCurrentView('HELP')} />
              <SettingsLink icon={<FileText className="w-5 h-5 text-indigo-700" />} title={t.terms} sub="Legal policies & Agreements" onClick={() => setCurrentView('TERMS')} />
           </div>
        </div>

        <div className="pt-6 pb-12 space-y-4">
            <Button variant="secondary" fullWidth className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-600 bg-slate-100" onClick={onLogout}>
              <LogOut className="w-5 h-5 mr-3" /> {t.logout}
            </Button>
            
            <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-center text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-600 py-4"
            >
                Delete Account Permanently
            </button>
        </div>
      </div>

      {showDeleteConfirm && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-scaleIn text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Delete Account?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8">
                      This action cannot be undone. All your data, history, and earnings will be permanently erased.
                  </p>
                  <div className="space-y-3">
                      <Button 
                        variant="danger" 
                        fullWidth 
                        onClick={handleDeleteAccount} 
                        disabled={isDeleting}
                        className="h-14 rounded-2xl shadow-xl shadow-red-600/20"
                      >
                          {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete Everything'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        fullWidth 
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="h-14 font-black"
                      >
                          Cancel
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const SettingsLink = ({ icon, title, sub, onClick }: any) => (
  <button onClick={onClick} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</p>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight opacity-80">{sub}</p>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-400" />
  </button>
);
