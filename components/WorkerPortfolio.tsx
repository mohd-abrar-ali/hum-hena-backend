
import React, { useState, useRef } from 'react';
import { WorkerProfile, PortfolioItem } from '../types';
import { Camera, Mic, Trash2, Image as ImageIcon, Play, Pause, Loader2, Square } from 'lucide-react';
import { saveWorkerProfile } from '../services/firestoreService';

interface WorkerPortfolioProps {
  worker: WorkerProfile;
  onUpdate: (worker: WorkerProfile) => void;
}

export const WorkerPortfolio: React.FC<WorkerPortfolioProps> = ({ worker, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newItem: PortfolioItem = {
        id: `p-${Date.now()}`,
        type: 'image',
        url: reader.result as string
      };
      const updatedProfile = { 
        ...worker, 
        portfolioItems: [...(worker.portfolioItems || []), newItem] 
      };
      await saveWorkerProfile(updatedProfile);
      onUpdate(updatedProfile);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
             const newItem: PortfolioItem = {
                id: `audio-${Date.now()}`,
                type: 'audio',
                url: reader.result as string
             };
             const updatedProfile = { 
                ...worker, 
                portfolioItems: [...(worker.portfolioItems || []), newItem] 
             };
             await saveWorkerProfile(updatedProfile);
             onUpdate(updatedProfile);
             setIsUploading(false);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsUploading(true); 
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDelete = async (itemId: string) => {
     if(!confirm("Delete this item?")) return;
     const updatedProfile = {
         ...worker,
         portfolioItems: worker.portfolioItems?.filter(i => i.id !== itemId)
     };
     await saveWorkerProfile(updatedProfile);
     onUpdate(updatedProfile);
  };

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
    <div className="h-full flex flex-col bg-slate-50">
        <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div>
                <h1 className="text-2xl font-black text-slate-900">Portfolio</h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Showcase your best work</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading || isRecording}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm active:scale-95"
                >
                    <Camera className="w-5 h-5" />
                </button>
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-xl transition-colors shadow-sm active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {isUploading && (
                <div className="flex items-center justify-center p-8 bg-white rounded-[2rem] border border-slate-100 mb-6 shadow-sm">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Uploading Signal...</span>
                </div>
            )}

            {!worker.portfolioItems?.length && !isUploading && (
                <div className="text-center py-20 opacity-50">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">No Portfolio Items</p>
                    <p className="text-xs text-slate-400 mt-2">Add photos or audio to attract more customers.</p>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {worker.portfolioItems?.map(item => (
                    <div key={item.id} className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
                        {item.type === 'audio' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 p-4">
                                <button 
                                    onClick={() => toggleAudio(item.id, item.url)}
                                    className={`p-4 rounded-full transition-all ${playingAudioId === item.id ? 'bg-rose-500 text-white shadow-lg scale-110' : 'bg-white text-rose-500 shadow-sm'}`}
                                >
                                    {playingAudioId === item.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                </button>
                                <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 mt-3">Voice Note</span>
                            </div>
                        ) : (
                            <img src={item.url} className="w-full h-full object-cover" alt="Portfolio" />
                        )}
                        
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-3 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-xl active:scale-90"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
