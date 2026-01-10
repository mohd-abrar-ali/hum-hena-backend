
import React, { useState, useEffect } from 'react';
import { JobRequest, PlatformFeeConfig, JobStatus, UserRole } from '../types';
import { Clock, CheckCircle, XCircle, Calendar, IndianRupee, Smartphone, AlertTriangle, Star, MessageCircle, MapPin, Navigation, Phone, Wallet, Image as ImageIcon, Video, ShieldCheck, Eye, Mic, Camera, Bell, Play, ShieldAlert } from 'lucide-react';
import { Button } from './ui/Button';
import { RateWorkerModal } from './RateWorkerModal';
import { PaymentModal } from './PaymentModal';
import { ReportModal } from './ReportModal';
import { getPlatformConfig } from '../services/firestoreService';
import { useTranslation } from '../translations';

interface CustomerJobHistoryProps {
  jobs: JobRequest[];
  onCancelJob: (jobId: string) => void;
  onRateJob: (jobId: string, rating: number, text: string, mediaUrls: string[], voiceNoteUrl?: string) => void;
  onTrackJob: (job: JobRequest) => void;
  onJobUpdate?: (jobId: string, status: JobStatus, extra?: any) => void;
  onPayJob?: (jobId: string, method: 'UPI' | 'CARD' | 'CASH') => void;
  onChat?: (job: JobRequest) => void;
}

