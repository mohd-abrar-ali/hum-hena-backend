
import React, { useState, useEffect } from 'react';
import { UserRole, WorkerProfile, JobRequest, UserProfile, ServiceCategory, PlatformFeeConfig, Language, JobStatus } from './types';
import { RoleSelection } from './components/RoleSelection';
import { LandingPage } from './components/LandingPage';
import { LanguageSelection } from './components/LanguageSelection';
import { CustomerView } from './components/CustomerView';
import { WorkerDashboard } from './components/WorkerDashboard';
import { WorkerProfileDetail } from './components/WorkerProfileDetail';
import { BookingModal } from './components/BookingModal';
import { PostJobModal } from './components/PostJobModal';
import { CustomerJobHistory } from './components/CustomerJobHistory';
import { WorkerJobRequests } from './components/WorkerJobRequests';
import { LiveTrackingScreen } from './components/LiveTrackingScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { ChatScreen } from './components/ChatScreen';
import { GuidedTour } from './components/GuidedTour';
import { WorkerIncomingCallScreen } from './components/WorkerIncomingCallScreen';
import { 
  getUserProfile, 
  saveUserProfile, 
  saveWorkerProfile, 
  listenToCategories, 
  listenToPlatformConfig, 
  listenToMyJobs,
  postJob,
  listenToBroadcastJobs,
  getAllWorkers,
  updateJobStatus
} from './services/firestoreService';
import { Home, Briefcase, User, LayoutGrid, Settings, Zap, Info, WifiOff } from 'lucide-react';
import { useTranslation } from './translations';
import { DEFAULT_SERVICE_CATEGORIES, DEFAULT_FEE_CONFIG } from './constants';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  
  // Initialize language from localStorage to persist choice across reloads
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('sl_lang') as Language) || 'en');
  const [hasSelectedLang, setHasSelectedLang] = useState(() => !!localStorage.getItem('sl_lang'));
  
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(DEFAULT_SERVICE_CATEGORIES);
  const [feeConfig, setFeeConfig] = useState<PlatformFeeConfig>(DEFAULT_FEE_CONFIG);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '', lastName: '', email: '', phone: '', gender: '', dob: '', avatarUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    walletBalance: 1000, language: 'en'
  });
  
  const [activeWorkerProfile, setActiveWorkerProfile] = useState<WorkerProfile | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [customerNav, setCustomerNav] = useState<'home' | 'jobs' | 'profile'>('home');
  const [workerNav, setWorkerNav] = useState<'home' | 'requests' | 'menu'>('home');
  const [myJobs, setMyJobs] = useState<JobRequest[]>([]);
  const [broadcastJobs, setBroadcastJobs] = useState<JobRequest[]>([]);
  const [trackingJob, setTrackingJob] = useState<JobRequest | null>(null);
  const [chattingJob, setChattingJob] = useState<JobRequest | null>(null);
  const [incomingJob, setIncomingJob] = useState<JobRequest | null>(null); 
  const [alertedJobIds, setAlertedJobIds] = useState<Set<string>>(new Set()); 
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => localStorage.getItem('hh_admin_session') === 'active');

  useEffect(() => {
    localStorage.setItem('sl_lang', language);
  }, [language]);

  useEffect(() => {
    const checkHash = () => {
      const is_admin = window.location.hash === '#/admin';
      setIsAdminRoute(is_admin);
      if (is_admin) {
        setShowSplash(false);
        setShowLanding(false);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
        const storedPhone = localStorage.getItem('hh_phone');
        const storedRole = localStorage.getItem('hh_role') as UserRole;

        if (storedPhone && storedRole) {
            try {
                const profile = await getUserProfile(storedPhone);
                if (profile) {
                    setUserProfile(profile);
                    setRole(storedRole);
                    setIsLoggedIn(true);
                    setShowLanding(false);
                    
                    if (profile.language) {
                        setLanguage(profile.language);
                        setHasSelectedLang(true); 
                    }

                    if (storedRole === UserRole.WORKER) {
                        const all = await getAllWorkers(true);
                        const w = all.find(x => x.phone === storedPhone);
                        if (w) setActiveWorkerProfile(w);
                    }
                }
            } catch (e) {
                console.error("Session restore error", e);
                localStorage.removeItem('hh_phone');
                localStorage.removeItem('hh_role');
            }
        }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    const unsubConfig = listenToPlatformConfig((config) => setFeeConfig(config));
    const unsubCats = listenToCategories((cats) => cats.length > 0 && setServiceCategories(cats));
    return () => { unsubConfig(); unsubCats(); };
  }, []);

  useEffect(() => {
    if (isLoggedIn && userProfile.phone) {
        const unsub = listenToMyJobs(userProfile.phone, role, (jobs) => {
            setMyJobs(jobs || []);
            if (role === UserRole.WORKER) {
                const pendingJob = jobs?.find(j => j.status === 'PENDING' && !j.isBroadcast);
                if (pendingJob && (!incomingJob || incomingJob.id !== pendingJob.id)) {
                    setIncomingJob(pendingJob);
                } else if (!pendingJob && incomingJob) {
                    setIncomingJob(null);
                }
            }
        });
        return () => unsub();
    }
  }, [isLoggedIn, userProfile.phone, role, incomingJob]);

  useEffect(() => {
    if (isLoggedIn && role === UserRole.WORKER) {
        const unsub = listenToBroadcastJobs((jobs) => {
            setBroadcastJobs(jobs || []);
            
            if (activeWorkerProfile) {
                const matchingJob = jobs.find(j => 
                    j.status === 'OPEN' && 
                    j.skill === activeWorkerProfile.skill && 
                    !alertedJobIds.has(j.id)
                );

                if (matchingJob) {
                    setIncomingJob(matchingJob);
                    setAlertedJobIds(prev => {
                        const next = new Set(prev);
                        next.add(matchingJob.id);
                        return next;
                    });
                }
            }
        });
        return () => unsub();
    }
  }, [isLoggedIn, role, activeWorkerProfile, alertedJobIds]);

  const handleAuthSuccess = async (phone: string, forcedRole: UserRole) => {
    const existing = await getUserProfile(phone);
    setRole(forcedRole);
    localStorage.setItem('hh_phone', phone);
    localStorage.setItem('hh_role', forcedRole);

    if (existing) {
        setUserProfile(existing);
        if (existing.language) {
          setLanguage(existing.language);
          localStorage.setItem('sl_lang', existing.language);
          setHasSelectedLang(true);
        }
        setIsLoggedIn(true);
        setShowLanding(false);
        if (forcedRole === UserRole.WORKER) {
            const all = await getAllWorkers(true);
            const w = all.find(x => x.phone === phone);
            if (w) setActiveWorkerProfile(w);
        }
    } else {
        setUserProfile(p => ({...p, phone, language})); 
        setIsLoggedIn(true);
        setIsOnboarding(true);
    }
    return true;
  };

  const handleLogout = () => {
      localStorage.removeItem('hh_phone');
      localStorage.removeItem('hh_role');
      window.location.reload();
  };

  const handleOnboardingComplete = async (profile: UserProfile, workerDetails?: Partial<WorkerProfile>) => {
    const final = { ...profile, language, status: 'active' as const };
    await saveUserProfile(final);
    setUserProfile(final);
    setIsOnboarding(false);
    setShowTour(true);
    
    if (role === UserRole.WORKER) {
        const newWorker: WorkerProfile = {
            id: `wrk-${Date.now()}`, phone: final.phone, name: `${final.firstName} ${final.lastName}`,
            skill: workerDetails?.skill || 'General', rating: 5.0, reviewCount: 0, distanceKm: 0,
            hourlyRate: workerDetails?.hourlyRate || 300, isOnline: true, avatarUrl: final.avatarUrl,
            bio: workerDetails?.bio || '', verificationStatus: 'verified', coordinates: { x: 45, y: 45 },
            lifetimeJobsCompleted: 0, totalEarned: 0, status: 'active'
        };
        await saveWorkerProfile(newWorker);
        setActiveWorkerProfile(newWorker);
    }
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
    if (profile.language && profile.language !== language) {
        setLanguage(profile.language);
    }
    // If worker, ensure local active worker state is also updated to reflect changes immediately
    if (role === UserRole.WORKER && activeWorkerProfile) {
        setActiveWorkerProfile(prev => prev ? ({
            ...prev,
            name: `${profile.firstName} ${profile.lastName}`,
            avatarUrl: profile.avatarUrl
        }) : null);
    }
  };

  const handleAcceptJob = async (job: JobRequest) => {
      if (job.status === 'OPEN') {
          if (!activeWorkerProfile) return;
          // CRITICAL: Send phone number so 'my_jobs' query picks it up
          await updateJobStatus(job.id, 'ACCEPTED', {
              workerId: activeWorkerProfile.id,
              workerName: activeWorkerProfile.name,
              workerAvatar: activeWorkerProfile.avatarUrl,
              workerPhone: activeWorkerProfile.phone 
          });
      } else {
          await updateJobStatus(job.id, 'ACCEPTED');
      }
      setIncomingJob(null);
      setWorkerNav('requests');
  };

  const handleDeclineJob = async (job: JobRequest) => {
      if (job.status === 'PENDING') {
          await updateJobStatus(job.id, 'CANCELLED');
      }
      setIncomingJob(null);
  };

  if (isAdminRoute) {
    if (isAdminAuthenticated) {
        const displayAdminProfile = userProfile.firstName ? userProfile : {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@system.local',
            phone: '0000000000',
            role: UserRole.ADMIN,
            gender: 'Male',
            dob: '',
            avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
            status: 'active',
            adminPermissions: []
        } as UserProfile;

        return (
            <AdminLayout 
                currentUser={displayAdminProfile}
                onLogout={() => {
                    localStorage.removeItem('hh_admin_session');
                    setIsAdminAuthenticated(false);
                }} 
                categories={serviceCategories} 
                onUpdateCategories={setServiceCategories} 
                feeConfig={feeConfig} 
                onUpdateFeeConfig={setFeeConfig} 
            />
        );
    }
    return <AdminLogin onLoginSuccess={() => {
        localStorage.setItem('hh_admin_session', 'active');
        setIsAdminAuthenticated(true);
    }} />;
  }

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (!isLoggedIn && showLanding) return <LandingPage config={feeConfig} onGetStarted={() => setShowLanding(false)} />;
  
  if (!hasSelectedLang) return <LanguageSelection currentLanguage={language} onSelect={setLanguage} onConfirm={() => setHasSelectedLang(true)} />;
  
  if (!isLoggedIn && role === UserRole.GUEST) return <RoleSelection onSelect={setRole} />;
  if (!isLoggedIn) return <AuthScreen onSuccess={(phone) => handleAuthSuccess(phone, role)} roleText={role} onBack={() => setRole(UserRole.GUEST)} />;
  if (isOnboarding) return <OnboardingScreen role={role} initialPhone={userProfile.phone} onComplete={handleOnboardingComplete} />;

  if (incomingJob) return <WorkerIncomingCallScreen job={incomingJob} onAccept={() => handleAcceptJob(incomingJob)} onDecline={() => handleDeclineJob(incomingJob)} />;

  if (trackingJob) return (
    <LiveTrackingScreen 
        job={trackingJob} 
        perspective={role === UserRole.CUSTOMER ? 'customer' : 'worker'} 
        onBack={() => setTrackingJob(null)} 
        onChat={() => setChattingJob(trackingJob)} 
        onCall={() => {
            const targetPhone = role === UserRole.CUSTOMER ? trackingJob.workerPhone : trackingJob.customerPhone;
            if (targetPhone) {
                window.location.href = `tel:${targetPhone}`;
            } else {
                window.location.href = `tel:${role === UserRole.CUSTOMER ? trackingJob.workerId : trackingJob.customerId}`;
            }
        }}
    />
  );
  
  if (chattingJob) return <ChatScreen jobId={chattingJob.id} otherName={role === UserRole.CUSTOMER ? chattingJob.workerName || 'Expert' : chattingJob.customerName || 'Customer'} onBack={() => setChattingJob(null)} />;

  const tourSteps = role === UserRole.CUSTOMER 
    ? [{ targetId: 'search-step', title: 'Find Experts', content: 'Search by skill or specific repair needs.', position: 'bottom' as const }]
    : [{ targetId: 'online-step', title: 'Earn Ready', content: 'Go online to show up on local maps.', position: 'bottom' as const }];

  return (
    <div className="app-shell flex flex-col h-screen overflow-hidden bg-white">
        {showTour && <GuidedTour steps={tourSteps} onFinish={() => setShowTour(false)} />}
        <main className="flex-1 relative overflow-hidden flex flex-col min-h-0">
            {role === UserRole.CUSTOMER ? (
              <>
                {customerNav === 'home' && (selectedWorker ? <WorkerProfileDetail worker={selectedWorker} onBack={() => setSelectedWorker(null)} onBook={() => setIsBooking(true)} /> : <CustomerView categories={serviceCategories} onSelectWorker={setSelectedWorker} onBookWorker={(worker) => { setSelectedWorker(worker); setIsBooking(true); }} onOpenPostJob={() => setIsPostingJob(true)} activeJobs={myJobs} onTrackWorker={setTrackingJob} />)}
                {customerNav === 'jobs' && (
                    <CustomerJobHistory 
                        jobs={myJobs} 
                        onCancelJob={(jobId) => updateJobStatus(jobId, 'CANCELLED')} 
                        onRateJob={(jobId, rating, text, mediaUrls, voiceNoteUrl) => updateJobStatus(jobId, 'COMPLETED', { userReview: { rating, text, mediaUrls, voiceNoteUrl } })} 
                        onTrackJob={setTrackingJob} 
                        onChat={setChattingJob}
                        onJobUpdate={(jobId, status, extra) => updateJobStatus(jobId, status, extra)}
                    />
                )}
                {customerNav === 'profile' && <SettingsScreen role={role} onLogout={handleLogout} userProfile={userProfile} onUpdateProfile={handleProfileUpdate} onNavigateToWorks={() => setCustomerNav('jobs')} />}
              </>
            ) : (
              <>
                {workerNav === 'home' && activeWorkerProfile && <WorkerDashboard categories={serviceCategories} feeConfig={feeConfig} currentWorker={activeWorkerProfile} onUpdateWorker={setActiveWorkerProfile} />}
                {workerNav === 'requests' && (
                    <WorkerJobRequests 
                        availableBroadcasts={broadcastJobs} 
                        // Fix for Active Tab Visibility: Ensure we filter jobs where I am the worker
                        activeJobsList={myJobs.filter(j => 
                            (j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS' || j.status === 'COMPLETED') && 
                            (j.workerPhone === userProfile.phone || j.workerId === activeWorkerProfile?.id)
                        )} 
                        onAcceptBroadcast={handleAcceptJob} 
                        onChat={setChattingJob} 
                        onTrackJob={setTrackingJob}
                        onCancelJob={(jobId) => updateJobStatus(jobId, 'CANCELLED', { cancelledBy: 'worker' })}
                        feeConfig={feeConfig} // Pass feeConfig here
                    />
                )}
                {workerNav === 'menu' && <SettingsScreen role={role} onLogout={handleLogout} userProfile={userProfile} onUpdateProfile={handleProfileUpdate} />}
              </>
            )}

            {isPostingJob && (
                <PostJobModal 
                    categories={serviceCategories} 
                    onClose={() => setIsPostingJob(false)} 
                    onSubmit={(data) => postJob({
                        ...data, 
                        customerId: userProfile.phone, 
                        customerName: `${userProfile.firstName} ${userProfile.lastName}`, 
                        customerAvatar: userProfile.avatarUrl,
                        customerPhone: userProfile.phone 
                    }).then(() => setIsPostingJob(false))} 
                />
            )}
            
            {isBooking && selectedWorker && (
                <BookingModal 
                    worker={selectedWorker} 
                    onClose={(job) => { 
                        setIsBooking(false); 
                        if (job) {
                            const fullJob = { 
                                ...job, 
                                customerId: userProfile.phone,
                                customerName: `${userProfile.firstName} ${userProfile.lastName}`, 
                                customerAvatar: userProfile.avatarUrl,
                                customerPhone: userProfile.phone 
                            } as JobRequest;
                            setTrackingJob(fullJob); 
                        }
                    }} 
                    onConfirm={(job) => postJob({
                        ...job, 
                        customerId: userProfile.phone, 
                        customerName: `${userProfile.firstName} ${userProfile.lastName}`, 
                        customerAvatar: userProfile.avatarUrl,
                        customerPhone: userProfile.phone, 
                        workerPhone: selectedWorker.phone 
                    })} 
                />
            )}
        </main>

        <nav className="bg-white border-t border-slate-100 flex justify-around items-center py-3 safe-bottom z-[9999] relative shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            {role === UserRole.CUSTOMER ? (
                <>
                    <NavBtn active={customerNav === 'home'} icon={Home} label="Home" onClick={() => setCustomerNav('home')} />
                    <NavBtn active={customerNav === 'jobs'} icon={Briefcase} label="Activity" onClick={() => setCustomerNav('jobs')} count={myJobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').length} />
                    <NavBtn active={customerNav === 'profile'} icon={User} label="Profile" onClick={() => setCustomerNav('profile')} />
                </>
            ) : (
                <>
                    {/* Updated Navigation Labels */}
                    <NavBtn active={workerNav === 'home'} icon={Zap} label="Home" onClick={() => setWorkerNav('home')} />
                    <NavBtn active={workerNav === 'requests'} icon={LayoutGrid} label="Tasks" onClick={() => setWorkerNav('requests')} count={broadcastJobs.length} />
                    <NavBtn active={workerNav === 'menu'} icon={Settings} label="Setting" onClick={() => setWorkerNav('menu')} />
                </>
            )}
        </nav>
    </div>
  );
};

const NavBtn = ({ active, icon: Icon, label, onClick, count }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all relative ${active ? 'text-blue-600' : 'text-slate-400'}`}>
    <Icon className="w-6 h-6" />
    {count > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">{count}</span>}
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
