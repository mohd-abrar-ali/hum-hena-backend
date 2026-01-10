
import { listenToOnlineWorkers } from '../services/firestoreService';
import { JobRequest, ServiceCategory, WorkerProfile } from '../types';
import { WorkerCard } from './WorkerCard';
import { Button } from './ui/Button';
import { ChevronDown, ChevronUp, MapPin, Plus, Search, Layers } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../translations';

interface CustomerViewProps {
  onSelectWorker: (worker: WorkerProfile) => void;
  onBookWorker: (worker: WorkerProfile) => void;
  onOpenPostJob: () => void;
  activeJobs?: JobRequest[];
  onTrackWorker?: (job: JobRequest) => void;
  categories: ServiceCategory[];
}

const MAP_STYLES = [
  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#f8fafc" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#e2e8f0" }] }
];

export const CustomerView: React.FC<CustomerViewProps> = ({ 
    onSelectWorker, 
    onBookWorker, 
    onOpenPostJob, 
    activeJobs = [], 
    onTrackWorker, 
    categories 
}) => {
  const [onlineWorkers, setOnlineWorkers] = useState<WorkerProfile[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const lang = (localStorage.getItem('sl_lang') || 'en') as any;
  const t = useTranslation(lang);

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsub = listenToOnlineWorkers((workers) => {
        setOnlineWorkers(workers);
    });
    return () => unsub();
  }, []);

  const filteredWorkers = onlineWorkers.filter(w => {
    const matchesCat = selectedCategory === 'All' || w.skill === selectedCategory;
    const matchesQuery = !query || w.name.toLowerCase().includes(query.toLowerCase()) || w.skill.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleWorkerSelection = (worker: WorkerProfile) => {
      setSelectedWorkerId(prev => prev === worker.id ? null : worker.id);
  };

  const selectedWorker = filteredWorkers.find(w => w.id === selectedWorkerId);
  const activeJobForSelected = selectedWorker ? activeJobs.find(job => job.workerId === selectedWorker.id && ['ACCEPTED', 'IN_PROGRESS'].includes(job.status)) : null;
  const displayCategories = ['All', ...categories.filter(c => c.isActive).map(c => c.name)];

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-white relative overflow-hidden">
      
      {/* Sidebar List for Desktop */}
      <div className={`
        ${isDesktop ? 'w-96 border-r flex' : 'hidden'} 
        bg-white h-full flex-col shrink-0 z-40 animate-fadeIn
      `}>
          <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.nearby_pros}</h2>
                  <Button size="sm" onClick={onOpenPostJob} className="rounded-xl">
                      <Plus className="w-4 h-4 mr-1" /> Post Job
                  </Button>
              </div>
              <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.search_placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-slate-900 text-sm outline-none font-medium border border-slate-200 focus:border-blue-500 transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              <div className="flex gap-2 overflow-x-auto pt-4 pb-2 scrollbar-hide">
                  {displayCategories.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)} 
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                        {cat === 'All' ? t.home : (t[cat] || cat)}
                      </button>
                  ))}
              </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-slate-50/30">
              {filteredWorkers.map(worker => (
                  <WorkerCard key={worker.id} worker={worker} isSelected={selectedWorkerId === worker.id} onClick={() => handleWorkerSelection(worker)} />
              ))}
          </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative bg-slate-50 overflow-hidden min-h-0">
        {!isDesktop && (
             <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
                <div className="pointer-events-auto bg-white shadow-xl p-1.5 rounded-2xl border border-slate-100">
                    <div className="relative">
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={t.search_placeholder}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-slate-900 text-sm outline-none font-medium"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                </div>
             </div>
        )}

        <div ref={mapRef} className="h-full w-full relative bg-slate-100">
            {/* Simulation of markers on map */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            {filteredWorkers.map(worker => (
                <button 
                    key={worker.id}
                    onClick={() => handleWorkerSelection(worker)}
                    className="absolute transition-all z-20 hover:scale-110 active:scale-95"
                    style={{ top: `${worker.coordinates.y}%`, left: `${worker.coordinates.x}%` }}
                >
                    <div className={`p-1 rounded-full bg-white shadow-2xl border-2 ${selectedWorkerId === worker.id ? 'border-blue-600 scale-125' : 'border-white'}`}>
                        <img src={worker.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                    </div>
                </button>
            ))}
        </div>

        {/* Mobile FAB */}
        {!isDesktop && !selectedWorker && (
            <div className="absolute bottom-24 right-6 z-[150]">
                <button 
                onClick={onOpenPostJob} 
                className="bg-slate-900 text-white w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-all border-2 border-white/20"
                >
                    <Plus className="w-7 h-7" />
                </button>
            </div>
        )}
      </div>

      {/* Mobile-only Bottom Sheet */}
      {!isDesktop && (
        <div className={`
            absolute bottom-0 left-0 right-0 z-[100] transition-all duration-500 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] flex flex-col overflow-hidden
            ${isSheetExpanded ? 'h-[85%]' : 'h-[30%]'}
        `}>
            <div className="w-full flex flex-col items-center pt-3 pb-2 shrink-0 bg-white" onClick={() => setIsSheetExpanded(!isSheetExpanded)}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3"></div>
                <div className="flex items-center justify-between w-full px-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.nearby_pros} ({filteredWorkers.length})</span>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onOpenPostJob(); }}
                            className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest active:bg-blue-100"
                        >
                            + Post Job
                        </button>
                        {isSheetExpanded ? <ChevronDown className="w-5 h-5 text-slate-300" /> : <ChevronUp className="w-5 h-5 text-slate-300" />}
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 scrollbar-hide bg-slate-50">
                {filteredWorkers.map(worker => (
                    <WorkerCard key={worker.id} worker={worker} isSelected={selectedWorkerId === worker.id} onClick={() => handleWorkerSelection(worker)} />
                ))}
            </div>
        </div>
      )}

      {/* Action Overlay for Selected Worker (Responsive) */}
      {selectedWorker && (
          <div className="absolute bottom-6 left-4 right-4 lg:left-auto lg:right-8 lg:bottom-8 z-[200] bg-white border border-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.15)] p-6 animate-slideUp rounded-[2rem] w-auto lg:w-96">
              <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-4">
                        <img src={selectedWorker.avatarUrl} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                        <div className="min-w-0">
                             <h3 className="font-black text-slate-900 truncate leading-none">{selectedWorker.name}</h3>
                             <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-2">₹{selectedWorker.hourlyRate} / project</p>
                        </div>
                   </div>
                   <Button variant="ghost" size="sm" className="text-slate-400 font-black" onClick={() => onSelectWorker(selectedWorker)}>{t.identity}</Button>
              </div>
              <div className="flex gap-2">
                <Button fullWidth className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => { activeJobForSelected && onTrackWorker ? onTrackWorker(activeJobForSelected) : onBookWorker(selectedWorker); }}>
                    {activeJobForSelected ? t.track_location : t.book_now}
                </Button>
                <button onClick={() => setSelectedWorkerId(null)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><ChevronDown className="w-5 h-5" /></button>
              </div>
          </div>
      )}
    </div>
  );
};
