// Wizard API Service
// Provides functions to interact with the Job Seeker Profile Wizard backend endpoints
// Base URL is configured in src/api/axios.js

import api from './axios';

// ─── Simple In-Memory Cache ──────────────────────────────────────
const referenceCache = {};

const fetchWithCache = async (key, fetcher) => {
  if (referenceCache[key]) {
    // Return a cloned promise-like response so it matches Axios signature
    return Promise.resolve({ data: referenceCache[key] });
  }
  const response = await fetcher();
  referenceCache[key] = response.data; // Store the raw data structure
  return response;
};

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
//   cityId: number;
//   phoneNumber?: string;
//   firstLanguageId: number;
//   firstLanguageProficiency: string;
//   secondLanguageId?: number;
//   secondLanguageProficiency?: string;
//   bio?: string;
//   workPreferences: string[];   // e.g. ['Remote', 'Hybrid', 'OnSite']
//   desiredEmploymentTypes: string[]; // e.g. ['FullTime', 'PartTime', 'Freelance', 'Internship']
// }

// ─── API Calls ─────────────────────────────────────────────────────
export const wizardService = {
  // Wizard status
  getStatus: (config) => api.get('/jobseeker/wizard-status', config),

  // Advance step (explicit navigation)
  advanceStep: (step) => api.post(`/jobseeker/wizard/advance/${step}`),

  // Step 1 – Personal Info
  savePersonalInfo: (data) => api.post('/jobseeker/personal-info', data),
  updateBio: (data) => api.put('/jobseeker/personal-info/bio', data),
  updateLanguages: (data) => api.put('/jobseeker/personal-info/languages', data),
  updateBasicInfo: (data) => api.put('/jobseeker/personal-info/basic', data),
  updatePreferences: (data) => api.put('/jobseeker/personal-info/preferences', data),
  updatePhone: (data) => api.put('/jobseeker/phone', data),
  updateLocation: (data) => api.put('/jobseeker/location', data),
  updateYearsOfExperience: (data) => api.put('/jobseeker/years-of-experience', data),
  getPersonalInfo: (lang = 'en', config) => api.get(`/jobseeker/personal-info?lang=${lang}`, config),

  // Profile picture
  uploadPicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/jobseeker/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPictureInfo: (config) => api.get('/jobseeker/picture/info', config),
  deletePicture: () => api.delete('/jobseeker/picture'),

  // Resume / CV
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/jobseeker/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  parseResume: () => api.post('/jobseeker/resume/parse'),
  getResume: (config) => api.get('/jobseeker/resume', config),
  getResumeBlob: (config) => api.get('/jobseeker/resume/download', { ...config, responseType: 'blob' }),
  deleteResume: () => api.delete('/jobseeker/resume'),

  // Step 2 – Experience
  getExperiences: (lang = 'en', config) => api.get(`/jobseeker/experience?lang=${lang}`, config),
  addExperience: (data) => api.post('/jobseeker/experience', data),
  updateExperience: (id, data) => api.put(`/jobseeker/experience/${id}`, data),
  deleteExperience: (id) => api.delete(`/jobseeker/experience/${id}`),
  reorderExperiences: (ids) => api.post('/jobseeker/experience/reorder', ids),

  // Step 2 – Education
  getEducation: (lang = 'en', config) => api.get(`/jobseeker/education?lang=${lang}`, config),
  addEducation: (data) => api.post('/jobseeker/education', data),
  updateEducation: (id, data) => api.put(`/jobseeker/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/jobseeker/education/${id}`),
  reorderEducation: (ids) => api.post('/jobseeker/education/reorder', ids),

  // Step 3 – Projects
  getProjects: (config) => api.get('/jobseeker/projects', config),
  addProject: (data) => api.post('/jobseeker/projects', data),
  updateProject: (id, data) => api.put(`/jobseeker/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/jobseeker/projects/${id}`),

  // Step 4 – Skills
  getAvailableSkills: (config) => fetchWithCache('/jobseeker/skills/available', () => api.get('/jobseeker/skills/available', config)),
  getUserSkills: (config) => api.get('/jobseeker/skills', config),
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
  getJobTitles: (lang = 'en') => fetchWithCache(`/jobseeker/job-titles?lang=${lang}`, () => api.get('/jobseeker/job-titles', { params: { lang } })),
  getCountries: (lang = 'en') => fetchWithCache(`/countries?lang=${lang}`, () => api.get('/countries', { params: { lang } })),
  getCities: (countryId, lang = 'en') => fetchWithCache(`/countries/${countryId}/cities?lang=${lang}`, () => api.get(`/countries/${countryId}/cities`, { params: { lang } })),
  getLanguages: (lang = 'en') => fetchWithCache(`/languages?lang=${lang}`, () => api.get('/languages', { params: { lang } })),
  getFieldsOfStudy: (lang = 'en') => fetchWithCache(`/fields-of-study?lang=${lang}`, () => api.get('/fields-of-study', { params: { lang } })),

  // Recruiter wizard
  getRecruiterWizardStatus: () => api.get('/recruiter/wizard-status'),
  advanceRecruiterStep: (step) => api.post(`/recruiter/wizard/advance/${step}`),
  saveCompanyInfo: (data) => api.post('/recruiter/company-info', data),
  getCompanyInfo: () => api.get('/recruiter/company-info'),
  getIndustries: () => fetchWithCache('/recruiter/industries', () => api.get('/recruiter/industries')),
  getCompanySizes: () => fetchWithCache('/recruiter/company-sizes', () => api.get('/recruiter/company-sizes')),
};

export default wizardService;
