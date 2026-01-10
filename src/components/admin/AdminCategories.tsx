
import React, { useState } from 'react';
import { ServiceCategory } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Edit2, Trash2, Save, X, Tag, IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import { saveCategory } from '../../services/firestoreService';

interface AdminCategoriesProps {
  categories: ServiceCategory[];
  onUpdateCategories: (categories: ServiceCategory[]) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, onUpdateCategories }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceCategory>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<ServiceCategory>>({
      name: '',
      basePrice: 100,
      isActive: true
  });

  const handleEdit = (cat: ServiceCategory) => {
      setIsEditing(cat.id);
      setEditForm(cat);
  };

  const handleSaveEdit = async () => {
      if (!isEditing || !editForm.name) return;
      
      const updatedItem = { ...categories.find(c => c.id === isEditing), ...editForm } as ServiceCategory;
      await saveCategory(updatedItem);
      
      const updatedList = categories.map(c => c.id === isEditing ? updatedItem : c);
      onUpdateCategories(updatedList);
      setIsEditing(null);
      setEditForm({});
  };

  const handleAdd = async () => {
      if (!newCategory.name) return;
      
      const id = `cat_${Date.now()}`;
      const newItem: ServiceCategory = {
          id,
          name: newCategory.name,
          basePrice: newCategory.basePrice || 0,
          isActive: newCategory.isActive || false
      };
      
      await saveCategory(newItem);
      onUpdateCategories([...categories, newItem]);
      setIsAdding(false);
      setNewCategory({ name: '', basePrice: 100, isActive: true });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div>
               <h2 className="text-xl font-bold text-slate-900">Services & Pricing</h2>
               <p className="text-sm text-slate-500">Manage job categories and set base service rates.</p>
           </div>
           <Button onClick={() => setIsAdding(true)}>
               <Plus className="w-4 h-4 mr-2" /> Add Category
           </Button>
       </div>

       {isAdding && (
           <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 animate-fadeIn">
               <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                   <Plus className="w-5 h-5" /> Add New Service
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                   <div>
                       <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Service Name</label>
                       <input 
                           type="text" 
                           value={newCategory.name}
                           onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                           placeholder="e.g. AC Repair"
                           className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Base Price (₹)</label>
                       <input 
                           type="number" 
                           value={newCategory.basePrice}
                           onChange={(e) => setNewCategory({...newCategory, basePrice: Number(e.target.value)})}
                           className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Status</label>
                       <select 
                           value={newCategory.isActive ? 'active' : 'inactive'}
                           onChange={(e) => setNewCategory({...newCategory, isActive: e.target.value === 'active'})}
                           className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                       >
                           <option value="active">Active</option>
                           <option value="inactive">Inactive</option>
                       </select>
                   </div>
               </div>
               <div className="flex gap-3 justify-end">
                   <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                   <Button onClick={handleAdd}>Save Category</Button>
               </div>
           </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {categories.map(cat => (
               <div key={cat.id} className={`bg-white rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${!cat.isActive ? 'opacity-70 border-slate-200 bg-slate-50' : 'border-slate-200'}`}>
                   {isEditing === cat.id ? (
                       <div className="space-y-3">
                           <div className="flex justify-between items-center mb-2">
                               <span className="text-xs font-bold text-blue-600 uppercase">Editing</span>
                               <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                           </div>
                           <input 
                               type="text" 
                               value={editForm.name} 
                               onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                               className="w-full border border-slate-300 rounded p-2 text-sm font-bold"
                           />
                           <div className="flex items-center gap-2">
                               <span className="text-slate-500 text-sm">₹</span>
                               <input 
                                   type="number" 
                                   value={editForm.basePrice} 
                                   onChange={(e) => setEditForm({...editForm, basePrice: Number(e.target.value)})}
                                   className="w-full border border-slate-300 rounded p-2 text-sm"
                               />
                           </div>
                           <div className="flex items-center gap-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Active?</label>
                               <input 
                                   type="checkbox" 
                                   checked={editForm.isActive} 
                                   onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                                   className="w-4 h-4 text-blue-600"
                               />
                           </div>
                           <Button fullWidth size="sm" onClick={handleSaveEdit}>Save</Button>
                       </div>
                   ) : (
                       <>
                           <div className="flex justify-between items-start mb-3">
                               <div className="flex items-center gap-3">
                                   <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                       <Tag className="w-5 h-5" />
                                   </div>
                                   <div>
                                       <h3 className="font-bold text-slate-900">{cat.name}</h3>
                                       <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 w-max mt-1 ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                            {cat.isActive ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                                            {cat.isActive ? 'Active' : 'Hidden'}
                                       </span>
                                   </div>
                               </div>
                               <div className="flex gap-1">
                                   <button onClick={() => handleEdit(cat)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                       <Edit2 className="w-4 h-4" />
                                   </button>
                               </div>
                           </div>
                           
                           <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                               <span className="text-xs font-bold text-slate-500 uppercase">Base Price</span>
                               <span className="font-bold text-slate-900 flex items-center">
                                   <IndianRupee className="w-3 h-3 mr-0.5" /> {cat.basePrice}
                               </span>
                           </div>
                       </>
                   )}
               </div>
           ))}
       </div>
    </div>
  );
};
