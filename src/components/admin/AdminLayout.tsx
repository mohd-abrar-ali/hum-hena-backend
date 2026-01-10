
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Hammer, Settings, LogOut, Menu, X, Bell, Flame, MessageSquare, MonitorPlay, Tags, ChevronRight, LayoutGrid, ShieldAlert, FileText, Wallet, Shield } from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminWorkers } from './AdminWorkers';
import { AdminSettings } from './AdminSettings';
import { AdminMessages } from './AdminMessages';
import { AdminFirebaseSettings } from './AdminFirebaseSettings';
import { AdminCustomAds } from './AdminCustomAds';
import { AdminCategories } from './AdminCategories';
import { AdminReports } from './AdminReports';
import { AdminCMS } from './AdminCMS';
import { AdminWithdrawals } from './AdminWithdrawals';
import { AdminAdministrators } from './AdminAdministrators';
import { ServiceCategory, PlatformFeeConfig, UserProfile, AdminPermission } from '../../types';

interface AdminLayoutProps {
  currentUser: UserProfile;
  onLogout: () => void;
  categories: ServiceCategory[];
  onUpdateCategories: (categories: ServiceCategory[]) => void;
  feeConfig: PlatformFeeConfig;
  onUpdateFeeConfig: (config: PlatformFeeConfig) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentUser, onLogout, categories, onUpdateCategories, feeConfig, onUpdateFeeConfig }) => {
  const [activeTab, setActiveTab] = useState<AdminPermission>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If user has no specific permissions array, assume they are a legacy super-admin and have access to everything.
  const hasAccess = (permission: AdminPermission) => {
      if (!currentUser.adminPermissions || currentUser.adminPermissions.length === 0) return true;
      return currentUser.adminPermissions.includes(permission);
  };

  const menuItems: { id: AdminPermission, icon: any, label: string }[] = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
      { id: 'users', icon: Users, label: 'User Directory' },
      { id: 'administrators', icon: Shield, label: 'Administrators' },
      { id: 'workers', icon: Hammer, label: 'Experts List' },
      { id: 'categories', icon: Tags, label: 'Services' },
      { id: 'withdrawals', icon: Wallet, label: 'Payouts' },
      { id: 'ads', icon: MonitorPlay, label: 'Ad Banners' },
      { id: 'messages', icon: MessageSquare, label: 'Broadcasts' },
      { id: 'cms', icon: FileText, label: 'Content (CMS)' },
      { id: 'reports', icon: ShieldAlert, label: 'Reports & Safety' },
      { id: 'firebase', icon: Flame, label: 'Infrastructure' },
      { id: 'settings', icon: Settings, label: 'System Settings' },
  ];

  // Filter menu items based on access
  const visibleMenuItems = menuItems.filter(item => hasAccess(item.id));

  // Ensure active tab is valid
  useEffect(() => {
      if (!hasAccess(activeTab) && visibleMenuItems.length > 0) {
          setActiveTab(visibleMenuItems[0].id);
      }
  }, [currentUser.adminPermissions, visibleMenuItems, activeTab]);

  const NavItem: React.FC<{ id: AdminPermission, icon: any, label: string }> = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 shrink-0" />
        <span className="font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>
      </div>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans w-full">
      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 z-[95] lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] w-72 bg-slate-950 flex flex-col shrink-0 transition-transform duration-500 lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-slate-900 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><LayoutGrid className="w-6 h-6 text-white" /></div>
              <h1 className="text-xl font-black text-white tracking-tighter">Admin Panel</h1>
           </div>
           <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-500"><X className="w-6 h-6" /></button>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto scrollbar-hide">
           {visibleMenuItems.map(item => (
               <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} />
           ))}
        </nav>
        <div className="p-6 border-t border-slate-900">
            <div className="flex items-center gap-3 mb-4 px-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                    {currentUser.firstName.charAt(0)}
                </div>
                <div>
                    <p className="text-white text-xs font-bold">{currentUser.firstName}</p>
                    <p className="text-slate-500 text-[9px] uppercase tracking-widest">
                        {currentUser.adminPermissions?.length ? 'Limited Admin' : 'Super Admin'}
                    </p>
                </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em]">
                <LogOut className="w-4 h-4" /> Log Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[90] shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2.5 text-slate-600 bg-slate-50 rounded-xl border border-slate-100"><Menu className="w-5 h-5" /></button>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-widest">{activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}</h1>
            </div>
            <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <p className="text-[10px] font-black text-slate-900">Platform Admin</p>
                    <p className="text-[8px] font-bold text-green-500 uppercase">Live Production</p>
                </div>
                <button className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg active:scale-90"><Bell className="w-5 h-5" /></button>
            </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
            <div className="max-w-7xl mx-auto w-full animate-fadeIn pb-20">
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'users' && <AdminUsers />}
              {activeTab === 'administrators' && <AdminAdministrators />}
              {activeTab === 'workers' && <AdminWorkers />}
              {activeTab === 'categories' && <AdminCategories categories={categories} onUpdateCategories={onUpdateCategories} />}
              {activeTab === 'messages' && <AdminMessages />}
              {activeTab === 'ads' && <AdminCustomAds />}
              {activeTab === 'cms' && <AdminCMS />}
              {activeTab === 'withdrawals' && <AdminWithdrawals />}
              {activeTab === 'firebase' && <AdminFirebaseSettings />}
              {activeTab === 'settings' && <AdminSettings feeConfig={feeConfig} onUpdateFeeConfig={onUpdateFeeConfig} />}
              {activeTab === 'reports' && <AdminReports />}
            </div>
        </main>
      </div>
    </div>
  );
};
