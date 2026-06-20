import api from './axios';

// Helper for retrying API calls on failure (e.g. dropped connection)
const withRetry = async (fn, retries = 3, delayMs = 1000) => {
  try {
    return await fn();
  } catch (error) {
    // Retry if it's a network error (no response) or a 5xx server error
    const isNetworkOrServerError = !error.response || (error.response.status >= 500);
    if (retries > 0 && isNetworkOrServerError) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return withRetry(fn, retries - 1, delayMs * 1.5); // Exponential backoff
    }
    throw error;
  }
};

export const assessmentService = {
  checkEligibility: () => api.get('/assessment/v2/eligibility'),
  startAssessment: (skillIds = null) => 
    api.post('/assessment/v2/start', skillIds ? { skillIds } : null),
  resumeAssessment: () => api.post('/assessment/v2/resume'),
  getCurrentStatus: () => api.get('/assessment/v2/current'),
  getQuestionStatuses: () => api.get('/assessment/v2/questions'),
  getNextQuestion: () => api.get('/assessment/v2/question'),
  getQuestionByNumber: (number) => api.get(`/assessment/v2/question/${number}`),
  
  // Submit is wrapped in withRetry so the user doesn't lose progress on a spotty connection
  submitAnswer: (questionId, selectedAnswerIndex, timeSpentSeconds = 0) =>
    withRetry(() => api.post('/assessment/v2/answer', { questionId, selectedAnswerIndex, timeSpentSeconds })),
    
  completeAssessment: () => api.post('/assessment/v2/complete'),
  abandonAssessment: () => api.post('/assessment/v2/abandon'),
  getHistory: () => api.get('/assessment/v2/history'),
  getResult: (attemptId) => api.get(`/assessment/v2/result/${attemptId}`)
};

export default assessmentService;