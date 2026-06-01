import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? (import.meta.env.VITE_API_URL || 'https://campus-path-ai.onrender.com') + '/api'
    : '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campuspath_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('campuspath_token');
      localStorage.removeItem('campuspath_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePortfolio: (data) => api.put('/auth/portfolio', data),
};

export const roadmapAPI = {
  generate: (data) => api.post('/roadmap/generate', data),
  getAll: () => api.get('/roadmap'),
  getOne: (id) => api.get(`/roadmap/${id}`),
  updateTask: (id, data) => api.put(`/roadmap/${id}/task`, data),
  verifyMilestone: (id, weekNumber) => api.put(`/roadmap/${id}/verify`, { weekNumber }),
};

export const githubAPI = {
  analyze: (username) => api.get(`/github/analyze/${username}`),
  getHeatmap: (username, year) => api.get(`/github/heatmap/${username}${year ? `?year=${year}` : ''}`),
  reviewRepo: (data) => api.post('/github/review', data),
};

export const jobsAPI = {
  getJobs: (role, limit = 50) => api.get(`/jobs?role=${encodeURIComponent(role)}&limit=${limit}`),
  claimMilestone: (milestoneId) => api.post('/jobs/milestone/claim', { milestoneId }),
};

export const aiAPI = {
  scoreResume: (formData) => api.post('/ai/score-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  interview: (data) => api.post('/ai/interview', data),
};

export const roomAPI = {
  getAll: () => api.get('/rooms'),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  verifyPassword: (id, password) => api.post(`/rooms/${id}/verify`, { password }),
};

export default api;
