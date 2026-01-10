
import React, { useState, useEffect } from 'react';
import { Save, Flame, Smartphone, Mail, Globe, Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { getFirebaseConfig, saveFirebaseConfig } from '../../services/firestoreService';

export const AdminFirebaseSettings: React.FC = () => {
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  });

  const [authMethods, setAuthMethods] = useState({
    phoneAuth: true,
    googleAuth: false,
    emailAuth: false,
    anonymousAuth: false
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
      const fetchConfig = async () => {
          const data = await getFirebaseConfig();
          if (data) {
              if (data.apiKey) setFirebaseConfig({
                  apiKey: data.apiKey,
                  authDomain: data.authDomain,
                  projectId: data.projectId,
                  storageBucket: data.storageBucket,
                  messagingSenderId: data.messagingSenderId,
                  appId: data.appId,
                  measurementId: data.measurementId || ''
              });
              if (data.authMethods) setAuthMethods(data.authMethods);
          }
          setLoading(false);
      };
      fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveFirebaseConfig({ ...firebaseConfig, authMethods });
    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleAuthMethod = (key: keyof typeof authMethods) => {
    setAuthMethods(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto text-orange-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">
      {showSuccess && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[5000] bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideDown">
              <CheckCircle className="w-6 h-6" />
              <span className="font-black uppercase tracking-widest text-xs">Firebase Settings Updated</span>
          </div>
      )}
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
          <Flame className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Firebase Configuration</h2>
          <p className="text-sm text-slate-500">Manage your app's connection to Firebase services.</p>
        </div>
      </div>

      {/* SDK Config */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> SDK Setup (web & mobile)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">API Key</label>
                <div className="relative">
                    <input 
                        type={showApiKey ? "text" : "password"} 
                        value={firebaseConfig.apiKey}
                        onChange={(e) => setFirebaseConfig({...firebaseConfig, apiKey: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pr-10 text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    <button 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Auth Domain</label>
                <input 
                    type="text" 
                    value={firebaseConfig.authDomain}
                    onChange={(e) => setFirebaseConfig({...firebaseConfig, authDomain: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project ID</label>
                <input 
                    type="text" 
                    value={firebaseConfig.projectId}
                    onChange={(e) => setFirebaseConfig({...firebaseConfig, projectId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Storage Bucket</label>
                <input 
                    type="text" 
                    value={firebaseConfig.storageBucket}
                    onChange={(e) => setFirebaseConfig({...firebaseConfig, storageBucket: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Messaging Sender ID</label>
                <input 
                    type="text" 
                    value={firebaseConfig.messagingSenderId}
                    onChange={(e) => setFirebaseConfig({...firebaseConfig, messagingSenderId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                />
            </div>

             <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">App ID</label>
                <input 
                    type="text" 
                    value={firebaseConfig.appId}
                    onChange={(e) => setFirebaseConfig({...firebaseConfig, appId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                />
            </div>
        </div>
      </section>

      {/* Authentication Methods */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" /> Authentication Methods
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
                onClick={() => toggleAuthMethod('phoneAuth')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    authMethods.phoneAuth ? 'bg-green-50 border-green-500' : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${authMethods.phoneAuth ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm ${authMethods.phoneAuth ? 'text-green-900' : 'text-slate-900'}`}>Phone Authentication</h4>
                        <p className="text-xs text-slate-500">OTP via SMS</p>
                    </div>
                </div>
                {authMethods.phoneAuth && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>

            <div 
                onClick={() => toggleAuthMethod('emailAuth')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    authMethods.emailAuth ? 'bg-green-50 border-green-500' : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
            >
                <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${authMethods.emailAuth ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm ${authMethods.emailAuth ? 'text-green-900' : 'text-slate-900'}`}>Email/Password</h4>
                        <p className="text-xs text-slate-500">Standard Login</p>
                    </div>
                </div>
                {authMethods.emailAuth && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>

             <div 
                onClick={() => toggleAuthMethod('googleAuth')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    authMethods.googleAuth ? 'bg-green-50 border-green-500' : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
            >
                <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${authMethods.googleAuth ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm ${authMethods.googleAuth ? 'text-green-900' : 'text-slate-900'}`}>Google Sign-In</h4>
                        <p className="text-xs text-slate-500">One-tap login</p>
                    </div>
                </div>
                {authMethods.googleAuth && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/20">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Update Firebase Config</>}
        </Button>
      </div>

    </div>
  );
};
