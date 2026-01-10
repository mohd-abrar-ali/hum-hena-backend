
export enum UserRole {
  GUEST = 'GUEST',
  CUSTOMER = 'CUSTOMER',
  WORKER = 'WORKER',
  ADMIN = 'ADMIN'
}

export enum SkillType {
  PLUMBER = 'Plumber',
  ELECTRICIAN = 'Electrician',
  CARPENTER = 'Carpenter',
  MASON = 'Mason',
  PAINTER = 'Painter',
  CLEANER = 'Cleaner',
  MECHANIC = 'Mechanic',
  GARDENER = 'Gardener'
}

export type Language = 'en' | 'hi';
export type Gender = 'Male' | 'Female' | 'Other';

export interface ServiceCategory {
  id: string;
  name: string;
  basePrice: number; 
  isActive: boolean;
}

export interface PlatformFeeConfig {
  baseCommissionPercent: number;
  newWorkerFreeJobsCount: number; 
  dynamicMultiplier: number; 
  isSystemFreeMode: boolean; 
  landingBackgroundType: 'video' | 'image';
  landingVideoUrl: string;
  landingImageUrl: string;
  paymentQrUrl: string;
  upiId: string;
  bankDetails: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type JobStatus = 'OPEN' | 'PENDING' | 'ACCEPTED' | 'OTP_VERIFIED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type AdminPermission = 'dashboard' | 'users' | 'workers' | 'categories' | 'withdrawals' | 'ads' | 'cms' | 'reports' | 'settings' | 'firebase' | 'messages' | 'administrators';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender | '';
  dob: string;
  avatarUrl: string;
  walletBalance?: number;
  language?: Language;
  status?: 'active' | 'suspended';
  role?: UserRole; 
  adminPermissions?: AdminPermission[];
}

export interface PortfolioItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  mediaUrls?: string[];
  voiceNoteUrl?: string;
}

export interface WorkerProfile {
  id: string;
  phone: string;
  name: string;
  skill: string; 
  tags?: string[]; 
  rating: number;
  reviewCount: number;
  distanceKm: number;
  hourlyRate: number; 
  isOnline: boolean;
  avatarUrl: string;
  bio: string;
  portfolioItems?: PortfolioItem[];
  verificationStatus: VerificationStatus;
  idProofUrl?: string;
  coordinates: { x: number; y: number }; 
  lifetimeJobsCompleted: number;
  totalEarned: number;
  status?: 'active' | 'suspended';
  currentJobStatus?: string;
}

export interface JobRequest {
  id: string;
  workerId?: string; 
  workerName?: string; 
  workerAvatar?: string;
  workerPhone?: string; // Explicit phone number for calling
  skill: string;
  title?: string; 
  customerId: string;
  customerName: string; 
  customerAvatar?: string; 
  customerPhone?: string; // Explicit phone number for calling
  status: JobStatus;
  otp: string;
  completionOtp: string; 
  completionRequested?: boolean;
  date: string; 
  description: string;
  price: number;
  isBroadcast?: boolean; 
  mediaUrls?: string[]; 
  completionMediaUrls?: string[];
  workAddress?: string; 
  coordinates?: { x: number; y: number }; 
  isPaid?: boolean;
  paymentMethod?: 'UPI' | 'CARD' | 'CASH';
  createdAt?: any;
  platformFee?: number;
  workerEarnings?: number;
  voiceNoteUrl?: string;
  cancelledBy?: 'customer' | 'worker';
  userReview?: {
    rating: number;
    text: string;
    mediaUrls?: string[];
    voiceNoteUrl?: string;
  };
}

export interface WithdrawalRequest {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  method: 'UPI' | 'BANK';
  details: string; 
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: any;
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface AdBanner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'TOP' | 'BOTTOM';
  isActive: boolean;
  title?: string;
  isUniversal: boolean; 
  city?: string; 
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reportedRole: UserRole;
  jobId?: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED';
  timestamp: number;
}

export interface EarningsData {
  day: string;
  amount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark';
}