export const CustomerJobHistory: React.FC<CustomerJobHistoryProps> = ({ jobs, onCancelJob, onRateJob, onTrackJob, onJobUpdate, onPayJob, onChat }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [cancellingJobId, setCancellingJobId] = useState<string | null>(null);
  const [reviewingJob, setReviewingJob] = useState<JobRequest | null>(null);
  const [payingJob, setPayingJob] = useState<JobRequest | null>(null);
  const [reportingJob, setReportingJob] = useState<JobRequest | null>(null);
  const [feeConfig, setFeeConfig] = useState<PlatformFeeConfig | null>(null);
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);

  // L10n
  const lang = (localStorage.getItem('sl_lang') || 'en') as any;
  const t = useTranslation(lang);

  useEffect(() => {
    getPlatformConfig().then(setFeeConfig);
  }, []);

  const activeJobs = jobs.filter(j => (['PENDING', 'ACCEPTED', 'OTP_VERIFIED', 'IN_PROGRESS', 'OPEN'] as JobStatus[]).includes(j.status));
  const historyJobs = jobs.filter(j => (['COMPLETED', 'CANCELLED'] as JobStatus[]).includes(j.status));
  const displayedJobs = activeTab === 'active' ? activeJobs : historyJobs;

  const handlePaymentSuccess = (method: 'UPI' | 'CARD' | 'CASH') => {
     if (payingJob && onJobUpdate && feeConfig) {
        const commissionPercent = feeConfig.isSystemFreeMode ? 0 : (feeConfig.baseCommissionPercent * feeConfig.dynamicMultiplier);
        const platformFee = (payingJob.price * commissionPercent) / 100;
        const workerEarnings = payingJob.price - platformFee;

        onJobUpdate(payingJob.id, 'COMPLETED', { 
            isPaid: true, 
            paymentMethod: method,
            platformFee,
            workerEarnings
        });
        setPayingJob(null);
     }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col relative">
      <div className="bg-white p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 mb-4">{t.my_kaam}</h1>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.active}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.history}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollbar-hide">
        {displayedJobs.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-medium">{t.no_jobs}</h3>
            <p className="text-slate-500 text-sm mt-1">{t.hire_expert} to start.</p>
          </div>
        ) : (
          displayedJobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 relative group/card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <img src={job.workerAvatar} alt={job.workerName} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{job.workerName}</h3>
                    <p className="text-xs text-slate-500">{t[job.skill] || job.skill}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setReportingJob(job)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/card:opacity-100"
                      title="Report Worker"
                    >
                        <ShieldAlert className="w-4 h-4" />
                    </button>
                    <StatusBadge status={job.status} labels={t} />
                </div>
              </div>

              {/* Work Completion Alert */}
              {job.status === 'IN_PROGRESS' && job.completionRequested && (
                <div className="mb-4 bg-green-600 rounded-2xl p-5 shadow-lg shadow-green-600/20 text-white animate-pulse">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 fill-white" />
                        <span className="text-xs font-black uppercase tracking-widest">Work Finished</span>
                    </div>
                    <p className="text-sm font-medium leading-tight mb-4 opacity-90">Please share this completion code with the worker to confirm the job is done.</p>
                    <div className="bg-white text-green-700 py-3 rounded-xl text-center shadow-sm">
                        <span className="text-3xl font-black tracking-[0.5em]">{job.completionOtp}</span>
                    </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-slate-700 font-medium mb-1">{job.description}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {job.date}</span>
                      <span className="flex items-center gap-1 font-bold text-slate-900">₹{job.price}</span>
                    </div>
                </div>

                {/* Job Media Preview */}
                {((job.mediaUrls && job.mediaUrls.length > 0) || job.voiceNoteUrl) && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                    {job.voiceNoteUrl && (
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                         <Mic className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    {job.mediaUrls?.map((url, idx) => (
                      <div key={idx} className="relative w-12 h-12 shrink-0 cursor-pointer" onClick={() => setPreviewMedia(url)}>
                        {url.startsWith('data:video') ? (
                          <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white opacity-40" />
                          </div>
                        ) : (
                          <img src={url} className="w-full h-full object-cover rounded-lg border border-slate-200" alt="Job detail" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completion Proof Section */}
              {job.status === 'COMPLETED' && job.completionMediaUrls && job.completionMediaUrls.length > 0 && (
                  <div className="mb-4 bg-green-50/50 p-3 rounded-xl border border-green-100">
                      <div className="flex items-center gap-1.5 mb-2 text-green-700">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Verification Proof</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                          {job.completionMediaUrls.map((url, idx) => (
                              <div key={idx} className="relative w-16 h-16 shrink-0 cursor-pointer" onClick={() => setPreviewMedia(url)}>
                                  {url.startsWith('data:video') ? (
                                    <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                                      <Play className="w-4 h-4 text-white fill-white opacity-60" />
                                    </div>
                                  ) : (
                                    <img src={url} className="w-full h-full object-cover rounded-lg border border-white shadow-sm" alt="Proof" />
                                  )}
                                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                                     <Eye className="w-4 h-4 text-white" />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {job.status === 'ACCEPTED' && (
                  <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 mb-1">
                     <div className="flex items-center gap-2 text-blue-700 text-sm font-bold">
                        <Smartphone className="w-4 h-4" />
                        <span>Arrival Code: <span className="tracking-widest">{job.otp}</span></span>
                     </div>
                     <span className="text-[10px] text-blue-500 uppercase font-semibold">Start Code</span>
                  </div>
                )}

                {/* NOTE: We only show this simple banner if completion requested but not yet verified. The big green card above handles the urgent view. */}
                {job.status === 'IN_PROGRESS' && !job.completionRequested && (
                  <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 mb-1 opacity-50">
                     <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                        <Clock className="w-4 h-4" />
                        <span>Work In Progress</span>
                     </div>
                  </div>
                )}
                
                {(['ACCEPTED', 'OTP_VERIFIED', 'IN_PROGRESS'] as JobStatus[]).includes(job.status) && (
                    <div className="flex gap-2">
                        <Button variant="primary" size="sm" fullWidth onClick={() => onTrackJob(job)}><Navigation className="w-3 h-3 mr-1.5" /> {t.track}</Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.location.href = `tel:${job.workerPhone || job.workerId}`}
                        >
                            <Phone className="w-4 h-4 mr-1" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onChat?.(job)}><MessageCircle className="w-4 h-4 mr-1" /></Button>
                    </div>
                )}

                {job.status === 'COMPLETED' && (
                  <div className="w-full flex flex-col gap-2">
                    {job.isPaid ? (
                        <div className="flex items-center justify-center gap-1.5 bg-green-50 text-green-700 py-2 rounded-lg border border-green-100 text-xs font-bold w-full">
                            <CheckCircle className="w-3.5 h-3.5" /> Paid (₹{job.price})
                        </div>
                    ) : (
                        <Button fullWidth className="bg-green-600 hover:bg-green-700" onClick={() => setPayingJob(job)}>
                            <Wallet className="w-4 h-4 mr-2" /> Pay ₹{job.price}
                        </Button>
                    )}

                    {job.userReview ? (
                      <div className="mt-3 p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < job.userReview!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                ))}
                            </div>
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{t.your_feedback}</span>
                        </div>
                        {job.userReview.text && (
                          <p className="text-xs text-slate-600 font-bold italic leading-relaxed">"{job.userReview.text}"</p>
                        )}
                        {(job.userReview.mediaUrls && job.userReview.mediaUrls.length > 0 || job.userReview.voiceNoteUrl) && (
                          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {job.userReview.voiceNoteUrl && (
                               <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                                  <Mic className="w-4 h-4 text-amber-600" />
                               </div>
                            )}
                            {job.userReview.mediaUrls?.map((url, idx) => (
                              <div key={idx} className="relative w-12 h-12 shrink-0 cursor-pointer" onClick={() => setPreviewMedia(url)}>
                                {url.startsWith('data:video') ? (
                                   <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden">
                                      <Play className="w-4 h-4 text-white fill-white opacity-60" />
                                   </div>
                                ) : (
                                   <img src={url} className="w-full h-full object-cover rounded-lg border border-white shadow-sm" alt="Review media" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button fullWidth variant="secondary" onClick={() => setReviewingJob(job)}>
                        <Star className="w-4 h-4 mr-2" /> {t.rate_experience}
                      </Button>
                    )}
                  </div>
                )}

                {(['PENDING', 'ACCEPTED', 'OPEN'] as JobStatus[]).includes(job.status) && (
                   <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setCancellingJobId(job.id)}>Cancel Request</Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-[1200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPreviewMedia(null)}>
           <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
              <button className="absolute -top-12 right-0 text-white p-2" onClick={() => setPreviewMedia(null)}>
                <XCircle className="w-8 h-8" />
              </button>
              {previewMedia.startsWith('data:video') ? (
                 <video src={previewMedia} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
              ) : (
                 <img src={previewMedia} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
              )}
           </div>
        </div>
      )}

      {cancellingJobId && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl animate-scaleIn">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Cancel Service?</h3>
                <div className="flex gap-3">
                    <Button variant="secondary" fullWidth onClick={() => setCancellingJobId(null)}>No</Button>
                    <Button variant="danger" fullWidth onClick={() => { onCancelJob(cancellingJobId); setCancellingJobId(null); }}>Yes, Cancel</Button>
                </div>
            </div>
        </div>
      )}

      {payingJob && (
          <PaymentModal 
            amount={payingJob.price} 
            workerName={payingJob.workerName || 'Worker'} 
            onClose={() => setPayingJob(null)} 
            onSuccess={handlePaymentSuccess} 
          />
      )}

      {reviewingJob && (
        <RateWorkerModal 
          jobId={reviewingJob.id} 
          workerName={reviewingJob.workerName || 'Worker'} 
          workerAvatar={reviewingJob.workerAvatar || ''} 
          onClose={() => setReviewingJob(null)} 
          onSubmit={onRateJob} 
        />
      )}

      {reportingJob && (
        <ReportModal 
            reporterId={reportingJob.customerId}
            reporterName={reportingJob.customerName || 'Customer'}
            reportedId={reportingJob.workerId || ''}
            reportedName={reportingJob.workerName || 'Worker'}
            reportedRole={UserRole.WORKER}
            jobId={reportingJob.id}
            onClose={() => setReportingJob(null)}
        />
      )}
    </div>
  );
};

const StatusBadge = ({ status, labels }: { status: JobStatus, labels: any }) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    ACCEPTED: "bg-blue-100 text-blue-700",
    OTP_VERIFIED: "bg-purple-100 text-purple-700",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    OPEN: "bg-slate-100 text-slate-700"
  };
  
  const text = status === 'COMPLETED' ? labels.completed : 
               status === 'CANCELLED' ? labels.cancelled : 
               status === 'IN_PROGRESS' || status === 'ACCEPTED' ? labels.active : 
               status.replace('_', ' ');

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[status]}`}>
      {text}
    </span>
  );
};
