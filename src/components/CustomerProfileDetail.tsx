
import React from 'react';
import { ArrowLeft, MapPin, Shield, Phone, MessageCircle, Star } from 'lucide-react';
import { Button } from './ui/Button';

interface CustomerProfileDetailProps {
  name: string;
  location?: string;
  onBack: () => void;
}

export const CustomerProfileDetail: React.FC<CustomerProfileDetailProps> = ({ name, location, onBack }) => {
  return (
    <div className="h-full flex flex-col bg-white animate-slideInRight">
       {/* Header */}
       <div className="bg-slate-900 h-32 relative shrink-0">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 bg-slate-200 rounded-full border-4 border-white flex items-center justify-center text-2xl font-bold text-slate-500 shadow-sm">
                    {name.charAt(0)}
                </div>
            </div>
       </div>

       <div className="pt-12 px-6 pb-6 flex-1 overflow-y-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{name}</h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                <MapPin className="w-4 h-4" /> {location || 'Location Hidden'}
            </div>

            <div className="flex gap-4 mb-8 border-b border-slate-100 pb-6">
                <div>
                    <span className="flex items-center gap-1 text-xl font-bold text-slate-900">
                        4.9 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </span>
                    <span className="text-xs text-slate-500">Avg Rating</span>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div>
                    <span className="block text-xl font-bold text-slate-900">12</span>
                    <span className="text-xs text-slate-500">Jobs Posted</span>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div>
                    <span className="block text-xl font-bold text-slate-900">100%</span>
                    <span className="text-xs text-slate-500">Payment Rate</span>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-slate-900 mb-2">About Customer</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Verified customer on SkillLink since 2023. Frequently requests home maintenance services and has a reputation for timely payments.
                    </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm">Identity Verified</h4>
                        <p className="text-xs text-blue-700 mt-1">
                            Phone number and payment methods are verified by the platform.
                        </p>
                    </div>
                </div>
            </div>
       </div>

       <div className="p-4 border-t border-slate-200 bg-white shrink-0">
            <div className="flex gap-3">
                <Button variant="outline" fullWidth className="flex items-center justify-center gap-2" onClick={() => alert("Calling customer...")}>
                    <Phone className="w-4 h-4" /> Call
                </Button>
                <Button variant="primary" fullWidth className="flex items-center justify-center gap-2" onClick={() => alert("Starting chat...")}>
                    <MessageCircle className="w-4 h-4" /> Chat
                </Button>
            </div>
       </div>
    </div>
  );
};
