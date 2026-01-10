
import React, { useState, useRef } from 'react';
import { Star, X, Camera, Mic, Trash2, CheckCircle, Sparkles, User, Video, Check, ShieldCheck, Play } from 'lucide-react';
import { Button } from './ui/Button';

interface RateWorkerModalProps {
  jobId: string;
  workerName: string;
  workerAvatar: string;
  onClose: () => void;
  onSubmit: (jobId: string, rating: number, text: string, mediaUrls: string[], voiceNoteUrl?: string) => void;
}

export const RateWorkerModal: React.FC<RateWorkerModalProps> = ({ 
  jobId, 
  workerName, 
  workerAvatar, 
  onClose, 
  onSubmit 
}) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(jobId, rating, text, mediaUrls, voiceNoteUrl || undefined);
      onClose();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceNoteUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) { console.error(e); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (reader.result) setMediaUrls(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file as Blob);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn">
      <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn max-h-[90vh] flex flex-col">
        <div className="relative p-8 text-center flex-1 overflow-y-auto scrollbar-hide">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mt-4 mb-6 relative inline-block">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"></div>
              <img 
                src={workerAvatar} 
                alt={workerName} 
                className="w-24 h-24 rounded-[2rem] object-cover mx-auto border-4 border-white shadow-xl relative z-10" 
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white z-20">
                 <Check className="w-3.5 h-3.5" />
              </div>
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Rate Your Experience</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">How was {workerName}'s service?</p>

          <div className="flex justify-center gap-3 my-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="transition-all hover:scale-125 active:scale-95 focus:outline-none"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredStar || rating) 
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' 
                      : 'text-slate-200'
                  }`} 
                />
              </button>
            ))}
          </div>

          <div className="space-y-6 text-left">
              <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Write a Review</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Shared your experience with the community..."
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-500 focus:bg-white outline-none resize-none min-h-[120px] transition-all shadow-sm"
                  />
              </div>
              
              <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Multimedia Feedback</label>
                      {voiceNoteUrl && <span className="text-[9px] font-black text-green-600 flex items-center gap-1"><Mic className="w-3 h-3" /> Audio Attached</span>}
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 aspect-video bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-600 hover:bg-blue-100 transition-all group"
                      >
                          <Camera className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase">Add Media</span>
                      </button>
                      <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex-1 aspect-video rounded-2xl flex flex-col items-center justify-center transition-all group shadow-sm ${
                            isRecording ? 'bg-red-500 text-white animate-pulse' : 
                            voiceNoteUrl ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                          <Mic className={`w-6 h-6 mb-1 ${!isRecording && !voiceNoteUrl ? 'group-hover:text-blue-500' : ''}`} />
                          <span className="text-[10px] font-black uppercase">
                            {isRecording ? 'Stop' : voiceNoteUrl ? 'Redo Voice' : 'Voice Note'}
                          </span>
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleMediaUpload} />
                  </div>

                  {mediaUrls.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {mediaUrls.map((url, idx) => (
                              <div key={idx} className="relative w-16 h-16 shrink-0 group/media">
                                  {url.startsWith('data:video') ? (
                                      <div className="w-full h-full relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                                          <video src={url} className="w-full h-full object-cover" muted />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                              <Play className="w-4 h-4 text-white fill-white opacity-60" />
                                          </div>
                                      </div>
                                  ) : (
                                      <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm" />
                                  )}
                                  <button 
                                    onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                                    className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-1 shadow-xl hover:bg-red-500 transition-colors opacity-0 group-hover/media:opacity-100"
                                  >
                                      <X className="w-3 h-3" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
        </div>

        <div className="p-8 pt-4 bg-white border-t border-slate-50">
          <Button 
            fullWidth 
            size="lg"
            onClick={handleSubmit}
            disabled={rating === 0 || isRecording}
            className="h-16 rounded-2xl shadow-xl shadow-blue-600/20 text-lg font-black"
          >
            Submit Review
          </Button>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
             <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Identity Verified Rating
          </div>
        </div>
      </div>
    </div>
  );
};
