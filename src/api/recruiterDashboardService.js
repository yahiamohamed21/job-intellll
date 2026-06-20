import api from './axios';
import wizardService from './wizardService';
import { jobsService } from './jobsService';

// ─── Simple In-Memory Cache ──────────────────────────────────────
const referenceCache = {};
const fetchWithCache = async (key, fetcher) => {
  if (referenceCache[key]) {
    return { data: referenceCache[key] };
  }
  const response = await fetcher();
  referenceCache[key] = response.data;
  return response;
};

export const recruiterDashboardService = {
  // ── Company Info ──────────────────────────────────────────────
  getCompanyInfo: () => wizardService.getCompanyInfo(),

  updateCompanyInfo: (data) => wizardService.saveCompanyInfo(data),

  /** Partial update — only provided (non-null) fields are changed */
  updateCompanyInfoPartial: (data) => api.patch('/recruiter/company-info', data),

  // ── Jobs ──────────────────────────────────────────────────────
  getActiveJobs: (page = 1, pageSize = 50) =>
    jobsService.getMyJobs({ page, pageSize, isActive: true }),

  // ── Logo / Profile Picture ────────────────────────────────────
  getLogoInfo: (config) => api.get('/recruiter/picture/info', config),

  getLogoBlob: (config) =>
    api.get('/recruiter/picture', { ...config, responseType: 'blob' }),

  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/recruiter/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteLogo: () => api.delete('/recruiter/picture'),

  // ── Notifications ─────────────────────────────────────────────
  getUnreadCount: () => api.get('/notifications/unread-count'),

  // ── Reference Data (cached) ───────────────────────────────────
  getIndustries: () =>
    fetchWithCache('industries', () => api.get('/recruiter/industries')),

  getCompanySizes: () =>
    fetchWithCache('companySizes', () => api.get('/recruiter/company-sizes')),

  getCountries: (lang = 'en') =>
    fetchWithCache(`countries_${lang}`, () =>
      api.get('/countries', { params: { lang } })
    ),

  getCities: (countryId, lang = 'en') =>
    fetchWithCache(`cities_${countryId}_${lang}`, () =>
      api.get(`/countries/${countryId}/cities`, { params: { lang } })
    ),

  // ── Shortlisted Candidates per Job ────────────────────────────
  getShortlistedCount: async (jobId) => {
    try {
      const res = await api.get(`/recruiter/jobs/${jobId}/candidates/shortlisted`);
      const data = res.data?.data ?? res.data ?? [];
      return Array.isArray(data) ? data.length : 0;
    } catch {
      return 0;
    }
  },

  // ── Aggregate Dashboard Data ──────────────────────────────────
  getDashboardData: async () => {
    const [companyRes, jobsRes, picRes, notifRes] = await Promise.allSettled([
      wizardService.getCompanyInfo(),
      jobsService.getMyJobs({ page: 1, pageSize: 50, isActive: true }),
      api.get('/recruiter/picture/info'),
      api.get('/notifications/unread-count'),
    ]);

    const jobs = jobsRes.status === 'fulfilled'
      ? (jobsRes.value?.data?.data?.jobs ?? jobsRes.value?.data?.data ?? [])
      : [];
    const jobsTotalCount = jobsRes.status === 'fulfilled'
      ? (jobsRes.value?.data?.data?.totalCount ?? 0)
      : 0;

    // Fetch shortlisted counts per job in parallel
    let shortlistedCounts = {};
    let totalShortlisted = 0;
    if (jobs.length > 0) {
      const results = await Promise.allSettled(
        jobs.map(async (job) => {
          const count = await recruiterDashboardService.getShortlistedCount(job.id);
          return { jobId: job.id, count };
        })
      );
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          shortlistedCounts[r.value.jobId] = r.value.count;
          totalShortlisted += r.value.count;
        }
      });
    }

    return {
      company: companyRes.status === 'fulfilled'
        ? (companyRes.value?.data?.data ?? companyRes.value?.data ?? null)
        : null,
      companyError: companyRes.status === 'rejected' ? companyRes.reason : null,
      jobs,
      jobsTotalCount,
      jobsError: jobsRes.status === 'rejected' ? jobsRes.reason : null,
      picture: picRes.status === 'fulfilled'
        ? (picRes.value?.data?.data ?? picRes.value?.data ?? null)
        : null,
      unreadCount: notifRes.status === 'fulfilled'
        ? (notifRes.value?.data?.data?.count ?? notifRes.value?.data?.data ?? 0)
        : 0,
      shortlistedCounts,
      totalShortlisted,
    };
  },
};

export default recruiterDashboardService;
