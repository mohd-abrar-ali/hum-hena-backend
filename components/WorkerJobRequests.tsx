
import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { MessageCircle, ShieldCheck, Loader2, Play, Bell, Camera, X, Image as ImageIcon, AlertTriangle, Phone, Navigation, History, CheckCircle } from 'lucide-react';
import { JobRequest, JobStatus, PlatformFeeConfig } from '../types';
import { updateJobStatus } from '../services/firestoreService';
import { useTranslation } from '../translations';
import { WorkerPaymentCollectionModal } from './WorkerPaymentCollectionModal';

interface WorkerJobRequestsProps {
    availableBroadcasts?: JobRequest[];
    activeJobsList: JobRequest[];
    onAcceptBroadcast?: (job: JobRequest) => void;
    onChat?: (job: JobRequest) => void;
    onTrackJob?: (job: JobRequest) => void;
    onCancelJob?: (jobId: string) => void;
    feeConfig?: PlatformFeeConfig; // Add feeConfig prop
}

export const WorkerJobRequests: React.FC<WorkerJobRequestsProps> = ({ 
    availableBroadcasts = [], activeJobsList = [], onAcceptBroadcast, onChat, onTrackJob, onCancelJob, feeConfig 
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');
  const [verifyingJobId, setVerifyingJobId] = useState<string | null>(null);
  const [verificationType, setVerificationType] = useState<'START' | 'FINISH'>('START');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRequestingCompletion, setIsRequestingCompletion] = useState<string | null>(null);
  
  // Payment Collection State
  const [collectingPaymentJobId, setCollectingPaymentJobId] = useState<string | null>(null);
  
  // Proof Upload State
  const [showProofModal, setShowProofModal] = useState<string | null>(null); // jobId
  const [proofMedia, setProofMedia] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cancellation State
  const [cancellingJob, setCancellingJob] = useState<JobRequest | null>(null);

  const t = useTranslation('en');

  // Filter Jobs
  const ongoingJobs = activeJobsList.filter(j => ['ACCEPTED', 'IN_PROGRESS', 'OTP_VERIFIED'].includes(j.status));
  const historyJobs = activeJobsList.filter(j => ['COMPLETED', 'CANCELLED'].includes(j.status));

  const submitOtp = async () => {
      const entered = otp.join('');
      const job = activeJobsList.find(j => j.id === verifyingJobId);
      
      if (!job) {
          alert("Job not found.");
          setVerifyingJobId(null);
          return;
      }

      const target = verificationType === 'START' ? job.otp : job.completionOtp;
      
      if (entered !== target) return alert("OTP Security Mismatch");

      setIsVerifying(true);
      const newStatus: JobStatus = verificationType === 'START' ? 'IN_PROGRESS' : 'COMPLETED';
      await updateJobStatus(verifyingJobId!, newStatus);
      
      // If finishing work, trigger payment collection flow
      if (verificationType === 'FINISH') {
          setCollectingPaymentJobId(verifyingJobId);
      }

      setVerifyingJobId(null);
      setIsVerifying(false);
      setOtp(['', '', '', '']);
  };

  const handlePaymentCollectionComplete = async (method: 'CASH' | 'ONLINE') => {
      if (collectingPaymentJobId) {
          // Determine platform fee based on method or config
          // For simplicity, we just mark it as paid. 
          // In a real app, online payments might be auto-calculated.
          const job = activeJobsList.find(j => j.id === collectingPaymentJobId);
          const price = job?.price || 0;
          
          let platformFee = 0;
          let workerEarnings = price;

          if (feeConfig && !feeConfig.isSystemFreeMode) {
              platformFee = (price * (feeConfig.baseCommissionPercent * feeConfig.dynamicMultiplier)) / 100;
              workerEarnings = price - platformFee;
          }

          await updateJobStatus(collectingPaymentJobId, 'COMPLETED', {
              isPaid: true,
              paymentMethod: method,
              platformFee,
              workerEarnings
          });
          
          setCollectingPaymentJobId(null);
      }
  };

  const handleOtpChange = (index: number, value: string) => {
      if (value.length > 1 || isNaN(Number(value))) return;
      
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 3) {
          document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
      // Auto focus previous input on backspace if current is empty
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
          document.getElementById(`otp-input-${index - 1}`)?.focus();
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          Array.from(e.target.files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  if (reader.result) setProofMedia(prev => [...prev, reader.result as string]);
              };
              reader.readAsDataURL(file as Blob);
          });
      }
  };

  const removeProof = (index: number) => {
      setProofMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProofAndRequest = async () => {
      if (!showProofModal) return;
      if (proofMedia.length === 0) return alert("Please upload at least one photo of the completed work.");

      setIsRequestingCompletion(showProofModal);
      await updateJobStatus(showProofModal, 'IN_PROGRESS', { 
          completionRequested: true,
          completionMediaUrls: proofMedia 
      });
      setIsRequestingCompletion(null);
      setShowProofModal(null);
      setProofMedia([]);
  };

  const confirmCancellation = () => {
      if (cancellingJob && onCancelJob) {
          onCancelJob(cancellingJob.id);
          setCancellingJob(null);
      }
  };

  const jobForPayment = collectingPaymentJobId ? activeJobsList.find(j => j.id === collectingPaymentJobId) : null;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-6 border-b border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 mb-4">{t.tasks}</h1>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('requests')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${activeTab === 'requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>New Signal</button>
          <button onClick={() => setActiveTab('active')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
              Active 
              {ongoingJobs.length > 0 && <span className="bg-blue-600 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full ml-1">{ongoingJobs.length}</span>}
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>History</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'requests' && availableBroadcasts.map(job => (
            <div key={job.id} className="bg-white rounded-[2rem] p-6 shadow-xl border-2 border-blue-50">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-black text-slate-900 text-xl">{job.skill} Work</h3>
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{job.customerName || 'Customer'}</p>
                    </div>
                    <span className="font-black text-green-600 text-2xl">₹{job.price}</span>
                </div>
                <Button fullWidth onClick={() => onAcceptBroadcast?.(job)} className="h-14 rounded-2xl">Accept Signal</Button>
            </div>
        ))}

        {activeTab === 'active' && ongoingJobs.map(job => (
            <div key={job.id} className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100 relative">
                <div className="flex gap-4 mb-6">
                    <img src={job.customerAvatar} className="w-12 h-12 rounded-2xl object-cover" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-black text-slate-900">{job.customerName || 'Client'}</h3>
                            <button 
                                onClick={() => setCancellingJob(job)}
                                className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-lg text-[10px] font-black uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{job.status}</p>
                    </div>
                </div>
                
                {/* Tools Row */}
                <div className="flex gap-2 mb-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 rounded-xl"
                        onClick={() => window.location.href = `tel:${job.customerPhone || job.customerId}`}
                    >
                        <Phone className="w-4 h-4 mr-1.5" /> Call
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 rounded-xl"
                        onClick={() => onTrackJob?.(job)}
                    >
                        <Navigation className="w-4 h-4 mr-1.5" /> Track
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 rounded-xl"
                        onClick={() => onChat?.(job)}
                    >
                        <MessageCircle className="w-4 h-4 mr-1.5" /> Chat
                    </Button>
                </div>

                {/* Primary Workflow Action */}
                <div className="w-full">
                    {job.status === 'ACCEPTED' ? (
                        <Button fullWidth onClick={() => { setVerifyingJobId(job.id); setVerificationType('START'); }} className="rounded-xl bg-blue-600"><Play className="w-4 h-4 mr-2" /> Start</Button>
                    ) : !job.completionRequested ? (
                        <Button 
                            fullWidth 
                            onClick={() => setShowProofModal(job.id)}
                            disabled={isRequestingCompletion === job.id}
                            className="rounded-xl bg-slate-900"
                        >
                            {isRequestingCompletion === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bell className="w-4 h-4 mr-2" /> Request Completion</>}
                        </Button>
                    ) : (
                        <Button fullWidth onClick={() => { setVerifyingJobId(job.id); setVerificationType('FINISH'); }} className="rounded-xl bg-green-600 shadow-green-600/20"><ShieldCheck className="w-4 h-4 mr-2" /> Verify</Button>
                    )}
                </div>
                
                {job.completionRequested && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-green-100">
                        Waiting for Customer OTP
                    </div>
                )}
            </div>
        ))}

        {activeTab === 'history' && historyJobs.map(job => (
            <div key={job.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 opacity-80">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <img src={job.customerAvatar} className="w-10 h-10 rounded-xl object-cover grayscale" />
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{job.customerName || 'Client'}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.date}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${job.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {job.status}
                    </span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-600">{job.skill} Work</span>
                    <span className="text-sm font-black text-slate-900">₹{job.price}</span>
                </div>
                {job.status === 'COMPLETED' && (
                    <div className="mt-4 flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest justify-center">
                        <CheckCircle className="w-4 h-4" /> Work Finished & Paid
                    </div>
                )}
            </div>
        ))}

        {activeTab === 'active' && ongoingJobs.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                <Play className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">No Active Work</p>
            </div>
        )}

        {activeTab === 'history' && historyJobs.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">No Job History</p>
            </div>
        )}
      </div>

      {/* Payment Collection Modal */}
      {jobForPayment && (
          <WorkerPaymentCollectionModal 
              job={jobForPayment}
              onClose={() => setCollectingPaymentJobId(null)}
              onPaymentComplete={handlePaymentCollectionComplete}
              qrCodeUrl={feeConfig?.paymentQrUrl}
              upiId={feeConfig?.upiId}
          />
      )}

      {/* OTP Verification Modal */}
      {verifyingJobId && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
              <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center animate-scaleIn">
                  <h2 className="text-2xl font-black mb-6">{verificationType === 'START' ? 'Start Protocol' : 'Finish Protocol'}</h2>
                  <p className="text-xs text-slate-500 font-bold mb-8">
                      {verificationType === 'START' 
                        ? 'Ask customer for the arrival OTP to begin work.' 
                        : 'Ask customer for the completion OTP to finish job.'}
                  </p>
                  <div className="flex gap-3 justify-center mb-10">
                      {otp.map((d, i) => (
                          <input 
                            key={i} 
                            id={`otp-input-${i}`}
                            maxLength={1} 
                            value={d} 
                            onChange={e => handleOtpChange(i, e.target.value)} 
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            className="w-12 h-16 border-2 rounded-2xl text-center text-2xl font-black focus:border-blue-600 outline-none transition-colors" 
                          />
                      ))}
                  </div>
                  <div className="space-y-3">
                    <Button fullWidth onClick={submitOtp} disabled={isVerifying} className="h-16 rounded-2xl">
                        {isVerifying ? <Loader2 className="animate-spin" /> : 'Verify'}
                    </Button>
                    <Button variant="ghost" fullWidth onClick={() => setVerifyingJobId(null)}>Cancel</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Proof of Work Modal */}
      {showProofModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
              <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-scaleIn flex flex-col max-h-[85vh]">
                  <div className="p-8 pb-4">
                      <h2 className="text-2xl font-black text-slate-900">Proof of Work</h2>
                      <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed">
                          Upload photos or videos of the completed task to request completion code from customer.
                      </p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto px-8 pb-4 scrollbar-hide">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all"
                          >
                              <Camera className="w-6 h-6 mb-2" />
                              <span className="text-[10px] font-black uppercase">Add Photo</span>
                          </button>
                          {proofMedia.map((url, idx) => (
                              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                                  {url.startsWith('data:video') ? (
                                      <video src={url} className="w-full h-full object-cover" />
                                  ) : (
                                      <img src={url} className="w-full h-full object-cover" alt="" />
                                  )}
                                  <button 
                                    onClick={() => removeProof(idx)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                      <X className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleFileSelect} />
                  </div>

                  <div className="p-8 pt-4 border-t border-slate-100">
                      <Button 
                        fullWidth 
                        onClick={handleSubmitProofAndRequest} 
                        disabled={proofMedia.length === 0 || isRequestingCompletion !== null} 
                        className="h-16 rounded-2xl shadow-xl shadow-slate-900/20"
                      >
                          {isRequestingCompletion ? <Loader2 className="animate-spin" /> : 'Send Request'}
                      </Button>
                      <button onClick={() => { setShowProofModal(null); setProofMedia([]); }} className="w-full text-center mt-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Cancellation Warning Modal */}
      {cancellingJob && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
              <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center animate-scaleIn">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                      <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">Cancel Active Job?</h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-2">
                      Cancelling an accepted job affects your reliability score.
                  </p>
                  <p className="text-xs font-black text-red-500 bg-red-50 p-3 rounded-xl mb-8 uppercase tracking-widest">
                      ₹50 Platform Fee will be deducted
                  </p>
                  <div className="space-y-3">
                      <Button variant="danger" fullWidth onClick={confirmCancellation} className="h-14 rounded-2xl shadow-xl shadow-red-600/20">
                          Yes, Cancel Job
                      </Button>
                      <Button variant="ghost" fullWidth onClick={() => setCancellingJob(null)} className="font-black text-slate-400">
                          Back
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
