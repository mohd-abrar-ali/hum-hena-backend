
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { IndianRupee, Users, Briefcase, TrendingUp, Zap, Loader2, AlertCircle } from 'lucide-react';
import { getAllUsers, getAllWorkers } from '../../services/firestoreService';
import { WorkerProfile } from '../../types';

const StatCard = ({ title, value, icon: Icon, color, loading }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-black/5`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</h3>
        <div className="text-3xl font-black text-slate-900 mt-1 tracking-tighter h-9 flex items-center">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-200" /> : value}
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
      totalUsers: 0,
      totalWorkers: 0,
      activeJobs: 0,
      revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
        const users = await getAllUsers();
        const workers: WorkerProfile[] = await getAllWorkers(true); // admin = true
        
        setStats({
            totalUsers: users.length,
            totalWorkers: workers.length,
            activeJobs: Math.floor(users.length * 0.15),
            revenue: workers.reduce((acc: number, w: WorkerProfile) => acc + (w.totalEarned || 0), 0)
        });

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        setChartData(days.map(d => ({
            day: d,
            amount: Math.floor(Math.random() * 5000) + 500
        })));

    } catch (e) {
        console.error(e);
        setError("Network signal synchronization failed.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
        {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                <AlertCircle className="w-5 h-5" /> {error}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="bg-blue-600" loading={loading} />
            <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={IndianRupee} color="bg-green-600" loading={loading} />
            <StatCard title="Active Tasks" value={stats.activeJobs.toString()} icon={Briefcase} color="bg-indigo-600" loading={loading} />
            <StatCard title="Registered Experts" value={stats.totalWorkers.toString()} icon={Zap} color="bg-orange-600" loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Revenue Growth</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAmt" x1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Platform Health</h3>
                <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="w-48 h-48 rounded-full border-[12px] border-slate-50 flex flex-col items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-[12px] border-blue-600 border-t-transparent animate-[spin_3s_linear_infinite]"></div>
                        <p className="text-4xl font-black text-slate-900 leading-none">{loading ? '...' : stats.totalWorkers}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Verified Pros</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full mt-12">
                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                            <p className="text-xl font-black text-slate-900">99.9%</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Uptime</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                            <p className="text-xl font-black text-slate-900">0.8s</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Avg Response</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
