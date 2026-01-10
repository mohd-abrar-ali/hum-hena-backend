
import React, { useState, useEffect } from 'react';
import { FileText, Save, Loader2, CheckCircle, HelpCircle, Shield } from 'lucide-react';
import { getCMSContent, saveCMSContent } from '../../services/firestoreService';
import { Button } from '../ui/Button';

export const AdminCMS: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchCMS();
  }, []);

  const fetchCMS = async () => {
    const data = await getCMSContent();
    setPages(data);
    setLoading(false);
  };

  const handleSave = async (slug: string) => {
    setSaving(slug);
    const page = pages.find(p => p.slug === slug);
    await saveCMSContent(slug, page.title, page.content);
    setSaving(null);
  };

  const updatePage = (slug: string, field: string, val: string) => {
    setPages(prev => prev.map(p => p.slug === slug ? { ...p, [field]: val } : p));
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="max-w-4xl space-y-10">
        {pages.map(page => (
            <section key={page.slug} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                            {page.slug === 'privacy' ? <Shield className="w-6 h-6" /> : page.slug === 'help' ? <HelpCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{page.title}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Live Endpoint: /{page.slug}</p>
                        </div>
                    </div>
                    <Button onClick={() => handleSave(page.slug)} disabled={saving === page.slug} className="rounded-xl shadow-lg">
                        {saving === page.slug ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Commit</>}
                    </Button>
                </div>
                
                <div className="space-y-4">
                    <input 
                        value={page.title}
                        onChange={e => updatePage(page.slug, 'title', e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 font-black text-sm outline-none focus:border-blue-500 transition-all"
                        placeholder="Page Display Title"
                    />
                    <textarea 
                        value={page.content}
                        onChange={e => updatePage(page.slug, 'content', e.target.value)}
                        className="w-full h-64 bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-medium focus:bg-white focus:border-blue-500 outline-none resize-none transition-all"
                        placeholder="Enter markdown or plain text content..."
                    />
                </div>
            </section>
        ))}
    </div>
  );
};
