import React, { useState } from 'react';
import { Send, Users, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

export const AdminMessages: React.FC = () => {
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [targetGroup, setTargetGroup] = useState('ALL');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
      if (!message || !title) return;
      setIsSending(true);
      
      // Simulate API
      setTimeout(() => {
          setIsSending(false);
          alert(`Message "${title}" sent to ${targetGroup} users!`);
          setMessage('');
          setTitle('');
      }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Broadcast Message</h2>
                    <p className="text-sm text-slate-500">Send in-app notifications to users.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Audience</label>
                    <div className="flex gap-4">
                        {['ALL', 'WORKERS', 'CUSTOMERS'].map(g => (
                            <label key={g} className={`flex-1 border rounded-xl p-3 cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                                targetGroup === g ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}>
                                <input 
                                    type="radio" 
                                    name="target" 
                                    checked={targetGroup === g} 
                                    onChange={() => setTargetGroup(g)}
                                    className="hidden" 
                                />
                                <Users className="w-4 h-4" />
                                <span className="text-sm">{g === 'ALL' ? 'All Users' : g === 'WORKERS' ? 'Workers Only' : 'Customers Only'}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notification Title</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. System Maintenance Alert"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Body</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>

                <div className="pt-4">
                    <Button 
                        fullWidth 
                        size="lg" 
                        onClick={handleSend}
                        disabled={!title || !message || isSending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSending ? 'Sending...' : (
                            <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Broadcast</span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};