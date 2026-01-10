
import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { UserProfile, UserRole, WorkerProfile, Gender } from '../types';
import { Camera, Shield, IndianRupee, User, Sparkles, FileText, FileCheck, Check } from 'lucide-react';
import { AVAILABLE_SKILLS, SKILL_TAGS, GENDER_OPTIONS } from '../constants';

interface OnboardingScreenProps {
  role: UserRole;
  initialPhone: string;
  currentProfile?: UserProfile;
  onComplete: (profile: UserProfile, workerDetails?: Partial<WorkerProfile>) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ role, initialPhone, currentProfile, onComplete }) => {
  const [step, setStep] = useState(currentProfile ? 2 : 1);
  const [profile, setProfile] = useState<UserProfile>(currentProfile || {
    firstName: '',
    lastName: '',
    email: '',
    phone: initialPhone,
    gender: 'Male',
    dob: '',
    avatarUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  });

  const [workerDetails, setWorkerDetails] = useState<Partial<WorkerProfile>>({
    skill: '',
    hourlyRate: 300,
    bio: '',
    idProofUrl: '', // Optional now during onboarding
    tags: []
  });

  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setProfile({...profile, avatarUrl: reader.result as string});
        reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    setWorkerDetails(prev => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const nextStep = () => {
    if (step === 1 && role === UserRole.WORKER) setStep(2);
    else onComplete(profile, workerDetails);
  };

  const currentSkillTags = workerDetails.skill ? SKILL_TAGS[workerDetails.skill] : [];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 py-12 animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mt-32 blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mb-32 blur-3xl opacity-40"></div>

        <div className="w-full max-w-xs flex flex-col items-center relative z-10">
            <div className="mb-12 text-center">
                <div className="relative inline-block mb-8">
                    <img 
                        src={profile.avatarUrl} 
                        className="w-24 h-24 rounded-[2rem] border-4 border-white shadow-2xl object-cover rotate-3" 
                        alt=""
                    />
                    <button 
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl border-4 border-white shadow-xl active:scale-90 transition-all"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileRef} className="hidden" onChange={handleAvatar} accept="image/*" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
                    {step === 1 ? 'Profile Info' : 'Work Identity'}
                </h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    Step {step} of {role === UserRole.WORKER ? 2 : 1}
                </p>
            </div>

            <div className="w-full space-y-4">
                {step === 1 ? (
                    <div className="space-y-4 animate-scaleIn">
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus-within:bg-white focus-within:border-blue-600 transition-all shadow-sm">
                            <User className="w-4 h-4 text-slate-200 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="First Name" 
                                value={profile.firstName} 
                                onChange={e => setProfile({...profile, firstName: e.target.value})}
                                className="flex-1 bg-transparent border-none p-0 font-black text-base text-slate-900 focus:ring-0 outline-none placeholder:text-slate-200"
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Last Name" 
                            value={profile.lastName} 
                            onChange={e => setProfile({...profile, lastName: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-base text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm placeholder:text-slate-200"
                        />
                        <div className="grid grid-cols-3 gap-2">
                            {GENDER_OPTIONS.map(g => (
                                <button 
                                    key={g} 
                                    onClick={() => setProfile({...profile, gender: g})}
                                    className={`py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${profile.gender === g ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-scaleIn max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Professional Skill</label>
                            <select 
                                value={workerDetails.skill} 
                                onChange={e => setWorkerDetails({...workerDetails, skill: e.target.value, tags: []})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm appearance-none"
                            >
                                <option value="">Select Skill Set</option>
                                {AVAILABLE_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {currentSkillTags.length > 0 && (
                            <div className="animate-fadeIn">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Expertise Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {currentSkillTags.map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${workerDetails.tags?.includes(tag) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Expert Bio</label>
                            <textarea 
                                placeholder="Describe your experience..." 
                                value={workerDetails.bio} 
                                onChange={e => setWorkerDetails({...workerDetails, bio: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm h-24 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Base Price (Per Project)</label>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus-within:bg-white focus-within:border-blue-600 transition-all shadow-sm">
                                <IndianRupee className="w-4 h-4 text-slate-200 shrink-0" />
                                <input 
                                    type="number" 
                                    placeholder="e.g. 500"
                                    value={workerDetails.hourlyRate} 
                                    onChange={e => setWorkerDetails({...workerDetails, hourlyRate: Number(e.target.value)})}
                                    className="flex-1 bg-transparent border-none p-0 font-black text-base text-slate-900 focus:ring-0 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 pt-4">
                    {step === 2 && !currentProfile && (
                        <button onClick={() => setStep(1)} className="flex-1 h-16 rounded-[1.5rem] bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                            Back
                        </button>
                    )}
                    <Button fullWidth onClick={nextStep} disabled={!profile.firstName || (step === 2 && (!workerDetails.skill || !workerDetails.bio))} className="h-16 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">
                        {step === 1 && role === UserRole.WORKER ? 'Next' : 'Launch Profile'}
                    </Button>
                </div>
            </div>

            <div className="mt-8 text-center opacity-30 grayscale pointer-events-none">
                <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Protocol Verified Identity</span>
                </div>
            </div>
        </div>
    </div>
  );
};
