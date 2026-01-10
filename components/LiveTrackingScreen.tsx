
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, MessageCircle, Navigation, MapPin, ShieldCheck, Clock, Shield, User, ShieldAlert, Navigation2 } from 'lucide-react';
import { JobRequest, UserRole } from '../types';
import { ReportModal } from './ReportModal';

interface LiveTrackingScreenProps {
  job: JobRequest;
  onBack: () => void;
  onChat?: () => void;
  onCall?: () => void;
  perspective?: 'customer' | 'worker';
}

const TRACKING_MAP_STYLE = [
  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
  { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#f1f5f9" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#e2e8f0" }] }
];

export const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({ 
  job, 
  onBack, 
  onChat, 
  onCall,
  perspective = 'customer' 
}) => {
  const [eta, setEta] = useState(15);
  const [progress, setProgress] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const workerMarker = useRef<any>(null);
  const userMarker = useRef<any>(null);
  const routeLine = useRef<any>(null);

  const isWorkerPerspective = perspective === 'worker';
  const targetName = isWorkerPerspective ? (job.customerName || 'Customer') : (job.workerName || 'Worker');
  const targetAvatar = isWorkerPerspective ? (job.customerAvatar || 'https://i.pravatar.cc/150?u=cust') : (job.workerAvatar || 'https://i.pravatar.cc/150?u=wrk');

  // Base coordinates for simulation
  const userLoc = { lat: 28.6139, lng: 77.2090 };
  const workerStartLoc = { lat: 28.6250, lng: 77.2200 };

  useEffect(() => {
    // Fixed: Property 'google' does not exist on type 'Window'. Cast to any.
    if (mapRef.current && (window as any).google) {
      googleMap.current = new (window as any).google.maps.Map(mapRef.current, {
        center: userLoc,
        zoom: 15,
        disableDefaultUI: true,
        styles: TRACKING_MAP_STYLE
      });

      // Customer Marker
      userMarker.current = new (window as any).google.maps.Marker({
        position: userLoc,
        map: googleMap.current,
        title: "Customer Location",
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeWeight: 4,
          strokeColor: "#ffffff",
        }
      });

      // Worker Marker
      workerMarker.current = new (window as any).google.maps.Marker({
        position: workerStartLoc,
        map: googleMap.current,
        title: "Worker Location",
        icon: {
          url: isWorkerPerspective ? 'https://i.pravatar.cc/150?u=me' : targetAvatar,
          scaledSize: new (window as any).google.maps.Size(56, 56),
          anchor: new (window as any).google.maps.Point(28, 28),
          className: 'rounded-full border-4 border-white shadow-xl'
        }
      });

      // Route Line
      routeLine.current = new (window as any).google.maps.Polyline({
        path: [workerStartLoc, userLoc],
        geodesic: true,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.6,
        strokeWeight: 5,
        map: googleMap.current
      });

      // Fit bounds to show both locations with padding
      const bounds = new (window as any).google.maps.LatLngBounds();
      bounds.extend(userLoc);
      bounds.extend(workerStartLoc);
      googleMap.current.fitBounds(bounds, { top: 100, bottom: 300, left: 50, right: 50 });
    }
  }, []);

  useEffect(() => {
    if (job.status !== 'ACCEPTED' && job.status !== 'PENDING' && job.status !== 'IN_PROGRESS') {
      setProgress(100);
      setEta(1);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev >= 100 ? 100 : prev + 0.5;
        // Update Marker Position
        if (workerMarker.current && (window as any).google) {
            const lat = workerStartLoc.lat + (userLoc.lat - workerStartLoc.lat) * (next / 100);
            const lng = workerStartLoc.lng + (userLoc.lng - workerStartLoc.lng) * (next / 100);
            const newPos = { lat, lng };
            workerMarker.current.setPosition(newPos);
            
            // Update Polyline to shrink as worker approaches
            if (routeLine.current) {
                routeLine.current.setPath([newPos, userLoc]);
            }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [job.status]);

  useEffect(() => {
    setEta(Math.max(1, 15 - Math.floor((progress / 100) * 15)));
  }, [progress]);

  return (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden flex flex-col font-sans animate-fadeIn">
      <div ref={mapRef} className="absolute inset-0 z-0 bg-[#f8fafc]"></div>

      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none safe-top">
        <button 
          onClick={onBack} 
          className="pointer-events-auto bg-white/95 backdrop-blur-md shadow-lg p-2.5 rounded-2xl text-slate-900 active:scale-90 transition-all border border-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setIsReporting(true)}
          className="pointer-events-auto bg-red-600 text-white p-2.5 rounded-2xl shadow-xl active:scale-90 transition-all"
        >
          <ShieldAlert className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col pointer-events-none p-4 safe-bottom">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl pointer-events-auto animate-slideUp overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={targetAvatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900 truncate leading-none">{targetName}</h3>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Arrival in {eta}m</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCall} className="p-3 bg-white border border-slate-100 rounded-xl"><Phone className="w-4 h-4 text-slate-900" /></button>
                    <button onClick={onChat} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20"><MessageCircle className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Navigation2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination Address</p>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{job.workAddress || 'Active Work Site'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{Math.round(progress)}%</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-900 rounded-2xl px-5 py-3 mt-4">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Security Pin</p>
                    <span className="text-xl font-black text-white tracking-[0.3em]">{job.status === 'IN_PROGRESS' ? job.completionOtp : job.otp}</span>
                </div>
            </div>
        </div>
      </div>

      {isReporting && (
        <ReportModal 
            reporterId={perspective === 'customer' ? job.customerId : job.workerId || ''}
            reporterName={perspective === 'customer' ? (job.customerName || 'Customer') : (job.workerName || 'Worker')}
            reportedId={perspective === 'customer' ? (job.workerId || '') : job.customerId}
            reportedName={perspective === 'customer' ? (job.workerName || 'Worker') : (job.customerName || 'Customer')}
            reportedRole={perspective === 'customer' ? UserRole.WORKER : UserRole.CUSTOMER}
            jobId={job.id}
            onClose={() => setIsReporting(false)}
        />
      )}
    </div>
  );
};
