
import React from 'react';
import { WorkerProfile } from '../types';
import { Star, MapPin, BadgeCheck, Clock, ChevronRight } from 'lucide-react';

interface WorkerCardProps {
  worker: WorkerProfile;
  onClick: () => void;
  isSelected?: boolean;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onClick, isSelected }) => {
  // Mock ETA calculation: 5 mins base + 4 mins per km
  const eta = Math.ceil(5 + (worker.distanceKm * 4));

  return (
    <div 
      onClick={onClick}
      className={`group relative rounded-xl p-3 border shadow-sm flex gap-3 cursor-pointer transition-all duration-200
        ${isSelected 
            ? 'bg-blue-50/50 border-blue-600 ring-1 ring-blue-600 shadow-md' 
            : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
        }
      `}
    >
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[200px] bg-slate-900/95 backdrop-blur text-white text-xs rounded-lg p-3 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
          <div className="font-bold mb-1 pb-1 border-b border-white/10">
              {worker.currentJobStatus || 'Ready for Work'}
          </div>
          <div className="flex items-center gap-3 text-slate-300">
              <span>Est. Arrival:</span>
              <span className="font-medium text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{eta} mins
              </span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900/95 rotate-45"></div>
      </div>

      <div className="relative shrink-0">
        <img 
          src={worker.avatarUrl} 
          alt={worker.name} 
          className="w-14 h-14 rounded-full object-cover border border-slate-100 bg-slate-50"
        />
        {worker.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
            {worker.name}
            {worker.verificationStatus === 'verified' && (
               <span title="Verified Pro"><BadgeCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-50" /></span>
            )}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded leading-none">
                ₹{worker.hourlyRate}+
            </span>
            <span className="text-[7px] text-slate-400 font-black uppercase mt-1">
                Starting Rate
            </span>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 mb-1 truncate">{worker.skill}</p>
        
        {worker.tags && worker.tags.length > 0 && (
            <div className="flex gap-1 overflow-hidden mb-2">
                {worker.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[7px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {tag}
                    </span>
                ))}
                {worker.tags.length > 2 && <span className="text-[7px] text-slate-300 font-bold">+{worker.tags.length - 2} more</span>}
            </div>
        )}

        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
             <span className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                <Clock className="w-3 h-3" /> ~{eta} mins
             </span>
             <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {worker.distanceKm} km
             </span>
             <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {worker.rating}
             </span>
        </div>
      </div>

      <div className="flex items-center justify-center pl-2">
         <ChevronRight className={`w-5 h-5 transition-colors ${isSelected ? 'text-blue-500' : 'text-slate-300'}`} />
      </div>
    </div>
  );
};
