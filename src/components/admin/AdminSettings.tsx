
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Eye, EyeOff, Database, Layers, Globe, IndianRupee, Zap, Gift, TrendingUp, TrendingDown, Image as ImageIcon, Video, Monitor, CheckCircle, Loader2, QrCode, CreditCard, Landmark, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import { PlatformFeeConfig } from '../../types';
import { savePlatformConfig, getApiKeys, saveApiKeys } from '../../services/firestoreService';

interface AdminSettingsProps {
    feeConfig: PlatformFeeConfig;
    onUpdateFeeConfig: (config: PlatformFeeConfig) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ feeConfig, onUpdateFeeConfig }) => {
  const [apiKeys, setApiKeys] = useState({ googleMaps: '' });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
      getApiKeys().then(keys => {
          setApiKeys({ googleMaps: keys.googleMaps || '' });
      });
  }, []);

  const toggleShowKey = (key: string) => {
      setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateConfig = async (key: keyof PlatformFeeConfig, value: any) => {
      const newConfig = { ...feeConfig, [key]: value };
      onUpdateFeeConfig(newConfig);
      await savePlatformConfig(newConfig);
  };

  const handleGlobalSave = async () => {
      setIsSaving(true);
      await saveApiKeys({ googleMaps: apiKeys.googleMaps });
      await new Promise(r => setTimeout(r, 800));
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8 pb-32">
        {showSuccess && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[5000] bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideDown">
                <CheckCircle className="w-6 h-6" />
                <span className="font-black uppercase tracking-widest text-xs">System Config Updated Globally</span>
            </div>
        )}

        {/* Payment Configuration */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Landmark className="w-6 h-6 text-green-600" /> Payment & Settlements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Platform UPI ID</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={feeConfig.upiId}
                                onChange={(e) => handleUpdateConfig('upiId', e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-xs font-black focus:border-green-500 outline-none transition-all shadow-inner"
                                placeholder="humhena@upi"
                            />
                            <Zap className="absolute right-4 top-4 w-5 h-5 text-slate-300" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Bank Details</label>
                        <textarea 
                            value={feeConfig.bankDetails}
                            onChange={(e) => handleUpdateConfig('bankDetails', e.target.value)}
                            className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-xs font-bold focus:border-green-500 outline-none transition-all shadow-inner resize-none"
                            placeholder="Bank Name, Account No, IFSC"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Platform Commission (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={feeConfig.baseCommissionPercent}
                                onChange={(e) => handleUpdateConfig('baseCommissionPercent', Number(e.target.value))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-lg font-black focus:border-green-500 outline-none transition-all shadow-inner"
                            />
                            <span className="absolute right-4 top-4 font-black text-slate-300">%</span>
                        </div>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase">System Free Mode</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">0% Commission for all</p>
                        </div>
                        <button 
                            onClick={() => handleUpdateConfig('isSystemFreeMode', !feeConfig.isSystemFreeMode)}
                            className={`w-12 h-7 rounded-full p-1 transition-all ${feeConfig.isSystemFreeMode ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${feeConfig.isSystemFreeMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* API Configuration */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Key className="w-6 h-6 text-blue-600" /> API Connections
            </h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Google Maps API Key</label>
                    <div className="relative">
                        <input 
                            type={showKeys['gmaps'] ? "text" : "password"}
                            value={apiKeys.googleMaps}
                            onChange={(e) => setApiKeys({...apiKeys, googleMaps: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-xs font-mono font-bold focus:border-blue-500 outline-none transition-all shadow-inner pr-12"
                            placeholder="AIzaSy..."
                        />
                        <button 
                            onClick={() => toggleShowKey('gmaps')}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                        >
                            {showKeys['gmaps'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* Landing Page Visuals */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Monitor className="w-6 h-6 text-indigo-600" /> Frontend Visuals
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Background Media Type</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => handleUpdateConfig('landingBackgroundType', 'image')}
                            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${feeConfig.landingBackgroundType === 'image' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            <ImageIcon className="w-4 h-4 mx-auto mb-1" /> Image
                        </button>
                        <button 
                            onClick={() => handleUpdateConfig('landingBackgroundType', 'video')}
                            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${feeConfig.landingBackgroundType === 'video' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            <Video className="w-4 h-4 mx-auto mb-1" /> Video
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Media Source URL</label>
                    <input 
                        type="text" 
                        value={feeConfig.landingBackgroundType === 'video' ? feeConfig.landingVideoUrl : feeConfig.landingImageUrl}
                        onChange={(e) => handleUpdateConfig(feeConfig.landingBackgroundType === 'video' ? 'landingVideoUrl' : 'landingImageUrl', e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-xs font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                    />
                </div>
            </div>
        </section>

        <div className="fixed bottom-6 right-6 z-[4000]">
            <Button onClick={handleGlobalSave} size="lg" className="h-16 px-8 rounded-2xl shadow-2xl shadow-blue-600/30 bg-slate-900 hover:bg-black">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Configuration</>}
            </Button>
        </div>
    </div>
  );
};
