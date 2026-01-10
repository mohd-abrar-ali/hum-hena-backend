
import { SkillType, WorkerProfile, Review, EarningsData, JobRequest, UserProfile, AdBanner, ServiceCategory, PlatformFeeConfig, Gender, UserRole } from './types';

export const DEFAULT_FEE_CONFIG: PlatformFeeConfig = {
  baseCommissionPercent: 10,
  newWorkerFreeJobsCount: 5,
  dynamicMultiplier: 1.0,
  isSystemFreeMode: false,
  landingBackgroundType: 'image',
  landingVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-businessmen-shaking-hands-in-the-office-31514-large.mp4',
  landingImageUrl: 'https://plus.unsplash.com/premium_photo-1682147310420-01b35dfe0e73?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  paymentQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=UPICONFIGURATION',
  upiId: 'humhena@upi',
  bankDetails: 'Bank of India - 0011223344'
};

export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'cat_1', name: 'Plumber', basePrice: 350, isActive: true },
  { id: 'cat_2', name: 'Electrician', basePrice: 400, isActive: true },
  { id: 'cat_3', name: 'Carpenter', basePrice: 450, isActive: true },
  { id: 'cat_4', name: 'Mason', basePrice: 600, isActive: true },
  { id: 'cat_5', name: 'Painter', basePrice: 300, isActive: true },
  { id: 'cat_6', name: 'Cleaner', basePrice: 250, isActive: true },
  { id: 'cat_7', name: 'Mechanic', basePrice: 500, isActive: true },
  { id: 'cat_8', name: 'Gardener', basePrice: 350, isActive: true },
];

export const SKILL_TAGS: Record<string, string[]> = {
  'Plumber': ['Leak Repair', 'Pipe Fitting', 'Bathroom Fittings', 'Clogged Drains', 'Water Tank Cleaning', 'Water Heater Repair'],
  'Electrician': ['House Wiring', 'Fan Repair', 'AC Installation', 'Switchboard Repair', 'Inverter Setup', 'Lighting Decor'],
  'Carpenter': ['Door Repair', 'Furniture Assembly', 'Modular Kitchen', 'Locks & Latches', 'Wood Polishing', 'Window Frame Repair'],
  'Mason': ['Wall Plastering', 'Tile Fitting', 'Brickwork', 'Concrete Repair', 'Bathroom Renovation', 'Floor Leveling'],
  'Painter': ['Interior Painting', 'Wall Texture', 'Exterior Painting', 'Metal Polishing', 'Stenciling', 'Waterproofing'],
  'Cleaner': ['Deep Home Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitizing', 'Sofa/Carpet Cleaning', 'Window Cleaning', 'Disinfection'],
  'Mechanic': ['Two-Wheeler Service', 'Engine Diagnostics', 'Brake Repair', 'Roadside Assistance', 'Oil Change', 'Clutch Work'],
  'Gardener': ['Garden Maintenance', 'Lawn Mowing', 'Plant Potting', 'Fertilizing', 'Hedge Trimming', 'Pest Control (Plants)']
};

export const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other'];

const SAMPLE_PORTFOLIO = [
    'https://images.unsplash.com/photo-1581578731522-745d05cb972b?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1621905252507-b354bcadcabc?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1595844730298-b9f0ff98ffd0?auto=format&fit=crop&q=80&w=400'
];

export const MOCK_WORKERS: WorkerProfile[] = [
  {
    id: 'w_demo_1',
    phone: '9876543210',
    name: 'Rajesh Kumar',
    skill: 'Plumber',
    rating: 4.8,
    reviewCount: 124,
    distanceKm: 0.8,
    hourlyRate: 350,
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    bio: 'Licensed plumber with 12 years of experience. Expert in pipeline leaks and modern bathroom fittings.',
    verificationStatus: 'verified',
    coordinates: { x: 45, y: 40 },
    lifetimeJobsCompleted: 450,
    totalEarned: 85000,
    portfolioItems: SAMPLE_PORTFOLIO.map((url, i) => ({ id: `p${i}`, type: 'image', url })),
    tags: ['Leak Repair', 'Pipe Fitting']
  },
  {
    id: 'w_demo_2',
    phone: '9876543211',
    name: 'Vikram Singh',
    skill: 'Electrician',
    rating: 4.9,
    reviewCount: 89,
    distanceKm: 1.2,
    hourlyRate: 450,
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200',
    bio: 'Certified industrial electrician. Specialized in home wiring and appliance motor repairs.',
    verificationStatus: 'verified',
    coordinates: { x: 55, y: 35 },
    lifetimeJobsCompleted: 210,
    totalEarned: 52000,
    tags: ['House Wiring', 'Fan Repair']
  },
  {
    id: 'w_demo_3',
    phone: '9876543212',
    name: 'Amit Patel',
    skill: 'Carpenter',
    rating: 4.7,
    reviewCount: 56,
    distanceKm: 2.5,
    hourlyRate: 500,
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    bio: 'Expert carpenter specializing in modular kitchens and custom furniture.',
    verificationStatus: 'verified',
    coordinates: { x: 30, y: 60 },
    lifetimeJobsCompleted: 150,
    totalEarned: 45000,
    tags: ['Modular Kitchen']
  },
  {
    id: 'w_demo_4',
    phone: '9876543213',
    name: 'Suresh Yadav',
    skill: 'Painter',
    rating: 4.6,
    reviewCount: 42,
    distanceKm: 3.0,
    hourlyRate: 400,
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'Professional house painter with experience in texture and stencil painting.',
    verificationStatus: 'verified',
    coordinates: { x: 70, y: 70 },
    lifetimeJobsCompleted: 100,
    totalEarned: 30000,
    tags: ['Wall Texture']
  },
  {
    id: 'w_demo_5',
    phone: '9876543214',
    name: 'Sunita Devi',
    skill: 'Cleaner',
    rating: 4.9,
    reviewCount: 200,
    distanceKm: 1.0,
    hourlyRate: 250,
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    bio: 'Deep cleaning specialist. I ensure your home is spotless and sanitized.',
    verificationStatus: 'verified',
    coordinates: { x: 20, y: 20 },
    lifetimeJobsCompleted: 500,
    totalEarned: 90000,
    tags: ['Deep Home Cleaning']
  },
  {
    id: 'w_demo_6',
    phone: '9876543215',
    name: 'Ravi Verma',
    skill: 'Mechanic',
    rating: 4.5,
    reviewCount: 30,
    distanceKm: 4.0,
    hourlyRate: 500,
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
    bio: 'Two-wheeler and car mechanic. Roadside assistance available.',
    verificationStatus: 'verified',
    coordinates: { x: 80, y: 30 },
    lifetimeJobsCompleted: 80,
    totalEarned: 25000,
    tags: ['Engine Diagnostics']
  },
  {
    id: 'w_demo_7',
    phone: '9876543216',
    name: 'Manoj Gupta',
    skill: 'Mason',
    rating: 4.8,
    reviewCount: 65,
    distanceKm: 2.2,
    hourlyRate: 600,
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    bio: 'Experienced mason for all construction and repair needs.',
    verificationStatus: 'verified',
    coordinates: { x: 10, y: 50 },
    lifetimeJobsCompleted: 120,
    totalEarned: 60000,
    tags: ['Tile Fitting']
  },
  {
    id: 'w_demo_8',
    phone: '9876543217',
    name: 'Anita Roy',
    skill: 'Gardener',
    rating: 4.9,
    reviewCount: 45,
    distanceKm: 1.5,
    hourlyRate: 350,
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    bio: 'Passionate gardener helping you maintain a green and healthy garden.',
    verificationStatus: 'verified',
    coordinates: { x: 60, y: 80 },
    lifetimeJobsCompleted: 90,
    totalEarned: 35000,
    tags: ['Garden Maintenance']
  }
];

