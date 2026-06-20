import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../theme/ThemeProvider.jsx";
import settingsService from "../../api/settingsService.js";
import wizardService from "../../api/wizardService.js";
import { toastSuccess, alertError, confirmAction } from "../../lib/alerts.js";
import { extractError } from "../../utils/extractError.js";
import { Card } from "../../Components/ui/Card";
import { TabBar } from "../../Components/ui/TabBar";
import SearchableSelect from "../../Components/SearchableSelect";

const TABS = [
  { id: "account", labelKey: "settings.tabs.account", icon: "person" },
  { id: "security", labelKey: "settings.tabs.security", icon: "shield" },
  { id: "notifications", labelKey: "settings.tabs.notifications", icon: "notifications" },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, login, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Account state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  // Job title state
  const [jobTitleId, setJobTitleId] = useState(null);
  const [jobTitles, setJobTitles] = useState([]);
  const [jobTitleSaving, setJobTitleSaving] = useState(false);
  const [lastJobTitleChange, setLastJobTitleChange] = useState(null);

  // Years of experience state
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [yearsSaving, setYearsSaving] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Deactivate state
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateConfirmation, setDeactivateConfirmation] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  // Delete state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [notificationsSaving, setNotificationsSaving] = useState(false);

  const isGoogleUser = user?.authProvider === "Google";
  const inputClass =
    "w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
      const [settingsRes, jobTitlesRes] = await Promise.all([
        settingsService.getSettings(),
        wizardService.getJobTitles(lang),
      ]);

      const settings = settingsRes.data?.data || settingsRes.data;
      setEmailNotifications(settings?.emailNotificationsEnabled ?? true);
      setWeeklyDigest(settings?.weeklyDigestEnabled ?? true);

      const jobTitlesData = jobTitlesRes.data?.data || jobTitlesRes.data;
      setJobTitles(Array.isArray(jobTitlesData) ? jobTitlesData : []);

      // Set name from auth context
      setFirstName(user?.firstName || "");
      setLastName(user?.lastName || "");
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, [user, i18n.language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch personal info for job title and years of experience
  useEffect(() => {
    if (user?.accountType?.toLowerCase() === "jobseeker") {
      const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
      wizardService
        .getPersonalInfo(lang)
        .then((res) => {
          const data = res.data?.data || res.data;
          setJobTitleId(data?.jobTitleId || null);
          setLastJobTitleChange(data?.lastJobTitleChangedAt || null);
          setYearsOfExperience(data?.yearsOfExperience || 0);
        })
        .catch(() => { });
    }
  }, [user, i18n.language]);

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setNameSaving(true);
    try {
      const res = await settingsService.updateName({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      const updatedUser = res.data?.user;
      if (updatedUser) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const newUser = { ...storedUser, firstName: updatedUser.firstName, lastName: updatedUser.lastName };
        login(localStorage.getItem("token"), newUser);
      }
      toastSuccess(t("settings.account.nameUpdated"));
    } catch (err) {
      alertError(extractError(err));
    } finally {
      setNameSaving(false);
    }
  };

  const handleSaveJobTitle = async () => {
    if (!jobTitleId) return;
    setJobTitleSaving(true);
    try {
      await settingsService.updateJobTitle({ jobTitleId: Number(jobTitleId) });
      setLastJobTitleChange(new Date().toISOString());
      toastSuccess(t("settings.account.jobTitleUpdated"));
    } catch (err) {
      alertError(extractError(err));
    } finally {
      setJobTitleSaving(false);
    }
  };

  const handleSaveYears = async () => {
    setYearsSaving(true);
    try {
      await wizardService.updateYearsOfExperience({ yearsOfExperience: parseInt(yearsOfExperience) || 0 });
      toastSuccess(t("settings.account.yearsUpdated", "Years of experience updated"));
    } catch (err) {
      alertError(extractError(err));
    } finally {
      setYearsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      alertError(t("settings.security.passwordMismatch"));
      return;
    }
    setPasswordSaving(true);
    try {
      await settingsService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      toastSuccess(t("settings.security.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alertError(extractError(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (deactivateConfirmation !== "DEACTIVATE") return;
    const confirmed = await confirmAction(
      t("settings.security.deactivate.title"),
      t("settings.security.deactivate.description"),
      t("settings.security.deactivate.button")
    );
    if (!confirmed) return;

    setDeactivating(true);
    try {
      await settingsService.deactivateAccount({
        password: deactivatePassword || undefined,
        confirmation: deactivateConfirmation,
      });
      toastSuccess(t("settings.security.deactivate.success"));
      setTimeout(() => {
        logout();
        window.location.assign("/");
      }, 2000);
    } catch (err) {
      alertError(extractError(err));
    } finally {
      setDeactivating(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== "DELETE") return;
    const confirmed = await confirmAction(
      t("settings.security.delete.title"),
      t("settings.security.delete.warning"),
      t("settings.security.delete.button")
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await settingsService.deleteAccount({
        password: deletePassword || undefined,
        confirmation: deleteConfirmation,
      });
      toastSuccess(t("settings.security.delete.success"));
      // Logout after deletion
      setTimeout(() => {
        logout();
        window.location.assign("/");
      }, 2000);
    } catch (err) {
      alertError(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleNotificationsSave = async () => {
    setNotificationsSaving(true);
    try {
      await settingsService.updateSettings({
        emailNotificationsEnabled: emailNotifications,
        weeklyDigestEnabled: weeklyDigest,
      });
      toastSuccess(t("settings.notifications.settingsUpdated"));
    } catch (err) {
      alertError(extractError(err));
    } finally {
      setNotificationsSaving(false);
    }
  };

  // Check if job title change is on cooldown
  const getJobTitleCooldownInfo = () => {
    if (!lastJobTitleChange) return null;
    const changed = new Date(lastJobTitleChange);
    const now = new Date();
    const daysSince = (now - changed) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) {
      const daysRemaining = Math.ceil(30 - daysSince);
      return t("settings.account.daysRemaining", { count: daysRemaining });
    }
    return null;
  };

  const cooldownInfo = getJobTitleCooldownInfo();
  const canChangeJobTitle = !cooldownInfo;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl animate-spin text-blue-500">
            progress_activity
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("settings.title")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <TabBar active={activeTab} onChange={setActiveTab} tabs={TABS.map(tab => ({ ...tab, label: t(tab.labelKey) }))} />

      {/* Tab Content */}
      <div key={activeTab} style={{ animation: "fadeInUpTab 0.25s ease-out forwards" }}>
        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Profile Information */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-2xl">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">
                {t("settings.account.title")}
              </h3>
              <div className="space-y-5">
                {/* Email (read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t("settings.account.email")}
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Account Type + Auth Provider */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t("settings.account.accountType")}
                    </label>
                    <div className="flex items-center h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <span className="material-symbols-outlined text-[16px] text-blue-500">
                          {user?.accountType?.toLowerCase() === "jobseeker" ? "person" : "business"}
                        </span>
                        {user?.accountType?.toLowerCase() === "jobseeker"
                          ? t("settings.account.typeJobSeeker")
                          : t("settings.account.typeRecruiter")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t("settings.account.authProvider")}
                    </label>
                    <div className="flex items-center h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {isGoogleUser ? (
                          <i className="fa-brands fa-google text-[14px] text-red-500" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-blue-500">mail</span>
                        )}
                        {isGoogleUser ? "Google" : t("settings.account.providerEmail")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name (editable) */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-400/[.14]">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t("settings.account.name")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t("settings.account.firstName")}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t("settings.account.lastName")}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={nameSaving || !firstName.trim() || !lastName.trim()}
                    className="mt-3 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {nameSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        {t("modal.saving")}
                      </span>
                    ) : (
                      t("settings.account.saveName")
                    )}
                  </button>
                </div>
              </div>
            </Card>

            {/* Job Title (Job Seeker only) */}
            {user?.accountType?.toLowerCase() === "jobseeker" && (
              <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-2xl">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                  {t("settings.account.jobTitle")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  {t("settings.account.updateCooldown")}
                </p>
                <div className="space-y-4">
                  <SearchableSelect
                    options={jobTitles.map(jt => ({ value: jt.id, label: jt.title }))}
                    value={jobTitleId ? Number(jobTitleId) : null}
                    onChange={(val) => setJobTitleId(val)}
                    placeholder={t("settings.account.selectJobTitle")}
                    searchPlaceholder={t("settings.account.selectJobTitle")}
                    disabled={!canChangeJobTitle}
                  />
                  {cooldownInfo && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {cooldownInfo}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveJobTitle}
                    disabled={jobTitleSaving || !canChangeJobTitle || !jobTitleId}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {jobTitleSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        {t("modal.saving")}
                      </span>
                    ) : (
                      t("settings.account.saveJobTitle")
                    )}
                  </button>
                </div>
              </Card>
            )}

            {/* Years of Experience (Job Seeker only) */}
            {user?.accountType?.toLowerCase() === "jobseeker" && (
              <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-2xl">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                  {t("settings.account.yearsOfExperience")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  {t("settings.account.yearsOfExperienceDesc", "Update your total years of professional experience")}
                </p>
                <div className="space-y-4">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-12 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSaveYears}
                    disabled={yearsSaving}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {yearsSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        {t("modal.saving")}
                      </span>
                    ) : (
                      t("settings.account.saveExperience")
                    )}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Change Password */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-2xl">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">
                {t("settings.security.changePassword")}
              </h3>
              {isGoogleUser ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                  <span className="material-symbols-outlined text-blue-500">info</span>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {t("settings.security.googleUserNotice")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t("settings.security.currentPassword")}
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t("settings.security.newPassword")}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                      {t("settings.security.passwordHint")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t("settings.security.confirmPassword")}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {passwordSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        {t("modal.saving")}
                      </span>
                    ) : (
                      t("settings.security.updatePassword")
                    )}
                  </button>
                </div>
              )}
            </Card>

            {/* Deactivate Account */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-2xl">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                {t("settings.security.deactivate.title")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                {t("settings.security.deactivate.description")}
              </p>
              <div className="space-y-4">
                {!isGoogleUser && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t("settings.security.deactivate.passwordLabel")}
                    </label>
                    <input
                      type="password"
                      value={deactivatePassword}
                      onChange={(e) => setDeactivatePassword(e.target.value)}
                      placeholder={t("settings.security.deactivate.passwordPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t("settings.security.deactivate.confirmationLabel")}
                  </label>
                  <input
                    type="text"
                    value={deactivateConfirmation}
                    onChange={(e) => setDeactivateConfirmation(e.target.value)}
                    placeholder={t("settings.security.deactivate.confirmationPlaceholder")}
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deactivating || deactivateConfirmation !== "DEACTIVATE"}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {deactivating ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      {t("modal.saving")}
                    </span>
                  ) : (
                    t("settings.security.deactivate.button")
                  )}
                </button>
              </div>
            </Card>

            {/* Delete Account (Danger Zone) */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] border-red-200 dark:border-red-500/30 rounded-2xl">
              <h3 className="text-base font-bold text-red-600 dark:text-red-400 mb-1">
                {t("settings.security.delete.titleDanger")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {t("settings.security.delete.description")}
              </p>
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 mb-5">
                <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>
                <p className="text-xs text-red-700 dark:text-red-400">
                  {t("settings.security.delete.warning")}
                </p>
              </div>
              <div className="space-y-4">
                {!isGoogleUser && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t("settings.security.delete.passwordLabel")}
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder={t("settings.security.delete.passwordPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t("settings.security.delete.confirmationLabel")}
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={t("settings.security.delete.confirmationPlaceholder")}
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirmation !== "DELETE"}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      {t("modal.saving")}
                    </span>
                  ) : (
                    t("settings.security.delete.button")
                  )}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-2xl">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">
              {t("settings.notifications.title")}
            </h3>
            <div className="space-y-4">
              <ToggleRow
                label={t("settings.notifications.emailNotifications")}
                description={t("settings.notifications.emailNotificationsDesc")}
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
              <ToggleRow
                label={
                  user?.accountType?.toLowerCase() === "recruiter"
                    ? t("settings.notifications.weeklySummary")
                    : t("settings.notifications.weeklyDigest")
                }
                description={
                  user?.accountType?.toLowerCase() === "recruiter"
                    ? t("settings.notifications.weeklySummaryDesc")
                    : t("settings.notifications.weeklyDigestDesc")
                }
                checked={weeklyDigest}
                onChange={setWeeklyDigest}
              />
            </div>
            <button
              type="button"
              onClick={handleNotificationsSave}
              disabled={notificationsSaving}
              className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {notificationsSaving ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  {t("modal.saving")}
                </span>
              ) : (
                t("dashboard.common.save")
              )}
            </button>
          </Card>
        )}

      </div>
    </div>
  );
}

/* ─── Toggle Row Component ─── */
function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        )}
      </div>
      <div className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
