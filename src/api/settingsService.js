import api from './axios';

const settingsService = {
  // Settings (notification preferences)
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),

  // Name update
  updateName: (data) => api.put('/auth/name', data),

  // Password change
  changePassword: (data) => api.post('/auth/change-password', data),

  // Account management
  deactivateAccount: (data) => api.post('/auth/deactivate', data),
  deleteAccount: (data) => api.post('/auth/delete-account', data),

  // Job Seeker specific
  updateJobTitle: (data) => api.put('/jobseeker/job-title', data),

  // Recruiter specific
  updateCompanyName: (data) => api.put('/recruiter/company-name', data),
};

export default settingsService;
