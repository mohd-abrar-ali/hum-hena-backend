
import React, { useState, useEffect, useRef } from 'react';
import { WorkerProfile, Review } from '../types';
import { Star, ArrowLeft, CheckCircle, Loader2, ChevronRight, BadgeCheck, PlayCircle, Tag, X, Volume2, Play, Pause, XCircle, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { getWorkerReviews } from '../services/firestoreService';

interface WorkerProfileDetailProps {
  worker: WorkerProfile;
  onBack: () => void;
  onBook: () => void;
}

export const WorkerProfileDetail: React.FC<WorkerProfileDetailProps> = ({ worker, onBack, onBook }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getWorkerReviews(worker.id).then((data) => {
        setReviews(data.length ? data : []);
        setIsLoadingReviews(false);
    });
  }, [worker.id]);

  const toggleAudio = (id: string, url: string) => {
    if (playingAudioId === id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlayingAudioId(null);
      audioRef.current.play();
      setPlayingAudioId(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white animate-fadeIn overflow-hidden">
      {/* Enhanced Header with modern look */}
      <div className="relative shrink-0">
        <div className="h-48 bg-slate-900 relative overflow-hidden">
            <img src={worker.avatarUrl} className="w-full h-full object-cover opacity-40 blur-md" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all z-20">
                <ArrowLeft className="w-6 h-6" />
            </button>
        </div>
        
        <div className="px-6 -mt-16 relative z-10 flex justify-between items-end">
            <div className="relative">
                <div className="w-32 h-32 rounded-[2rem] p-1 bg-white shadow-2xl">
                    <img src={worker.avatarUrl} className="w-full h-full rounded-[1.8rem] object-cover" />
                </div>
                {worker.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl border-4 border-white shadow-lg" title="Verified Pro">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                )}
            </div>
            
            <div className="mb-2 text-right">
                 <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rate</p>
                    <p className="text-xl font-black">₹{worker.hourlyRate}<span className="text-xs text-slate-500 font-bold ml-1">/ job</span></p>
                 </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide">
        
        {/* Name & Stats */}
        <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{worker.name}</h1>
            <p className="text-blue-600 font-black text-sm uppercase tracking-widest mt-1 mb-4">{worker.skill} Specialist</p>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shrink-0">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black text-slate-700">{worker.rating} <span className="text-slate-400">({worker.reviewCount})</span></span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shrink-0">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-700">{worker.distanceKm} km away</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-black text-slate-700">{worker.lifetimeJobsCompleted} Jobs Done</span>
                </div>
            </div>
        </div>

        {/* Bio */}
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">About Expert</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">"{worker.bio}"</p>
            
            {worker.tags && worker.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {worker.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-500">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>

        {/* Portfolio */}
        {worker.portfolioItems && worker.portfolioItems.length > 0 && (
            <section>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-900">Work Gallery</h3>
                    <span className="text-xs font-bold text-slate-400">{worker.portfolioItems.length} items</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    {worker.portfolioItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group"
                        onClick={() => item.type === 'audio' ? toggleAudio(item.id, item.url) : setActiveMedia(item.url)}
                      >
                          {item.type === 'audio' ? (
                              <div className="w-full h-full bg-indigo-50 flex flex-col items-center justify-center p-4 text-center group-hover:bg-indigo-100 transition-colors">
                                  <div className={`p-3 rounded-full ${playingAudioId === item.id ? 'bg-indigo-500 text-white animate-pulse' : 'bg-indigo-200 text-indigo-600'}`}>
                                     {playingAudioId === item.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                  </div>
                                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2">Audio Pitch</p>
                              </div>
                          ) : (
                              <>
                                <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                              </>
                          )}
                      </div>
                    ))}
                 </div>
            </section>
        )}

        {/* Reviews */}
        <section className="pb-10">
            <h3 className="text-lg font-black text-slate-900 mb-4">Client Reviews</h3>
            
            {isLoadingReviews ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 font-black text-xs">
                                        {review.author.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm leading-none">{review.author}</h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{review.date}</span>
                            </div>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed pl-13 ml-12">"{review.text}"</p>
                            
                            {(review.mediaUrls?.length || review.voiceNoteUrl) && (
                                <div className="flex gap-2 mt-3 ml-12 overflow-x-auto pb-1 scrollbar-hide">
                                    {review.voiceNoteUrl && (
                                        <button onClick={() => toggleAudio(review.id + '_voice', review.voiceNoteUrl!)} className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 text-indigo-600 border border-indigo-100">
                                            {playingAudioId === review.id + '_voice' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                        </button>
                                    )}
                                    {review.mediaUrls?.map((url, i) => (
                                        <div key={i} className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 cursor-pointer" onClick={() => setActiveMedia(url)}>
                                            <img src={url} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No reviews yet</p>
                </div>
            )}
        </section>
      </div>

      <div className="p-6 border-t border-slate-100 shrink-0 bg-white/80 backdrop-blur-md safe-bottom">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Estimate</p>
                <p className="text-2xl font-black text-slate-900">₹{worker.hourlyRate}</p>
            </div>
            <Button fullWidth size="lg" onClick={onBook} className="h-16 rounded-2xl shadow-xl shadow-blue-600/30 text-lg font-black tracking-widest uppercase">
                Book
            </Button>
        </div>
      </div>

      {/* Media Preview Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-[1200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setActiveMedia(null)}>
           <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
              <button className="absolute -top-12 right-0 text-white p-2" onClick={() => setActiveMedia(null)}>
                <XCircle className="w-8 h-8" />
              </button>
              {activeMedia.startsWith('data:video') ? (
                 <video src={activeMedia} controls autoPlay className="max-w-full max-h-[80vh] rounded-[2rem] shadow-2xl" onClick={e => e.stopPropagation()} />
              ) : (
                 <img src={activeMedia} className="max-w-full max-h-[80vh] object-contain rounded-[2rem] shadow-2xl" onClick={e => e.stopPropagation()} />
              )}
           </div>
        </div>
      )}
    </div>
  );
};
