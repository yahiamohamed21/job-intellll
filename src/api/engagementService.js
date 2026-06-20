import api from './axios';

export const getEngagementStats = async () => {
    const response = await api.get('/jobseeker/engagement-stats');
    return response.data;
};
