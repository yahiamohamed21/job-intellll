import React, { useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { EmptyState } from "../../Components/ui/EmptyState.jsx";
import { TabBar } from "../../Components/ui/TabBar.jsx";
import ExpandableText from "../../Components/ui/ExpandableText.jsx";
import { alertError } from "../../lib/alerts.js";

function timeAgo(dateString, t) {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const seconds = Math.floor(Math.abs(now - date) / 1000);
  if (now < date) return t("notifications.timeAgo.justNow", "Just now");
  if (seconds < 60) return t("notifications.timeAgo.justNow", "Just now");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("notifications.timeAgo.minutesAgo", "{{count}} min ago", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.timeAgo.hoursAgo", "{{count}}h ago", { count: hours });
  const days = Math.floor(hours / 24);
  if (days === 1) return t("notifications.timeAgo.yesterday", "Yesterday");
  if (days < 30) return t("notifications.timeAgo.daysAgo", "{{count}}d ago", { count: days });
  const months = Math.floor(days / 30);
  return t("notifications.timeAgo.monthsAgo", "{{count}}mo ago", { count: months });
}

const TYPE_CONFIG = {
  RecruiterContact: { icon: "mail", bg: "bg-blue-100 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  ProfileView: { icon: "visibility", bg: "bg-slate-100 dark:bg-slate-800/40", text: "text-slate-500 dark:text-slate-400" },
  ApplicationUpdate: { icon: "update", bg: "bg-amber-100 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
};

function NotificationCard({ notification, onMarkAsRead, t }) {
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.RecruiterContact;
  const isUnread = !notification.isRead;

  return (
    <div
      className={`group relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        isUnread
          ? "border-blue-200/60 dark:border-blue-500/20 bg-blue-50/40 dark:bg-blue-500/[.04]"
          : "border-slate-200/60 dark:border-slate-400/[.10] bg-white dark:bg-[#0a1020]"
      }`}
    >
      {/* Unread accent */}
      {isUnread && (
        <div className="absolute top-5 start-0 w-1 h-6 rounded-full bg-blue-500 dark:bg-blue-400" />
      )}

      {/* Avatar / Icon */}
      <div className={`size-10 shrink-0 rounded-xl ${cfg.bg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-[20px] ${cfg.text}`}>
          {cfg.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isUnread ? "font-bold text-slate-800 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-200"}`}>
          {notification.title}
        </p>
        <div className="mt-1 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <ExpandableText text={notification.message} lines={2} />
        </div>
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          {timeAgo(notification.createdAt, t)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isUnread && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={t("notifications.markAsRead", "Mark as read")}
          >
            <span className="material-symbols-outlined text-[14px]">done_all</span>
            <span className="hidden sm:inline">{t("notifications.markAsRead", "Mark as read")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-400/[.10] bg-white dark:bg-[#0a1020] animate-pulse">
      <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-200/60 dark:bg-slate-700/60" />
        <div className="h-3 w-1/4 rounded bg-slate-200/40 dark:bg-slate-700/40" />
      </div>
    </div>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    totalCount,
    loading,
    hasMore,
    filter,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    changeFilter,
    loadMore,
  } = useNotifications();

  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    refreshNotifications();
  }, []);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
    } catch {
      alertError(t("notifications.errors.title", "Error"), t("notifications.errors.markReadFailed", "Failed to mark as read."));
    }
  }, [markNotificationAsRead, t]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
    } catch {
      alertError(t("notifications.errors.title", "Error"), t("notifications.errors.markReadFailed", "Failed to mark as read."));
    } finally {
      setMarkingAll(false);
    }
  }, [markAllNotificationsAsRead, t, markingAll]);

  const tabs = [
    { id: "all", label: t("notifications.tabs.all", "All"), icon: "inbox" },
    { id: "unread", label: t("notifications.tabs.unread", "Unread"), icon: "mark_email_unread" },
  ];

  const counts = {
    all: totalCount,
    unread: unreadCount,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white">
              {t("notifications.title", "Notifications")}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {unreadCount > 0
                ? t("notifications.subtitle", "You have {{count}} unread notifications", { count: unreadCount })
                : t("notifications.subtitleNone", "You're all caught up")}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors self-start disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-[18px] ${markingAll ? "animate-spin" : ""}`}>done_all</span>
              {t("notifications.markAllRead", "Mark all as read")}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TabBar
        active={filter}
        onChange={changeFilter}
        tabs={tabs}
        counts={counts}
      />

      {/* Content — keyed to trigger fadeInUpTab on tab switch */}
      <div key={filter} style={{ animation: "fadeInUpTab 0.25s ease-out forwards" }}>
        {/* Loading state */}
        {loading && notifications.length === 0 && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <EmptyState
            icon={filter === "unread" ? "mark_email_read" : "notifications"}
            title={filter === "unread"
              ? t("notifications.empty.unread", "You're all caught up")
              : t("notifications.empty.all", "No notifications yet")}
            subtitle={filter === "unread"
              ? t("notifications.empty.unreadDesc", "No unread notifications.")
              : t("notifications.empty.allDesc", "When recruiters contact you, you'll see notifications here.")}
            variant="page"
          />
        )}

        {/* Notification list */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkAsRead={handleMarkAsRead}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {t("notifications.loadMore", "Load more")}
          </button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && notifications.length > 0 && (
        <div className="flex justify-center py-4">
          <span className="material-symbols-outlined text-slate-400 animate-spin">progress_activity</span>
        </div>
      )}
    </div>
  );
}
