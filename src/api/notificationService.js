import api from './axios';

export const getNotifications = async (page = 1, pageSize = 20, unreadOnly = false, signal) => {
  const response = await api.get('/notifications', {
    params: { page, pageSize, unreadOnly },
    signal,
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};
