// Wizard API Service
// Provides functions to interact with the Job Seeker Profile Wizard backend endpoints
// Base URL is configured in src/api/axios.js

import api from './axios';

// ─── Types (for reference) ───────────────────────────────────────
/**
 * Wizard status response
 */
// export interface WizardStatus {
//   currentStep: number;
//   isComplete: boolean;
//   stepName: string;
//   completedSteps: string[];
// }

/**
 * Personal info payload
 */
// export interface PersonalInfo {
//   jobTitleId: number;
//   yearsOfExperience: number;
//   countryId: number;
//   city: string;
//   phoneNumber?: string;
//   firstLanguageId: number;
//   firstLanguageProficiency: number;
//   secondLanguageId?: number;
//   secondLanguageProficiency?: number;
//   bio?: string;
// }

// ─── API Calls ─────────────────────────────────────────────────────
export const wizardService = {
  // Wizard status
  getStatus: () => api.get('/jobseeker/wizard-status'),

  // Advance step (explicit navigation)
  advanceStep: (step) => api.post(`/jobseeker/wizard/advance/${step}`),

  // Step 1 – Personal Info
  savePersonalInfo: (data) => api.post('/jobseeker/personal-info', data),
  getPersonalInfo: (lang = 'en') => api.get(`/jobseeker/personal-info?lang=${lang}`),

  // Profile picture
  uploadPicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/jobseeker/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPictureInfo: () => api.get('/jobseeker/picture/info'),
  deletePicture: () => api.delete('/jobseeker/picture'),

  // Resume / CV
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/jobseeker/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getResume: () => api.get('/jobseeker/resume'),
  deleteResume: () => api.delete('/jobseeker/resume'),

  // Step 2 – Experience
  getExperiences: () => api.get('/jobseeker/experience'),
  addExperience: (data) => api.post('/jobseeker/experience', data),
  updateExperience: (id, data) => api.put(`/jobseeker/experience/${id}`, data),
  deleteExperience: (id) => api.delete(`/jobseeker/experience/${id}`),
  reorderExperiences: (ids) => api.post('/jobseeker/experience/reorder', ids),

  // Step 2 – Education
  getEducation: () => api.get('/jobseeker/education'),
  addEducation: (data) => api.post('/jobseeker/education', data),
  updateEducation: (id, data) => api.put(`/jobseeker/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/jobseeker/education/${id}`),
  reorderEducation: (ids) => api.post('/jobseeker/education/reorder', ids),

  // Step 3 – Projects
  getProjects: () => api.get('/jobseeker/projects'),
  addProject: (data) => api.post('/jobseeker/projects', data),
  updateProject: (id, data) => api.put(`/jobseeker/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/jobseeker/projects/${id}`),

  // Step 4 – Skills
  getAvailableSkills: () => api.get('/jobseeker/skills/available'),
  getUserSkills: () => api.get('/jobseeker/skills'),
  updateSkills: (skillIds) => api.put('/jobseeker/skills', { skillIds }),
  clearSkills: () => api.delete('/jobseeker/skills'),

  // Step 4 – Social Links
  getSocialAccounts: () => api.get('/jobseeker/social-accounts'),
  updateSocialAccounts: (data) => api.put('/jobseeker/social-accounts', data),
  deleteSocialAccounts: () => api.delete('/jobseeker/social-accounts'),

  // Step 4 – Certificates
  getCertificates: () => api.get('/jobseeker/certificates'),
  addCertificate: (formData) =>
    api.post('/jobseeker/certificates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateCertificate: (id, formData) =>
    api.put(`/jobseeker/certificates/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteCertificate: (id) => api.delete(`/jobseeker/certificates/${id}`),

  // Reference data (public, no auth needed)
  getJobTitles: () => api.get('/jobseeker/job-titles'),
  getCountries: (lang = 'en') => api.get(`/locations/countries?lang=${lang}`),
  getLanguages: (lang = 'en') => api.get(`/locations/languages?lang=${lang}`),
};

export default wizardService;
