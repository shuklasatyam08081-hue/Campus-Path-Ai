import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
  reviewRepo: (username, repoName) => api.post('/github/review', { username, repoName }),
};

export const jobsAPI = {
  getJobs: (role, limit = 50) => api.get(`/jobs?role=${encodeURIComponent(role)}&limit=${limit}`),
  claimMilestone: (milestoneId) => api.post('/jobs/milestone/claim', { milestoneId }),
};

export default api;
