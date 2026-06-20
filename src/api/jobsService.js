import api from './axios';

export const jobsService = {
  getSkills: (search) => api.get('/jobs/skills', { params: { search } }),
  getMyJobs: (params) => api.get('/jobs', { params }),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  deactivateJob: (id) => api.patch(`/jobs/${id}/deactivate`),
  reactivateJob: (id) => api.patch(`/jobs/${id}/reactivate`),
};

export default jobsService;
