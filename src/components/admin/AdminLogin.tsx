
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Shield, Lock, AlertCircle, ArrowRight, User } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulation of backend authentication
    setTimeout(() => {
        if (username === 'admin' && password === 'ChangeMe123!') {
            onLoginSuccess();
        } else {
            setError('Invalid administration credentials.');
            setIsLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border-4 border-slate-800">
            <div className="bg-slate-50 p-8 border-b border-slate-100 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">Secure Access Protocol</p>
                </div>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-red-100">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Username Identity</label>
                    <div className="relative">
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 font-bold focus:border-blue-600 focus:shadow-lg outline-none transition-all placeholder:text-slate-300"
                            placeholder="Enter ID"
                        />
                        <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Security Key</label>
                    <div className="relative">
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 font-bold focus:border-blue-600 focus:shadow-lg outline-none transition-all placeholder:text-slate-300"
                            placeholder="••••••••"
                        />
                        <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    </div>
                </div>

                <Button 
                    fullWidth 
                    size="lg" 
                    type="submit" 
                    disabled={isLoading || !username || !password}
                    className="bg-slate-900 hover:bg-black h-16 rounded-2xl shadow-xl shadow-slate-900/20"
                >
                    {isLoading ? 'Authenticating...' : <span className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">Access Dashboard <ArrowRight className="w-4 h-4"/></span>}
                </Button>
            </form>

            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Restricted Area • IP: {window.location.hostname}
                </p>
            </div>
        </div>
    </div>
  );
};