export const MOCK_USERS: UserProfile[] = [
  {
    firstName: 'Rahul',
    lastName: 'Customer',
    email: 'rahul.cust@example.com',
    phone: '8888888888',
    gender: 'Male',
    dob: '1990-05-15',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
    walletBalance: 2500,
    language: 'en',
    status: 'active',
    role: UserRole.CUSTOMER
  },
  {
    firstName: 'Priya',
    lastName: 'Singh',
    email: 'priya.singh@example.com',
    phone: '9988776644',
    gender: 'Female',
    dob: '1992-08-20',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    walletBalance: 500,
    language: 'hi',
    status: 'active',
    role: UserRole.CUSTOMER
  },
  {
    firstName: 'Arjun',
    lastName: 'Das',
    email: 'arjun.das@example.com',
    phone: '9988776633',
    gender: 'Male',
    dob: '1985-12-10',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    walletBalance: 1500,
    language: 'en',
    status: 'active',
    role: UserRole.WORKER
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev1',
    author: 'Anjali Gupta',
    rating: 5,
    text: 'Highly recommended! Fixed my kitchen leak in 20 minutes. Professional and polite.',
    date: 'Oct 12, 2023',
    mediaUrls: []
  },
  {
    id: 'rev2',
    author: 'Rohan Mehta',
    rating: 4,
    text: 'Good work, arrived on time. Charges were reasonable compared to others.',
    date: 'Nov 05, 2023',
    mediaUrls: ['https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=200']
  },
  {
    id: 'rev3',
    author: 'Sita Verma',
    rating: 5,
    text: 'Very professional behavior. Also cleaned up the area after work. Will hire again.',
    date: 'Dec 01, 2023',
    voiceNoteUrl: 'mock_audio_url_placeholder' 
  },
  {
    id: 'rev4',
    author: 'Vikram Singh',
    rating: 5,
    text: 'Excellent service. The expert knew exactly what the issue was instantly.',
    date: 'Jan 15, 2024'
  }
];

export const MOCK_EARNINGS: EarningsData[] = [
  { day: 'Mon', amount: 1200 },
  { day: 'Tue', amount: 800 },
  { day: 'Wed', amount: 1500 },
  { day: 'Thu', amount: 2000 },
  { day: 'Fri', amount: 1100 },
  { day: 'Sat', amount: 2400 },
  { day: 'Sun', amount: 1800 },
];

export const MOCK_JOBS: JobRequest[] = [
    {
        id: 'job_demo_01',
        customerId: '8888888888',
        customerName: 'Rahul Customer',
        customerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
        skill: 'Electrician', 
        status: 'OPEN',
        otp: '1234',
        completionOtp: '5678',
        date: 'Today',
        description: 'Urgent: Main switchboard sparking. Power fluctuated.',
        price: 450,
        isBroadcast: true,
        createdAt: new Date().toISOString(),
        workAddress: 'Block C, Vasant Kunj, Delhi',
        coordinates: { x: 50, y: 50 }
    },
    {
        id: 'job_demo_02',
        customerId: '9988776644',
        customerName: 'Priya Singh',
        customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        skill: 'Plumber',
        status: 'OPEN',
        otp: '2345',
        completionOtp: '6789',
        date: 'Today',
        description: 'Kitchen sink pipe burst. Water overflowing.',
        price: 350,
        isBroadcast: true,
        createdAt: new Date().toISOString(),
        workAddress: 'Sector 15, Gurgaon',
        coordinates: { x: 52, y: 52 }
    }
];

export const MOCK_ADS: AdBanner[] = [];
export const AVAILABLE_SKILLS = Object.values(SkillType);
