
import React, { useState, useEffect, useRef } from 'react';
import { X, IndianRupee, Briefcase, Type, Image as ImageIcon, Trash2, Camera, Mic, Square, Loader2, Navigation, MapPin } from 'lucide-react';
import { Button } from './ui/Button';
import { JobRequest, ServiceCategory } from '../types';

interface PostJobModalProps {
  onClose: () => void;
  onSubmit: (jobData: Partial<JobRequest>) => void;
  categories: ServiceCategory[];
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ onClose, onSubmit, categories }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [skillQuery, setSkillQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [workAddress, setWorkAddress] = useState('');
  
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableSkills = categories.filter(c => c.isActive).map(c => c.name);
  const filteredSkills = availableSkills.filter(skill => 
    skill.toLowerCase().includes(skillQuery.toLowerCase())
  );

  const handleSelectSkill = (skill: string) => {
    setSelectedSkill(skill);
    setSkillQuery(skill);
    setShowSkillDropdown(false);
  };

  const useCurrentLocation = () => {
    setIsFetchingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setWorkAddress(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        setIsFetchingLocation(false);
      }, () => {
        alert("Unable to fetch location. Please type your address.");
        setIsFetchingLocation(false);
      });
    } else {
      alert("Geolocation not supported.");
      setIsFetchingLocation(false);
    }
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
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceNoteUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) { alert("Microphone access is required."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const finalSkill = selectedSkill || availableSkills.find(s => s.toLowerCase() === skillQuery.toLowerCase());
    if (!finalSkill || !title) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSubmit({
      title,
      description: description || "In-app request details.",
      price: price ? parseInt(price) : 0,
      skill: finalSkill,
      isBroadcast: true,
      status: 'OPEN',
      date: 'Today',
      mediaUrls,
      voiceNoteUrl: voiceNoteUrl || undefined,
      workAddress,
      coordinates: { x: 40 + Math.random() * 20, y: 40 + Math.random() * 20 }
    });
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-fadeIn p-4">
        <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleIn">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Post a Job</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Request Service</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all text-slate-500">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                
                {/* Category */}
                <div ref={dropdownRef} className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:border-blue-600 transition-all">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={skillQuery}
                            onChange={(e) => { setSkillQuery(e.target.value); setShowSkillDropdown(true); }}
                            onFocus={() => setShowSkillDropdown(true)}
                            placeholder="Select Service..."
                            className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 outline-none placeholder:text-slate-300"
                        />
                    </div>
                    {showSkillDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto z-20">
                            {filteredSkills.map(skill => (
                                <button key={skill} onClick={() => handleSelectSkill(skill)} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 text-slate-600 border-b border-slate-50 last:border-none">
                                    {skill}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:border-blue-600 transition-all">
                        <Type className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Fix Leaking Tap"
                            className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 outline-none"
                        />
                    </div>
                </div>

                {/* Description & Voice */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Task Details</label>
                    <div className="relative">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the task..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 h-32 text-sm font-medium outline-none focus:bg-white focus:border-blue-600 resize-none transition-all"
                        />
                        <button 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500 hover:bg-blue-100 hover:text-blue-600'}`}
                        >
                            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                    </div>
                    {voiceNoteUrl && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg w-max">
                            <Mic className="w-3 h-3" /> Voice Note Added <button onClick={() => setVoiceNoteUrl(null)} className="ml-2 text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    )}
                </div>

                {/* Media & Budget Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Media</label>
                        <div className="flex items-center gap-2">
                            <button onClick={() => fileInputRef.current?.click()} className="h-12 w-full rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 text-slate-400 hover:bg-white hover:border-blue-400 hover:text-blue-500 transition-all">
                                <Camera className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Add</span>
                            </button>
                            {mediaUrls.length > 0 && <span className="text-xs font-bold text-blue-600 shrink-0">{mediaUrls.length} added</span>}
                            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Budget (₹)</label>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:border-blue-600 transition-all">
                            <IndianRupee className="w-3 h-3 text-slate-400" />
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Amount"
                                className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:border-blue-600 transition-all">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={workAddress}
                                onChange={(e) => setWorkAddress(e.target.value)}
                                placeholder="Address"
                                className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 outline-none"
                            />
                        </div>
                        <button onClick={useCurrentLocation} disabled={isFetchingLocation} className="px-4 bg-slate-100 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center">
                            {isFetchingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white z-10 shrink-0">
                <Button fullWidth onClick={handleSubmit} disabled={isSubmitting || !title || (!selectedSkill && !skillQuery)} className="h-14 rounded-xl shadow-xl shadow-blue-600/20 font-black tracking-widest text-xs uppercase">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Job'}
                </Button>
            </div>
        </div>
    </div>
  );
};
