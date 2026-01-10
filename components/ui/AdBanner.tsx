
import React from 'react';
import { AdBanner as AdBannerType } from '../../types';
import { ExternalLink, X } from 'lucide-react';

interface AdBannerProps {
  ad: AdBannerType;
  onClose?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ ad, onClose }) => {
  if (!ad || !ad.isActive) return null;

  return (
    <div className={`relative w-full overflow-hidden bg-slate-100 ${ad.position === 'TOP' ? 'border-b' : 'border-t'} border-slate-200 shrink-0`}>
      <a 
        href={ad.linkUrl || '#'} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative w-full h-full"
      >
         <img 
            src={ad.imageUrl} 
            alt={ad.title || 'Advertisement'} 
            className="w-full h-16 md:h-20 object-cover"
         />
         <div className="absolute top-1 right-1 bg-black/40 text-[8px] text-white px-1 rounded uppercase font-bold tracking-wider">
             Sponsored
         </div>
         {ad.linkUrl && (
             <div className="absolute bottom-2 right-2 bg-white/90 text-blue-600 p-1 rounded-full shadow-sm">
                 <ExternalLink className="w-3 h-3" />
             </div>
         )}
      </a>
      {onClose && (
        <button 
            onClick={(e) => {
                e.preventDefault();
                onClose();
            }}
            className="absolute top-1 left-1 bg-white/80 p-0.5 rounded-full text-slate-500 hover:bg-white"
        >
            <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
