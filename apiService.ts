
import { getAuth } from 'firebase/auth';

// API Base URL from Environment Variables
const API_BASE = import.meta.env.VITE_API_URL || '';

// This function will be used to get the Firebase ID token for the current user.
async function getAuthToken() {
  const auth = getAuth();
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
}

// This function handles all API requests to the backend.
async function request(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data: any = null) {
  const authToken = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`API Error ${response.status}:`, errorData);
      return { success: false, message: errorData.message || 'An error occurred' };
    }

    return await response.json();
  } catch (error: any) {
    console.error("Network/API Request Failed:", error);
    return { success: false, message: error.message || 'Network error' };
  }
}

export const uploadFile = async (file: File): Promise<string> => {
    // Validate file types: allow ONLY image/jpeg and image/png
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG and PNG images are allowed.');
    }

    const authToken = await getAuthToken();
    const headers: HeadersInit = {};
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'File upload failed');
    }

    const result = await response.json();
    return result.url;
};

// API Service definition
export const apiService = {
  // Job-related API calls
  searchJobs: (params: any) => request('/api/job/search', 'POST', params),
  getJobDetails: (jobId: string) => request(`/api/job/details/${jobId}`, 'GET'),
  applyForJob: (jobId: string, proposal: string) => request('/api/job/apply', 'POST', { jobId, proposal }),
  getAppliedJobs: () => request('/api/job/applied', 'GET'),
  getClientJobs: () => request('/api/job/client', 'GET'),
  postJob: (jobData: any) => request('/api/job/post', 'POST', jobData),
  getMyJobs: (phone: string, role: string) => request('/api/job/my-jobs', 'POST', { phone, role }),
  updateJobStatus: (jobId: string, status: string, extra?: any) => request('/api/job/status', 'POST', { jobId, status, extra }),
  getJob: (jobId: string) => request(`/api/job/${jobId}`, 'GET'),
  getBroadcastJobs: () => request('/api/job/broadcast', 'GET'),

  // Worker-related API calls
  getWorkerProfile: (workerId: string) => request(`/api/worker/profile/${workerId}`, 'GET'),
  updateWorkerProfile: (profileData: any) => request('/api/worker/profile', 'POST', profileData),
  getWorkers: (filters: any) => request('/api/worker/list', 'POST', filters),
  saveWorker: (worker: any) => request('/api/worker/profile', 'POST', worker),
  getAllWorkers: () => request('/api/worker/all', 'GET'),
  getOnlineWorkers: () => request('/api/worker/online', 'GET'),
  updateWorkerStatus: (workerId: string, status: string) => request('/api/worker/status', 'POST', { workerId, status }),
  deleteWorker: (workerId: string) => request(`/api/worker/${workerId}`, 'DELETE'),
  getWorkerTransactions: (workerId: string) => request(`/api/worker/transactions/${workerId}`, 'GET'),

  // User-related API calls
  getUserProfile: () => request('/api/users/profile', 'GET'),
  updateUserProfile: (profileData: any) => request('/api/users/profile', 'POST', profileData),
  getProfile: (phone: string) => request(`/api/users/profile/${phone}`, 'GET'),
  saveProfile: (profile: any) => request('/api/users/profile', 'POST', profile),
  getAllUsers: () => request('/api/users/all', 'GET'),
  deleteUser: (phone: string) => request(`/api/users/${phone}`, 'DELETE'),
  updateUserStatus: (phone: string, status: string) => request('/api/users/status', 'POST', { phone, status }),
  resetUserPassword: (phone: string) => request('/api/users/reset-password', 'POST', { phone }),
  
  // Admin-related API calls
  getAdminDashboard: () => request('/api/admin/dashboard', 'GET'),
  getReports: () => request('/api/reports', 'GET'),
  updateReportStatus: (id: string, status: string) => request('/api/reports/status', 'POST', { id, status }),
  getWithdrawals: () => request('/api/withdrawals', 'GET'),
  updateWithdrawalStatus: (id: string, status: string) => request('/api/withdrawals/status', 'POST', { id, status }),
  requestWithdrawal: (data: any) => request('/api/withdrawals/request', 'POST', data),

  // Platform related
  getCategories: () => request('/api/categories', 'GET'),
  saveCategory: (cat: any) => request('/api/categories', 'POST', cat),
  getPlatformConfig: () => request('/api/platform/config', 'GET'),
  savePlatformConfig: (config: any) => request('/api/platform/config', 'POST', config),
  getAds: () => request('/api/ads', 'GET'),
  saveAd: (ad: any) => request('/api/ads', 'POST', ad),
  deleteAd: (id: string) => request(`/api/ads/${id}`, 'DELETE'),
  getApiKeys: () => request('/api/keys', 'GET'),
  saveApiKeys: (keys: any) => request('/api/keys', 'POST', keys),
  getCMSContent: () => request('/api/cms', 'GET'),
  saveCMSContent: (content: any) => request('/api/cms', 'POST', content),
  getFirebaseConfig: () => request('/api/firebase/config', 'GET'),
  saveFirebaseConfig: (config: any) => request('/api/firebase/config', 'POST', config),
};
