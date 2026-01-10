
import React, { useState, useEffect } from 'react';
import { Search, Edit2, Loader2, Check, UserX, UserCheck, Trash2, Key, Save, Plus, X, Shield, CheckSquare, Square } from 'lucide-react';
import { getAllUsers, deleteUser, setUserStatus, saveUserProfile, resetUserPassword } from '../../services/firestoreService';
import { UserProfile, UserRole, AdminPermission } from '../../types';
import { Button } from '../ui/Button';

export const AdminAdministrators: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserProfile> & { password?: string }>({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: UserRole.ADMIN,
      gender: 'Male',
      avatarUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      walletBalance: 0,
      status: 'active',
      adminPermissions: [],
      password: ''
  });

  const availablePermissions: { id: AdminPermission, label: string }[] = [
      { id: 'dashboard', label: 'Dashboard Overview' },
      { id: 'users', label: 'Manage Users' },
      { id: 'administrators', label: 'Manage Administrators' },
      { id: 'workers', label: 'Manage Experts' },
      { id: 'categories', label: 'Service Categories' },
      { id: 'withdrawals', label: 'Payouts & Wallet' },
      { id: 'ads', label: 'Advertisements' },
      { id: 'messages', label: 'Broadcast Messages' },
      { id: 'cms', label: 'CMS Content' },
      { id: 'reports', label: 'Reports & Safety' },
      { id: 'settings', label: 'System Settings' },
      { id: 'firebase', label: 'Infrastructure (Firebase)' }
  ];

  const fetchData = async () => {
    try {
        const data = await getAllUsers();
        setUsers(data.filter(u => u.role === UserRole.ADMIN));
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handleCreateUser = async () => {
      if (!newUser.phone || !newUser.firstName || !newUser.password) {
          showToast("Please fill all required fields including password.", "error");
          return;
      }
      setIsLoading(true);
      
      // Save with password
      await saveUserProfile(newUser as UserProfile & { password?: string });
      
      showToast(`Admin ${newUser.firstName} created successfully.`);
      setIsAddingUser(false);
      setNewUser({ 
          firstName: '', lastName: '', email: '', phone: '', role: UserRole.ADMIN, 
          adminPermissions: [], password: '', gender: 'Male', 
          avatarUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          status: 'active'
      });
      fetchData();
  };

  const handleToggleStatus = async (user: UserProfile) => {
      const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
      await setUserStatus(user.phone, newStatus);
      showToast(`Admin ${user.firstName} is now ${newStatus}.`);
      fetchData();
  };

  const handleResetPassword = async (user: UserProfile) => {
      if (confirm(`Send password reset link to ${user.email}?`)) {
          const res = await resetUserPassword(user.phone);
          if (res.success) {
              showToast(`Reset email sent to ${user.email}.`);
          }
      }
  };

  const handleDelete = async (user: UserProfile) => {
      if (confirm(`Permanently delete admin ${user.firstName}? This cannot be undone.`)) {
          await deleteUser(user.phone);
          showToast(`Admin account deleted.`);
          fetchData();
      }
  };

  const handleUpdateUser = async () => {
      if (!editingUser) return;
      await saveUserProfile(editingUser);
      showToast(`Admin ${editingUser.firstName} updated.`);
      setEditingUser(null);
      fetchData();
  };

  const togglePermission = (permId: AdminPermission, isNew: boolean) => {
      if (isNew) {
          const current = newUser.adminPermissions || [];
          const updated = current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId];
          setNewUser({ ...newUser, adminPermissions: updated });
      } else if (editingUser) {
          const current = editingUser.adminPermissions || [];
          const updated = current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId];
          setEditingUser({ ...editingUser, adminPermissions: updated });
      }
  };

  const toggleAllPermissions = (isNew: boolean) => {
      const allIds = availablePermissions.map(p => p.id);
      if (isNew) {
          const isFull = newUser.adminPermissions?.length === allIds.length;
          setNewUser({ ...newUser, adminPermissions: isFull ? [] : allIds });
      } else if (editingUser) {
          const isFull = editingUser.adminPermissions?.length === allIds.length;
          setEditingUser({ ...editingUser, adminPermissions: isFull ? [] : allIds });
      }
  };

  const filteredUsers = users.filter(u => 
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.phone?.includes(searchTerm)
  );

  const PermissionSelector = ({ permissions, isNew }: { permissions?: AdminPermission[], isNew: boolean }) => {
      const currentPerms = permissions || [];
      const allSelected = currentPerms.length === availablePermissions.length;

      return (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
              <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Control</span>
                  <button type="button" onClick={() => toggleAllPermissions(isNew)} className="text-[10px] font-bold text-blue-600 hover:underline">
                      {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map(perm => (
                      <div 
                          key={perm.id} 
                          onClick={() => togglePermission(perm.id, isNew)}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                              currentPerms.includes(perm.id) 
                              ? 'bg-blue-100 border-blue-200 text-blue-800' 
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                      >
                          {currentPerms.includes(perm.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          <span className="text-xs font-bold">{perm.label}</span>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  if (isLoading && users.length === 0) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 relative">
        {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-slideDown ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}`}><Check className="w-4 h-4 text-green-400" /><span className="text-xs font-black uppercase tracking-widest leading-none">{toast.message}</span></div>}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-xl font-black text-slate-900">Administration Team</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage system administrators and permissions</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <input type="text" placeholder="Search admins..." className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-full md:w-64 outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <Button onClick={() => setIsAddingUser(true)} className="rounded-xl whitespace-nowrap"><Plus className="w-4 h-4 mr-2" /> Add Admin</Button>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b text-slate-400 uppercase font-black text-[9px] tracking-widest">
                        <tr>
                            <th className="px-8 py-6">Admin Profile</th>
                            <th className="px-8 py-6">Access Level</th>
                            <th className="px-8 py-6">Account Status</th>
                            <th className="px-8 py-6">Contact Number</th>
                            <th className="px-8 py-6 text-right">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map((user) => (
                            <tr key={user.phone} className={`hover:bg-slate-50 transition-colors ${user.status === 'suspended' ? 'opacity-60 bg-red-50/10' : ''}`}>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <img src={user.avatarUrl} className="w-10 h-10 rounded-2xl object-cover border border-slate-100" alt="" />
                                        <div>
                                            <p className="font-black text-slate-900 leading-none">{user.firstName} {user.lastName}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 font-bold">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg w-max uppercase tracking-widest">
                                        {!user.adminPermissions || user.adminPermissions.length === 0 ? 'Super Admin' : `${user.adminPermissions.length} Permissions`}
                                    </p>
                                </td>
                                <td className="px-8 py-5"><span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${user.status === 'suspended' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{user.status || 'active'}</span></td>
                                <td className="px-8 py-5 text-slate-600 font-bold">{user.phone}</td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleResetPassword(user)} 
                                            className="p-2 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all"
                                            title="Send Password Reset"
                                        >
                                            <Key className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleToggleStatus(user)} className="p-2 rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all">{user.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}</button>
                                        <button onClick={() => setEditingUser(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(user)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Create User Modal */}
        {isAddingUser && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
                <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-scaleIn space-y-6 max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-slate-900">Add New Admin</h3>
                        <button onClick={() => setIsAddingUser(false)} className="p-2 text-slate-300 hover:text-red-500"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">First Name</label>
                                <input type="text" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Last Name</label>
                                <input type="text" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contact Phone</label>
                            <input type="tel" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" placeholder="10-digit number" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email Address</label>
                            <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password</label>
                            <input 
                                type="password" 
                                value={newUser.password} 
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" 
                                placeholder="Set login password"
                            />
                        </div>
                        
                        <PermissionSelector permissions={newUser.adminPermissions} isNew={true} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" fullWidth onClick={() => setIsAddingUser(false)} className="h-14 font-black">Cancel</Button>
                        <Button fullWidth onClick={handleCreateUser} className="h-14 rounded-2xl shadow-xl shadow-blue-600/20">Create Admin</Button>
                    </div>
                </div>
            </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
                <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-scaleIn space-y-6 max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-slate-900">Update Admin</h3>
                        <button onClick={() => setEditingUser(null)} className="p-2 text-slate-300 hover:text-red-500"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">First Name</label>
                                <input type="text" value={editingUser.firstName} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Last Name</label>
                                <input type="text" value={editingUser.lastName} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email Address</label>
                            <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" />
                        </div>

                        <PermissionSelector permissions={editingUser.adminPermissions} isNew={false} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" fullWidth onClick={() => setEditingUser(null)} className="h-14 font-black">Discard</Button>
                        <Button fullWidth onClick={handleUpdateUser} className="h-14 rounded-2xl shadow-xl shadow-blue-600/20">Save Profile</Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
