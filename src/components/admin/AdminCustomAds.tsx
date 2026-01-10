import React, { useState, useEffect } from 'react';
import { AdBanner } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Trash2, Edit2, ExternalLink, Image as ImageIcon, Layout, Power, CheckCircle, XCircle, Loader2, Globe, MapPin, X } from 'lucide-react';
import { listenToAds, saveAd, deleteAd } from '../../services/firestoreService';

export const AdminCustomAds: React.FC = () => {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAd, setCurrentAd] = useState<Partial<AdBanner>>({
      position: 'TOP',
      isActive: true,
      title: '',
      imageUrl: '',
      linkUrl: '',
      isUniversal: true,
      city: ''
  });

  useEffect(() => {
      const unsub = listenToAds((data: AdBanner[]) => {
          setAds(data);
          setIsLoading(false);
      });
      return () => unsub();
  }, []);

  const handleSave = async () => {
      if (!currentAd.imageUrl) return;

      const adToSave: AdBanner = {
          id: currentAd.id || `ad-${Date.now()}`,
          imageUrl: currentAd.imageUrl!,
          linkUrl: currentAd.linkUrl || '',
          position: (currentAd.position as 'TOP' | 'BOTTOM') || 'TOP',
          isActive: currentAd.isActive ?? true,
          title: currentAd.title || 'Advertisement',
          isUniversal: currentAd.isUniversal ?? true,
          city: currentAd.isUniversal ? '' : currentAd.city || ''
      };

      await saveAd(adToSave);
      setIsEditing(false);
      resetForm();
  };

  const resetForm = () => {
    setCurrentAd({ 
        position: 'TOP', 
        isActive: true, 
        title: '', 
        imageUrl: '', 
        linkUrl: '', 
        isUniversal: true, 
        city: '' 
    });
  };

  const handleDelete = async (id: string) => {
      if (confirm('Permanently remove this advertisement from the platform?')) {
          await deleteAd(id);
      }
  };

  const openEdit = (ad: AdBanner) => {
      setCurrentAd(ad);
      setIsEditing(true);
  };

  const toggleStatus = async (ad: AdBanner) => {
      await saveAd({ ...ad, isActive: !ad.isActive });
  };

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Synchronizing Ad Protocol...</p>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       
       <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">Advertisement Engine</h2>
               <p className="text-sm text-slate-500 font-medium">Manage promotional banners with location-based targeting.</p>
           </div>
           <Button onClick={() => { resetForm(); setIsEditing(true); }} className="h-14 px-8 rounded-2xl shadow-blue-600/20">
               <Plus className="w-5 h-5 mr-2" /> Create Campaign
           </Button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {ads.map(ad => (
               <div key={ad.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                   <div className="relative h-40 bg-slate-100">
                       <img src={ad.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={ad.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                       
                       <div className="absolute top-4 right-4 flex gap-2">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                               ad.position === 'TOP' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                           }`}>
                               {ad.position}
                           </span>
                           <button 
                               onClick={() => toggleStatus(ad)}
                               className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-90 ${
                               ad.isActive ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                           }`}>
                               {ad.isActive ? 'Live' : 'Paused'}
                           </button>
                       </div>

                       <div className="absolute bottom-4 left-4 right-4">
                           <div className="flex items-center gap-2 mb-1">
                                {ad.isUniversal ? (
                                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                                        <Globe className="w-2.5 h-2.5" /> Universal
                                    </span>
                                ) : (
                                    <span className="bg-amber-500/90 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                                        <MapPin className="w-2.5 h-2.5" /> {ad.city}
                                    </span>
                                )}
                           </div>
                           <h3 className="text-white font-black text-sm uppercase tracking-wider truncate">{ad.title}</h3>
                       </div>
                   </div>
                   
                   <div className="p-6 flex items-center justify-between bg-white border-t border-slate-50">
                       <div className="flex-1 min-w-0 pr-4">
                           {ad.linkUrl ? (
                               <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] truncate">
                                   <ExternalLink className="w-3 h-3 shrink-0" />
                                   <span className="truncate">{ad.linkUrl}</span>
                               </div>
                           ) : (
                               <span className="text-slate-300 font-bold text-[10px] uppercase">No Click Action</span>
                           )}
                       </div>
                       <div className="flex gap-2">
                           <button 
                                onClick={() => openEdit(ad)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                title="Edit Ad"
                           >
                               <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                                onClick={() => handleDelete(ad.id)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                                title="Delete Ad"
                           >
                               <Trash2 className="w-4 h-4" />
                           </button>
                       </div>
                   </div>
               </div>
           ))}
           
           {ads.length === 0 && (
               <div className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                       <ImageIcon className="w-8 h-8" />
                   </div>
                   <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Advertisements Configured</p>
               </div>
           )}
       </div>

       {/* Edit/Create Modal */}
       {isEditing && (
           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
               <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[95vh]">
                   <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                               {currentAd.id ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                           </div>
                           <div>
                               <h3 className="text-xl font-black text-slate-900">Campaign Architect</h3>
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Deployment Settings</p>
                           </div>
                       </div>
                       <button onClick={() => setIsEditing(false)} className="bg-white p-2 rounded-xl text-slate-400 hover:text-red-500 shadow-sm transition-all"><X className="w-6 h-6" /></button>
                   </div>
                   
                   <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide flex-1">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Campaign Headline</label>
                                    <input 
                                        type="text" 
                                        value={currentAd.title || ''}
                                        onChange={(e) => setCurrentAd({...currentAd, title: e.target.value})}
                                        placeholder="e.g. 50% Off Plumbing"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-black focus:border-blue-500 outline-none transition-all shadow-inner"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Artwork Data (URL)</label>
                                    <input 
                                        type="text" 
                                        value={currentAd.imageUrl || ''}
                                        onChange={(e) => setCurrentAd({...currentAd, imageUrl: e.target.value})}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:border-blue-500 outline-none transition-all shadow-inner"
                                    />
                                </div>
                           </div>

                           <div className="space-y-4">
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Artwork Preview</label>
                               <div className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner flex flex-col items-center justify-center relative group">
                                   {currentAd.imageUrl ? (
                                       <img src={currentAd.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                   ) : (
                                       <>
                                         <ImageIcon className="w-10 h-10 text-slate-300" />
                                         <span className="text-[10px] font-black text-slate-300 mt-2">Waiting for Signal...</span>
                                       </>
                                   )}
                                   <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-lg text-[8px] font-black uppercase text-white shadow-xl ${currentAd.position === 'TOP' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                                       {currentAd.position} Placement
                                   </div>
                               </div>
                           </div>
                       </div>

                       <div className="h-px bg-slate-100"></div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Location Targeting</label>
                                <div className="space-y-4">
                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                        <button 
                                            onClick={() => setCurrentAd({...currentAd, isUniversal: true})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                currentAd.isUniversal 
                                                ? 'bg-white text-blue-600 shadow-sm' 
                                                : 'text-slate-400'
                                            }`}
                                        >
                                            <Globe className="w-3.5 h-3.5" /> Universal
                                        </button>
                                        <button 
                                            onClick={() => setCurrentAd({...currentAd, isUniversal: false})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                !currentAd.isUniversal 
                                                ? 'bg-white text-amber-600 shadow-sm' 
                                                : 'text-slate-400'
                                            }`}
                                        >
                                            <MapPin className="w-3.5 h-3.5" /> City Specific
                                        </button>
                                    </div>
                                    
                                    {!currentAd.isUniversal && (
                                        <input 
                                            type="text" 
                                            value={currentAd.city || ''}
                                            onChange={(e) => setCurrentAd({...currentAd, city: e.target.value})}
                                            placeholder="Enter target city (e.g. Mumbai)"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-amber-500 outline-none animate-slideDown shadow-inner"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Placement Configuration</label>
                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                        <button 
                                            onClick={() => setCurrentAd({...currentAd, position: 'TOP'})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                currentAd.position === 'TOP' 
                                                ? 'bg-white text-indigo-600 shadow-sm' 
                                                : 'text-slate-400'
                                            }`}
                                        >
                                            Header
                                        </button>
                                        <button 
                                            onClick={() => setCurrentAd({...currentAd, position: 'BOTTOM'})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                currentAd.position === 'BOTTOM' 
                                                ? 'bg-white text-indigo-600 shadow-sm' 
                                                : 'text-slate-400'
                                            }`}
                                        >
                                            Footer
                                        </button>
                                    </div>
                                </div>
                            </div>
                       </div>

                       <div className="space-y-4">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination Relay (Redirect URL)</label>
                           <div className="relative">
                               <input 
                                   type="text" 
                                   value={currentAd.linkUrl || ''}
                                   onChange={(e) => setCurrentAd({...currentAd, linkUrl: e.target.value})}
                                   placeholder="https://skilllink.com/promo"
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-xs font-medium focus:border-blue-500 outline-none transition-all shadow-inner"
                               />
                               <ExternalLink className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                           </div>
                       </div>
                   </div>

                   <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4 shrink-0">
                       <Button variant="ghost" fullWidth onClick={() => setIsEditing(false)} className="h-14 font-black text-slate-400">Abort</Button>
                       <Button fullWidth onClick={handleSave} disabled={!currentAd.imageUrl || (!currentAd.isUniversal && !currentAd.city)} className="h-14 rounded-2xl shadow-xl shadow-blue-600/20 font-black">
                           Deploy Campaign Signal
                       </Button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};