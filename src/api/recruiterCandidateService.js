import api from './axios';

export const getMatchedCandidates = async (jobId, maxResults = 10, config = {}) => {
  const response = await api.get(`/recruiter/jobs/${jobId}/candidates`, {
    params: { maxResults },
    ...config
  });
  return response.data;
};

export const refreshCandidates = async (jobId, maxResults = 20, config = {}) => {
  const response = await api.post(`/recruiter/jobs/${jobId}/candidates/refresh`, null, {
    params: { maxResults },
    ...config
  });
  return response.data;
};

export const getCandidateProfile = async (jobId, candidateId) => {
  const response = await api.get(`/recruiter/jobs/${jobId}/candidates/${candidateId}`);
  return response.data;
};

export const recordProfileView = async (jobId, candidateId) => {
  const response = await api.post(`/recruiter/jobs/${jobId}/candidates/${candidateId}/view`);
  return response.data;
};
export const toggleShortlist = async (jobId, candidateId) => {
  const response = await api.post(`/recruiter/jobs/${jobId}/candidates/${candidateId}/toggle-shortlist`);
  return response.data;
};

export const getShortlistedCandidates = async (jobId, config = {}) => {
  const response = await api.get(`/recruiter/jobs/${jobId}/candidates/shortlisted`, {
    ...config
  });
  return response.data;
};

export const contactCandidate = async (jobId, candidateId, message) => {
  const response = await api.post(`/recruiter/jobs/${jobId}/candidates/${candidateId}/contact`, { message });
  return response.data;
};

export const downloadCandidateResume = async (jobId, candidateId) => {
  const response = await api.get(`/recruiter/jobs/${jobId}/candidates/${candidateId}/resume/download`, {
    responseType: 'blob'
  });
  return response;
};

export const getMyJobs = async (page = 1, pageSize = 50, isActive = true, search = "") => {
  const response = await api.get('/jobs', {
    params: { page, pageSize, isActive, search: search || undefined }
  });
  return response.data;
};
