/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, getUnreadCount, markAsRead as apiMarkAsRead, markAllAsRead as apiMarkAllAsRead } from '../api/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 30000;

export const NotificationProvider = ({ children }) => {
  const { isAuthed } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const pollRef = useRef(null);
  const mountedRef = useRef(true);
  const fetchAbortRef = useRef(null);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      if (mountedRef.current && res?.data?.count !== undefined) {
        setUnreadCount(res.data.count);
      }
    } catch {
      // Silently fail — polling will retry
    }
  }, []);

  const fetchNotifications = useCallback(async (pageNum = 1, unreadOnly = false, append = false) => {
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      if (!append) setLoading(true);
      const res = await getNotifications(pageNum, 20, unreadOnly, controller.signal);
      if (mountedRef.current && res?.data) {
        const items = res.data;
        setNotifications(prev => append ? [...prev, ...items] : items);
        setHasMore(items.length === 20);
        if (!unreadOnly && !append) {
          setTotalCount(items.length);
        }
      }
    } catch (err) {
      if (err?.name !== 'CanceledError' && err?.name !== 'AbortError') {
        // Real error — will be handled by the page component
      }
    } finally {
      if (mountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    const unreadOnly = filterRef.current === 'unread';
    await fetchNotifications(1, unreadOnly, false);
    await fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;
  const initialLoadDoneRef = useRef(false);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await apiMarkAsRead(notificationId);
      const target = notificationsRef.current.find(n => n.id === notificationId);
      const wasUnread = target && !target.isRead;
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      throw new Error('Failed to mark as read');
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      throw new Error('Failed to mark all as read');
    }
  }, []);

  const changeFilter = useCallback((newFilter) => {
    setFilter(newFilter);
    setNotifications([]);
    setLoading(true);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = Math.floor(notifications.length / 20) + 1;
      const unreadOnly = filterRef.current === 'unread';
      fetchNotifications(nextPage, unreadOnly, true);
    }
  }, [hasMore, loading, notifications.length, fetchNotifications]);

  // Initial fetch + polling — only depends on isAuthed
  useEffect(() => {
    mountedRef.current = true;

    if (isAuthed) {
      fetchUnreadCount();
      fetchNotifications(1, filterRef.current === 'unread', false);
      initialLoadDoneRef.current = true;

      pollRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);
    }

    return () => {
      mountedRef.current = false;
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthed, fetchUnreadCount, fetchNotifications]);

  // Re-fetch when filter changes (tab switch) — skip initial mount
  useEffect(() => {
    if (!initialLoadDoneRef.current || !isAuthed) return;
    fetchNotifications(1, filter === 'unread', false);
  }, [filter, isAuthed, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      totalCount,
      loading,
      hasMore,
      filter,
      fetchNotifications,
      refreshNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      changeFilter,
      loadMore,
      fetchUnreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
