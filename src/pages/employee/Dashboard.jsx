import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePicture } from "../../context/PictureContext.jsx";
import { useTheme } from "../../theme/ThemeProvider.jsx";
import wizardService from "../../api/wizardService.js";
import assessmentService from "../../api/assessmentService.js";
import { getEngagementStats } from "../../api/engagementService.js";
import { toastSuccess, alertError, confirmAction } from "../../lib/alerts.js";
import { extractError } from "../../utils/extractError.js";
import {
  BioModal,
  LanguageModal,
  ExperienceModal,
  EducationModal,
  SkillsModal,
  ProjectModal,
  SocialLinksModal,
} from "../../Components/ProfileModals.jsx";
import ExpandableText from "../../Components/ui/ExpandableText.jsx";

import { Card } from "../../Components/ui/Card";
import { Pill } from "../../Components/ui/Pill";
import { EmptyState } from "../../Components/ui/EmptyState";
import { Timeline, TimelineItem } from "../../Components/ui/Timeline";
import { SectionCard } from "../../Components/ui/SectionCard";
import { TabBar } from "../../Components/ui/TabBar";
import SearchableSelect from "../../Components/SearchableSelect.jsx";

const TABS = [
  { id: "personalInfo", labelKey: "tabs.personalInfo", icon: "person" },
  { id: "experience", labelKey: "tabs.experience", icon: "work" },
  { id: "education", labelKey: "tabs.education", icon: "school" },
  { id: "projects", labelKey: "section.projects", icon: "rocket_launch" },
  { id: "skills", labelKey: "tabs.skills", icon: "psychology" },
];

const SOCIAL_FIELDS = [
  { key: "linkedIn", labelKey: "LinkedIn", faClass: "fa-brands fa-linkedin-in" },
  { key: "github", labelKey: "GitHub", faClass: "fa-brands fa-github" },
  { key: "behance", labelKey: "Behance", faClass: "fa-brands fa-behance" },
  { key: "dribbble", labelKey: "Dribbble", faClass: "fa-brands fa-dribbble" },
  { key: "personalWebsite", labelKey: "dashboard.section.personalWebsite", faClass: "fa-solid fa-globe" },
];

/* ─── Profile strength ring (matches the "1%" / 2 yrs + visual ring in image) ─── */
function ProfileStrengthRing({ value, dark }) {
  const radius = 27;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const stroke = dark ? "#38bdf8" : "#f97316";
  const track = dark ? "#1a2540" : "#e2e8f0";
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" aria-hidden="true">
      <circle cx={36} cy={36} r={radius} fill="none" stroke={track} strokeWidth={6} />
      <circle
        cx={36}
        cy={36}
        r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.22,.68,0,1.2)" }}
      />
      <text
        x={36}
        y={37}
        textAnchor="middle"
        fill={stroke}
        fontSize={13}
        fontWeight={800}
      >
        {value}%
      </text>
    </svg>
  );
}

/* ─── Left side: profile card (mirrors image exactly) ─── */
function ProfileCard({
  profileData,
  skills,
  experiences,
  educations,
  projects,
  assessmentSummary,
  engagementStats,
  pictureUrl,
  pictureMeta,
  resumeInfo,
  onPictureUpload,
  onPictureDelete,
  onResumeUpload,
  onResumeDelete,
  onResumeDownload,
  onResumeOpen,
  onResumeParse,
  pictureDeleting,
  resumeDeleting,
  openingResume,
  parsingResume,
  onFieldSaved,
}) {
  const { t, i18n } = useTranslation();
  const picInputRef = useRef(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  const [imgError, setImgError] = useState(false);
  const [flagError, setFlagError] = useState(false);

  // Inline edit state for sidebar fields
  const [editingField, setEditingField] = useState(null); // 'phone' | 'location' | 'yearsOfExperience' | null
  const [editPhone, setEditPhone] = useState("");
  const [editCountryId, setEditCountryId] = useState("");
  const [editCityId, setEditCityId] = useState("");
  const [editYears, setEditYears] = useState("");
  const [savingField, setSavingField] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Reset imgError whenever the picture URL changes so that a newly
  // uploaded image is displayed even if a previous image had failed to load.
  useEffect(() => {
    setImgError(false);
  }, [pictureUrl]);
  const [isDark, setIsDark] = useState(() =>
    theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches)
  );
  useEffect(() => {
    if (theme === "system") {
      const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
      const handler = (e) => setIsDark(e.matches);
      mql?.addEventListener?.("change", handler);
      setIsDark(mql?.matches ?? false);
      return () => mql?.removeEventListener?.("change", handler);
    }
    setIsDark(theme === "dark");
  }, [theme]);

  // A resume is "on file" only when the API actually returned a
  // filename. The backend can return a `resumeInfo` object without a
  // filename in stale/edge states (e.g. immediately after a delete
  // or when the file blob is still being processed), and the previous
  // code gated the display on `resumeInfo` truthy — so the row would
  // show "No resume uploaded" while still rendering clickable Open /
  // Download / Delete / Parse buttons. We key all four off `hasResume`
  // so the visible state and the actions stay in lockstep: no filename
  // → no actions.
  const hasResume = Boolean(resumeInfo?.fileName || resumeInfo?.filename);

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || t("dashboard.newUser");
  const initials =
    `${(user?.firstName || "")[0] || ""}${(user?.lastName || "")[0] || ""}`.toUpperCase() || "?";

  const jobTitle = profileData?.jobTitle || t("dashboard.noJobTitle");
  const bestScore = typeof assessmentSummary?.bestScore === "number" ? Math.round(assessmentSummary.bestScore) : null;
  const scoreDisplay = bestScore != null ? `${bestScore}%` : "—";
  const email = user?.email || "";
  const phone = profileData?.phoneNumber || "";
  const city = profileData?.city || "";
  const country = profileData?.country || "";
  const countryCode = (profileData?.countryCode || "").toLowerCase();
  const hasLocation = Boolean(city || country);
  const flagUrl = countryCode ? `https://flagcdn.com/w80/${countryCode}.png` : null;
  const locationLine = [city, country].filter(Boolean).join(", ");

  const strength = useMemo(() => {
    let s = 10;
    if (profileData) s += 15;
    if (skills.length) s += 15;
    if (experiences.length) s += 15;
    if (educations.length) s += 15;
    if (projects.length) s += 15;
    if (resumeInfo) s += 15;
    return Math.min(s, 100);
  }, [profileData, skills, experiences, educations, projects, resumeInfo]);

  const handlePic = (e) => {
    const file = e.target.files?.[0];
    if (file) onPictureUpload(file);
    // Reset the input value so the same file can be re-uploaded
    e.target.value = "";
  };

  // ── Inline edit handlers ──────────────────────────────────────
  const startEdit = async (field) => {
    setEditingField(field);
    if (field === "phone") {
      setEditPhone(phone || "");
    } else if (field === "location") {
      setEditCountryId(profileData?.countryId?.toString() || "");
      setEditCityId(profileData?.cityId?.toString() || "");
      try {
        const res = await wizardService.getCountries(i18n.language);
        setCountries(res.data?.data || res.data || []);
      } catch { /* non-fatal */ }
      if (profileData?.countryId) {
        setLoadingCities(true);
        try {
          const res = await wizardService.getCities(profileData.countryId, i18n.language);
          setCities(res.data?.data || res.data || []);
        } catch { /* non-fatal */ }
        setLoadingCities(false);
      }
    } else if (field === "yearsOfExperience") {
      setEditYears(profileData?.yearsOfExperience?.toString() || "0");
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setSavingField(false);
  };

  const handleCountryChange = async (newCountryId) => {
    setEditCountryId(newCountryId);
    setEditCityId("");
    if (!newCountryId) { setCities([]); return; }
    setLoadingCities(true);
    try {
      const res = await wizardService.getCities(newCountryId, i18n.language);
      setCities(res.data?.data || res.data || []);
    } catch { /* non-fatal */ }
    setLoadingCities(false);
  };

  const saveField = async () => {
    setSavingField(true);
    try {
      if (editingField === "phone") {
        await wizardService.updatePhone({ phoneNumber: editPhone.trim() || null });
      } else if (editingField === "location") {
        if (!editCountryId || !editCityId) {
          alertError(t("dashboard.alerts.validationError", "Validation Error"), t("dashboard.alerts.locationRequired", "Country and city are required"));
          setSavingField(false);
          return;
        }
        await wizardService.updateLocation({ countryId: parseInt(editCountryId), cityId: parseInt(editCityId) });
      } else if (editingField === "yearsOfExperience") {
        const val = parseInt(editYears) || 0;
        if (val < 0 || val > 50) {
          alertError(t("dashboard.alerts.validationError", "Validation Error"), t("dashboard.alerts.yearsRange", "Years must be between 0 and 50"));
          setSavingField(false);
          return;
        }
        await wizardService.updateYearsOfExperience({ yearsOfExperience: val });
      }
      toastSuccess(t("dashboard.alerts.saved", "Saved successfully"));
      setEditingField(null);
      onFieldSaved?.();
    } catch (err) {
      alertError(t("modal.save", "Save"), extractError(err));
    } finally {
      setSavingField(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-3xl bg-gradient-to-b from-white/[.02] to-transparent">
      {/* Avatar + ring + camera overlay */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="drop-shadow-[0_0_8px_rgba(56,189,248,0.25)]">
            <ProfileStrengthRing value={strength} dark={isDark} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-[44px] rounded-full overflow-hidden border-2 border-white dark:border-[#0a1020] bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {pictureUrl && !imgError ? (
                <img src={pictureUrl} alt={displayName} className="w-full h-full object-cover" onError={() => setImgError(true)} />
              ) : (
                <span className="text-sm font-extrabold text-slate-600 dark:text-slate-200">
                  {initials}
                </span>
              )}
            </div>
          </div>
          {/* Camera overlay button — fixed physical right so it never overlaps the delete button in RTL */}
          <button
            type="button"
            onClick={() => picInputRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 size-7 rounded-full bg-blue-600 hover:bg-blue-500 hover:scale-110 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-[#0a1020] transition-all duration-200"
            aria-label={t("dashboard.changePhoto")}
          >
            <span className="material-symbols-outlined text-white text-[14px]">photo_camera</span>
          </button>
          {/* Delete picture button — fixed physical left so it never overlaps the camera in RTL.
              Neutral gray default keeps the avatar area calm; hover reveals the destructive
              red so intent is clear at the moment of interaction. Trash icon (not X) is
              semantically precise for "remove picture". */}
          {pictureMeta?.hasProfilePicture && !pictureMeta?.isDefaultPicture && onPictureDelete && (
            <button
              type="button"
              onClick={onPictureDelete}
              disabled={pictureDeleting}
              className="absolute -bottom-0.5 -left-0.5 size-7 rounded-full bg-slate-700/90 dark:bg-slate-800/90 hover:bg-red-500 dark:hover:bg-red-500 hover:scale-110 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-[#0a1020] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={t("dashboard.alerts.deletePicture")}
              title={t("dashboard.alerts.deletePicture")}
            >
              {pictureDeleting ? (
                <span className="material-symbols-outlined text-white text-[14px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-white text-[14px]">delete</span>
              )}
            </button>
          )}
          <input
            ref={picInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePic}
          />
        </div>

        <h3 className="mt-3 text-base font-extrabold text-slate-800 dark:text-white truncate max-w-full">
          {displayName}
        </h3>
        <div className="mt-1.5">
          <Pill>
            <span className="material-symbols-outlined text-[12px]">bolt</span>
            {jobTitle}
          </Pill>
        </div>
      </div>

      <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />

      {/* Stats — order: Score, Recommendations, Profile Views.
          Score shows the best assessment result.
          Recommendations show how many times the candidate appeared in AI matching. 
          Profile views show how many times recruiters viewed the profile. */}
      <div className="flex flex-row gap-2">
        <div className="flex-1"><StatCard icon="verified" value={scoreDisplay} label={t("dashboard.stats.score")} /></div>
        <div className="flex-1"><StatCard icon="star" value={engagementStats?.totalRecommendations ?? 0} label={t("dashboard.stats.recommendations")} /></div>
        <div className="flex-1"><StatCard icon="visibility" value={engagementStats?.totalProfileViews ?? 0} label={t("dashboard.stats.profileViews")} /></div>
      </div>

      <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />

      {/* Contact & Location */}
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
        {t("dashboard.contactInfo")}
      </p>
      <div className="space-y-2">
        {/* Email */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
          <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">mail</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
              {t("dashboard.email")}
            </p>
            <p
              className={`text-xs mt-0.5 truncate ${
                email ? "text-slate-700 dark:text-slate-200 font-semibold" : "text-slate-400 dark:text-slate-500 italic"
              }`}
              dir="ltr"
            >
              {email || t("dashboard.noEmail")}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
          <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">call</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
              {t("dashboard.phone")}
            </p>
            {editingField === "phone" ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="flex-1 min-w-0 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  dir="ltr"
                  autoFocus
                />
                <button type="button" onClick={saveField} disabled={savingField} className="shrink-0 size-6 rounded-md bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-[13px]">{savingField ? "progress_activity" : "check"}</span>
                </button>
                <button type="button" onClick={cancelEdit} disabled={savingField} className="shrink-0 size-6 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-0.5">
                <p
                  className={`text-xs truncate flex-1 min-w-0 ${
                    phone ? "text-slate-700 dark:text-slate-200 font-semibold" : "text-slate-400 dark:text-slate-500 italic"
                  }`}
                  dir="ltr"
                >
                  {phone || t("dashboard.noPhone")}
                </p>
                <button type="button" onClick={() => startEdit("phone")} className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bio moved to the Personal Info tab — see TabContent "personalInfo" */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
          <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center overflow-hidden">
            {flagUrl && !flagError ? (
              <img
                src={flagUrl}
                alt={country || "flag"}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setFlagError(true)}
              />
            ) : (
              <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-blue-400">
                public
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
              {t("dashboard.location")}
            </p>
            {editingField === "location" ? (
              <div className="flex flex-col gap-1.5 mt-1">
                <SearchableSelect
                  options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                  value={editCountryId}
                  onChange={handleCountryChange}
                  placeholder={t("step1.selectCountry", "Select country")}
                  searchPlaceholder={t("step1.search", "Search...")}
                />
                <SearchableSelect
                  options={cities.map(c => ({ value: c.id.toString(), label: c.name }))}
                  value={editCityId}
                  onChange={setEditCityId}
                  placeholder={loadingCities ? t("step1.loading", "Loading...") : t("step1.selectCity", "Select city")}
                  searchPlaceholder={t("step1.search", "Search...")}
                  disabled={!editCountryId || loadingCities}
                />
                <div className="flex items-center gap-1">
                  <button type="button" onClick={saveField} disabled={savingField} className="shrink-0 size-6 rounded-md bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors disabled:opacity-50">
                    <span className="material-symbols-outlined text-[13px]">{savingField ? "progress_activity" : "check"}</span>
                  </button>
                  <button type="button" onClick={cancelEdit} disabled={savingField} className="shrink-0 size-6 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors disabled:opacity-50">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-0.5">
                <p
                  className={`text-xs truncate flex-1 min-w-0 ${
                    hasLocation ? "text-slate-700 dark:text-slate-200 font-semibold" : "text-slate-400 dark:text-slate-500 italic"
                  }`}
                >
                  {locationLine || t("dashboard.noLocation")}
                </p>
                <button type="button" onClick={() => startEdit("location")} className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Years of Experience */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
          <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">work_history</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
              {t("dashboard.experience", "Experience")}
            </p>
            {editingField === "yearsOfExperience" ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={editYears}
                  onChange={(e) => setEditYears(e.target.value)}
                  className="w-16 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  dir="ltr"
                  autoFocus
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{t("dashboard.years", "years")}</span>
                <button type="button" onClick={saveField} disabled={savingField} className="shrink-0 size-6 rounded-md bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-[13px]">{savingField ? "progress_activity" : "check"}</span>
                </button>
                <button type="button" onClick={cancelEdit} disabled={savingField} className="shrink-0 size-6 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-0.5">
                <p className={`text-xs truncate flex-1 min-w-0 ${
                  profileData?.yearsOfExperience != null ? "text-slate-700 dark:text-slate-200 font-semibold" : "text-slate-400 dark:text-slate-500 italic"
                }`} dir="ltr">
                  {profileData?.yearsOfExperience != null
                    ? t("dashboard.yearsCount", { count: profileData.yearsOfExperience, defaultValue: "{{count}} years" })
                    : t("dashboard.noExperience", "Not specified")}
                </p>
                <button type="button" onClick={() => startEdit("yearsOfExperience")} className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />

      {/* Resume */}
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
        {t("modal.cv")}
      </p>
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-dashed border-slate-200 dark:border-slate-400/[.14] hover:border-blue-500/40 transition-all">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-[18px] shrink-0">
            description
          </span>
          {/* Filename doubles as the "open in browser" trigger when a
              resume is present. We render it as a real <button> (not a
              styled span) so it's keyboard-focusable and announces as a
              control to screen readers. The download icon next to it
              remains a separate explicit action for users who want to
              save the file. */}
          {hasResume && onResumeOpen ? (
            <button
              type="button"
              onClick={onResumeOpen}
              disabled={openingResume}
              className="group flex items-center gap-1.5 min-w-0 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-start disabled:opacity-60 disabled:cursor-wait"
              aria-label={t("dashboard.alerts.openResume", { name: resumeInfo.fileName || resumeInfo.filename || "" })}
              title={resumeInfo.fileName || resumeInfo.filename || ""}
            >
              <span className="truncate min-w-0">
                {resumeInfo.fileName || resumeInfo.filename || t("dashboard.noResume")}
              </span>
              {openingResume ? (
                <span className="material-symbols-outlined text-[13px] animate-spin shrink-0">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[13px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  open_in_new
                </span>
              )}
            </button>
          ) : (
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate min-w-0">
              {resumeInfo?.fileName || resumeInfo?.filename || t("dashboard.noResume")}
            </span>
          )}
        </div>
        {hasResume && (
          <div className="flex items-center gap-1 shrink-0">
            {onResumeDownload && (
              <button
                type="button"
                onClick={onResumeDownload}
                className="size-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                aria-label={t("dashboard.alerts.downloadResume")}
                title={t("dashboard.alerts.downloadResume")}
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
            )}
            <label
              className="size-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
              aria-label={t("dashboard.reUploadResume")}
              title={t("dashboard.reUploadResume")}
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              <input type="file" className="hidden" accept=".pdf,.docx" onChange={onResumeUpload} />
            </label>
            {onResumeDelete && (
              <button
                type="button"
                onClick={onResumeDelete}
                disabled={resumeDeleting}
                className="size-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={t("dashboard.alerts.deleteResume")}
                title={t("dashboard.alerts.deleteResume")}
              >
                {resumeDeleting ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
      {!hasResume && (
        <label className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-border-dark text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-surface-dark text-sm font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-500 transition-all duration-200">
          <span className="material-symbols-outlined text-[16px]">upload</span>
          {t("dashboard.uploadResume")}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={onResumeUpload}
          />
        </label>
      )}

      {/* AI parse action — primary CTA (solid indigo) vs Re-upload's outlined blue.
          Establishes a clear hierarchy: the magic AI action is the hero; the re-upload
          is a fallback. Only available when a CV is on file. */}
      {hasResume && onResumeParse && (
        <button
          type="button"
          onClick={onResumeParse}
          disabled={parsingResume || resumeDeleting}
          title={t("dashboard.parseResumeHint")}
          aria-label={t("dashboard.parseResumeHint")}
          className="mt-2 w-full group/parse flex items-center justify-center gap-2 py-3 rounded-xl border border-indigo-600 dark:border-indigo-500 text-white bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 hover:border-indigo-700 dark:hover:border-indigo-400 text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {parsingResume ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
              {t("dashboard.parsingResume")}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px] group-hover/parse:rotate-12 transition-transform">
                auto_awesome
              </span>
              {t("dashboard.parseResumeBtn")}
            </>
          )}
        </button>
      )}
    </Card>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] transition-all duration-200 hover:border-blue-500/50 hover:-translate-y-0.5 hover:bg-slate-100 dark:hover:bg-[#0e1628]">
      <div className="flex justify-center mb-1">
        <span className="material-symbols-outlined text-blue-600 dark:text-sky-400 text-[18px]">
          {icon}
        </span>
      </div>
      <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{value}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{label}</p>
    </div>
  );
}

/* ─── Right top: tests card (mirrors image — one MCQ test row) ───
   The banner below the test row is now state-driven: it reads the
   assessment summary computed in the Dashboard and renders one of
   four tonal variants (NotStarted / InProgress / InCooldown /
   Verified). The Start button on the test row itself follows the
   same state machine for label + colour + enabled state. */
function TestsCard({ profileData, onStart, assessmentSummary }) {
  const { t } = useTranslation();
  const hasProfile = Boolean(profileData?.jobTitleId);
  const unlocked = hasProfile;
  // Single-test row: the original design showed a numbered circle
  // ("01") because there used to be two tests (MCQ + Problem Solving).
  // The numbering lost its meaning when the second test was removed,
  // so we now lead with a `quiz` icon to convey "this is a test" at a
  // glance, matching the assessment sidebar nav icon and the
  // AssessmentDashboard's own icon vocabulary.
  const testLabel = t("dashboard.tests.multipleChoice");
  const jobTitle = profileData?.jobTitle || t("dashboard.noJobTitle");
  const years = profileData?.yearsOfExperience ?? 0;

  // Normalise the summary coming in from the Dashboard. The shape is
  // { state: 'notStarted' | 'inProgress' | 'inCooldown' | 'verified',
  //   loading?: bool, daysUntilEligible?: number, currentScore?: number,
  //   lastScore?: number, bestScore?: number }. While `loading` is
  // true we keep the banner in the neutral "not started" state so we
  // don't flash a misleading colour for the half-second it takes to
  // fetch eligibility.
  const aState = assessmentSummary?.state || "notStarted";
  const days = Math.max(0, Math.floor(assessmentSummary?.daysUntilEligible ?? 0));
  const verifiedScore =
    typeof assessmentSummary?.currentScore === "number"
      ? Math.round(assessmentSummary.currentScore)
      : null;

  /* Banner tone + content per state.
     • notStarted  → blue  (action prompt, no danger)
     • inProgress  → amber (attention, pick up where you left off)
     • inCooldown  → red   (restricted, can't start right now)
     • verified    → green (success, you've earned the badge)
     The icon + label + CTA in the test row follow the same map. */
  const bannerTone = {
    notStarted: {
      container:
        "bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400",
      icon: "school",
      ctaClass:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md",
    },
    inProgress: {
      container:
        "bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400",
      icon: "pending",
      ctaClass:
        "bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md",
    },
    inCooldown: {
      container:
        "bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400",
      icon: "hourglass_empty",
      ctaClass:
        "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed",
    },
    verified: {
      container:
        "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
      icon: "verified",
      ctaClass:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md",
    },
  }[aState];

  // Banner copy is a per-state template. Cooldown uses i18n
  // pluralisation (`{{days}} day` vs `{{days}} days`) so we pass
  // `count` for proper form selection. Verified interpolates the
  // current score as a percentage.
  const bannerText = (() => {
    switch (aState) {
      case "inProgress":
        return t("dashboard.tests.bannerInProgress");
      case "inCooldown":
        return t("dashboard.tests.bannerInCooldown", { count: days, days });
      case "verified":
        return t("dashboard.tests.bannerVerified", { score: verifiedScore });
      case "notStarted":
      default:
        return t("dashboard.tests.bannerNotStarted");
    }
  })();

  // Test-row CTA label + enabled state. The CTA is disabled when the
  // user has no profile yet (existing behaviour) or when they're in
  // cooldown (no point letting them start what they can't finish).
  const ctaLabel = (() => {
    if (aState === "inProgress") return t("dashboard.tests.resume");
    if (aState === "verified") return t("dashboard.tests.viewResult");
    return t("dashboard.tests.start");
  })();
  const ctaDisabled = !unlocked || aState === "inCooldown";

  return (
    <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-3xl bg-gradient-to-b from-white/[.02] to-transparent">
      {/* Job title pill */}
      <div className="mb-4">
        <Pill>
          <span className="material-symbols-outlined text-[12px]">bolt</span>
          {jobTitle} · {years}{" "}
          {years === 1 ? t("dashboard.stats.yearShort") : t("dashboard.stats.yearsShort")}
        </Pill>
      </div>

      {/* Test rows */}
      <div className="space-y-3">
        <div
          className={`flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
            unlocked
              ? "bg-slate-50/50 dark:bg-[#0c1424] border-blue-200 dark:border-blue-500/30"
              : "bg-slate-50/30 dark:bg-[#0c1424]/50 border-slate-200 dark:border-slate-400/[.14] opacity-60"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`size-9 shrink-0 rounded-full flex items-center justify-center ${
                unlocked
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">quiz</span>
            </div>
            <span
              className={`text-sm font-bold truncate ${
                unlocked ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {testLabel}
            </span>
          </div>
          <button
            type="button"
            disabled={ctaDisabled}
            onClick={() => !ctaDisabled && onStart?.()}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${bannerTone.ctaClass}`}
          >
            {ctaLabel}
          </button>
        </div>

        {/* State-driven banner. Tone + icon + copy change with the
            user's actual assessment state. The transition is handled
            by Tailwind's `transition-all` on the parent wrapper so a
            state flip (e.g. after submitting the assessment) cross-
            fades between the colour variants smoothly. */}
        <div
          key={aState}
          className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${bannerTone.container}`}
        >
          <span className="material-symbols-outlined text-[18px]">{bannerTone.icon}</span>
          <p className="text-xs sm:text-sm font-semibold">{bannerText}</p>
        </div>
      </div>
    </Card>
  );
}

/* ─── Helpers to format date ranges like the Wizard does ─── */
const formatDate = (iso, lng) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lng, { month: "short", year: "numeric" });
};
const formatDateRange = (item, lng) => {
  if (item?.dateRange) return item.dateRange;
  const start = formatDate(item?.startDate, lng);
  const end = item?.isCurrent ? null : formatDate(item?.endDate, lng);
  if (!start && !end) return "";
  if (start && end) return `${start} — ${end}`;
  return start || end || "";
};

/* ─── Per-tab content ─── */
function TabContent({
  tab,
  profileData,
  skills,
  projects,
  experiences,
  educations,
  socialLinks,
  openModal,
  onDelete,
}) {
  const { t, i18n } = useTranslation();

  if (tab === "skills") {
    const hasSkills = skills.length > 0;
    return (
      <SectionCard
        title={t("dashboard.section.skills")}
        onAction={() => openModal("skills")}
        actionLabel={hasSkills ? t("dashboard.section.editSkills") : t("dashboard.section.addSkills")}
        actionIcon={hasSkills ? "edit" : "add"}
      >
        {hasSkills ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Pill key={s.id} tone="blue">{s.name}</Pill>
            ))}
          </div>
        ) : (
          <EmptyState icon="psychology" message={t("hrProfile.empty.noSkills", "No skills listed.")} />
        )}
      </SectionCard>
    );
  }

  if (tab === "experience") {
    return (
      <SectionCard
        title={t("dashboard.section.experience")}
        onAction={() => openModal("experience", null)}
        actionLabel={t("dashboard.common.add")}
        actionIcon="add"
      >
        {experiences.length === 0 ? (
          <EmptyState icon="work_history" message={t("hrProfile.empty.noExperience", "No work experience listed.")} />
        ) : (
          <Timeline>
            {experiences.map((exp, i) => {
              const empLabel = exp.employmentType
                ? t(`modalExperience.employmentType.${exp.employmentType}`, exp.employmentType)
                : null;
              return (
              <TimelineItem
                key={exp.id || i}
                color="bg-blue-500"
                title={`${exp.jobTitle}${exp.companyName ? " · " + exp.companyName : ""}`}
                subtitle={[exp.country, exp.city].filter(Boolean).join(", ")}
                date={formatDateRange(exp, i18n.language)}
                isCurrent={Boolean(exp.isCurrent)}
                onEdit={() => openModal("experience", exp)}
                onDelete={() => onDelete("experience", exp.id)}
                isLast={i === experiences.length - 1}
              >
                {(empLabel || exp.responsibilities) && (
                  <div className="mt-2 space-y-2">
                    {empLabel && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {empLabel}
                      </span>
                    )}
                    {exp.responsibilities && (
                      <ExpandableText text={exp.responsibilities} lines={2} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line break-words" />
                    )}
                  </div>
                )}
              </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </SectionCard>
    );
  }

  if (tab === "education") {
    return (
      <SectionCard
        title={t("dashboard.section.education")}
        onAction={() => openModal("education", null)}
        actionLabel={t("dashboard.common.add")}
        actionIcon="add"
      >
        {educations.length === 0 ? (
          <EmptyState icon="school" message={t("hrProfile.empty.noEducation", "No education listed.")} />
        ) : (
          <Timeline>
            {educations.map((edu, i) => (
              <TimelineItem
                key={edu.id || i}
                color="bg-purple-500"
                title={edu.institution}
                subtitle={[
                  edu.degree ? t(`modalEducation.degreeOptions.${edu.degree}`) : "",
                  edu.fieldOfStudy || "",
                ].filter(Boolean).join(" · ")}
                date={formatDateRange(edu, i18n.language)}
                isCurrent={Boolean(edu.isCurrent)}
                onEdit={() => openModal("education", edu)}
                onDelete={() => onDelete("education", edu.id)}
                isLast={i === educations.length - 1}
              >
                {edu.gradeOrGPA && (
                  <p className="mt-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {t("dashboard.section.gpa", { gpa: edu.gradeOrGPA })}
                  </p>
                )}
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </SectionCard>
    );
  }

  if (tab === "personalInfo") {
    const langs = [
      {
        name: profileData?.firstLanguage,
        proficiency: profileData?.firstLanguageProficiency,
        type: t("dashboard.section.primary"),
      },
      {
        name: profileData?.secondLanguage,
        proficiency: profileData?.secondLanguageProficiency,
        type: t("dashboard.section.secondary"),
      },
    ].filter((l) => l.name);
    const hasBio = Boolean((profileData?.bio || "").trim());
    return (
      <div className="space-y-8 mt-2 px-1">
        {/* Bio */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {t("dashboard.section.bioTitle")}
            </h3>
            <button
              type="button"
              onClick={() => openModal("bio", null)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110">
                {hasBio ? "edit" : "add"}
              </span>
              <span className="text-xs font-bold">
                {hasBio ? t("dashboard.section.editBioBtn") : t("dashboard.section.addBioBtn")}
              </span>
            </button>
          </div>
          {hasBio ? (
            <ExpandableText text={profileData.bio} lines={4} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl whitespace-pre-wrap" />
          ) : (
            <EmptyState icon="person" message={t("hrProfile.empty.noBio", "No bio provided.")} />
          )}
        </div>

        {/* Social Links */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-400/[.14]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {t("dashboard.section.socialLinks")}
            </h3>
            <button
              type="button"
              onClick={() => openModal("social")}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110">
                {socialLinks ? "edit" : "add"}
              </span>
              <span className="text-xs font-bold">
                {socialLinks ? t("dashboard.section.editSocialLinks") : t("dashboard.section.addSocialLinks")}
              </span>
            </button>
          </div>
          {socialLinks && SOCIAL_FIELDS.some((f) => socialLinks[f.key]) ? (
            <div className="flex flex-wrap gap-3">
              {SOCIAL_FIELDS.filter((f) => socialLinks[f.key]).map((field) => (
                <a
                  key={field.key}
                  href={socialLinks[field.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all font-semibold shadow-sm"
                >
                  <i className={`${field.faClass} text-blue-500 text-[18px]`} />
                  {t(field.labelKey)}
                </a>
              ))}
            </div>
          ) : (
            <EmptyState icon="share" message={t("hrProfile.empty.noSocialLinks", "No social profiles linked.")} />
          )}
        </div>

        {/* Languages */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-400/[.14]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {t("dashboard.section.language")}
            </h3>
            <button
              type="button"
              onClick={() => openModal("language")}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110">edit</span>
              <span className="text-xs font-bold">{t("dashboard.section.editLanguages")}</span>
            </button>
          </div>
          {langs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {langs.map((l, i) => {
                const getProfPct = (p) => {
                  if (!p) return 0;
                  const lower = String(p).toLowerCase();
                  if (lower.includes('native') || lower.includes('fluent')) return 100;
                  if (lower.includes('advanced')) return 80;
                  if (lower.includes('intermediate')) return 50;
                  if (lower.includes('beginner') || lower.includes('basic')) return 25;
                  return 50;
                };
                const pct = getProfPct(l.proficiency);
                return (
                  <div key={i} className="flex flex-col justify-center gap-2.5 bg-slate-50 dark:bg-[#0c1424] rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-400/[.14]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700 dark:text-white">{l.name}</p>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {l.proficiency ? t(`modalLanguage.proficiency.${l.proficiency}`, l.proficiency) : l.type}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon="translate" message={t("hrProfile.empty.noLanguage", "No languages added.")} />
          )}
        </div>
      </div>
    );
  }

  if (tab === "projects") {
    return (
      <SectionCard
        title={t("dashboard.section.projects")}
        onAction={() => openModal("project", null)}
        actionLabel={t("dashboard.common.add")}
        actionIcon="add"
      >
        {projects.length === 0 ? (
          <EmptyState icon="rocket_launch" message={t("hrProfile.empty.noProjects", "No projects listed.")} />
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onEdit={() => openModal("project", p)}
                onDelete={() => onDelete("project", p.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>
    );
  }

  return null;
}

function ProjectCard({ project, onEdit, onDelete }) {
  const { t, i18n } = useTranslation();
  const [expandedTechs, setExpandedTechs] = useState(false);
  const isRtl = i18n.dir() === "rtl";

  const techs = (project.technologiesUsed || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const hasLink = Boolean(project.projectLink);
  const hasDesc = Boolean(project.description);

  return (
    <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] rounded-xl p-4">
      {/* Title row */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug truncate">
          {project.title}
        </h3>
        <div className="flex items-center gap-0.5 shrink-0">
          {hasLink && (
            <a
              href={project.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
              title={t("projectCard.openLink")}
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            aria-label={t("dashboard.common.edit")}
            title={t("dashboard.common.edit")}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            aria-label={t("dashboard.common.delete")}
            title={t("dashboard.common.delete")}
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>

      {/* Description */}
      {hasDesc && (
        <div className="mb-2">
          <ExpandableText text={project.description} lines={2} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line break-words" />
        </div>
      )}

      {/* Tech badges row */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          {techs.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {(expandedTechs ? techs : techs.slice(0, 4)).map((tech, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                >
                  {tech}
                </span>
              ))}
              {!expandedTechs && techs.length > 4 && (
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  +{techs.length - 4}
                </span>
              )}
            </div>
          ) : null}
        </div>
        {techs.length > 4 && (
          <button
            type="button"
            onClick={() => setExpandedTechs((v) => !v)}
            className="self-start inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {expandedTechs ? t("projectCard.showLess") : t("projectCard.showMore")}
            <span className={`material-symbols-outlined text-[12px] transition-transform ${expandedTechs ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
        )}
      </div>
    </div>
  );
}



/* ─── Skeleton (mirrors Wizard loading state) ─── */
function DashboardSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex justify-center">
              <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-3 w-32 mx-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-9 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
            <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </Card>
        </div>
        <div className="lg:col-span-7 xl:col-span-8 space-y-5 lg:space-y-6">
          <Card className="p-5 sm:p-6 space-y-3">
            <div className="h-6 w-48 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            {[0, 1].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </Card>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <Card className="p-5 sm:p-6">
            <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </Card>
        </div>
        <p className="lg:col-span-12 text-center text-sm text-slate-500 dark:text-slate-400">
          {t("dashboard.loadingProfile")}
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   Main Dashboard page
   ═════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pictureUrl, pictureMeta, uploadPicture, deletePicture } = usePicture();

  const [activeTab, setActiveTab] = useState("personalInfo");
  const [modal, setModal] = useState(null); // 'bio' | 'language' | 'skills' | 'experience' | 'education' | 'project'
  const [editData, setEditData] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [openingResume, setOpeningResume] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [resumeInfo, setResumeInfo] = useState(null);
  const [socialLinks, setSocialLinks] = useState(null);
  // Assessment summary for the TestsCard banner. `null` means "still
  // loading / not yet fetched" — the banner falls back to a neutral
  // state in that case instead of flashing the wrong colour. The
  // `assessmentState` is a derived enum (`notStarted | inProgress |
  // inCooldown | verified`) computed in the memo below.
  const [assessmentEligibility, setAssessmentEligibility] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState(null);
  const [engagementStats, setEngagementStats] = useState(null);

  // AbortController for in-flight fetches
  const abortRef = useRef(null);
  // Cache successful fetches per language to avoid duplicate calls
  const dataCacheRef = useRef({ lang: null, payload: null });

  const fetchAll = useCallback(async () => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    // Use cache when language hasn't changed
    const cached =
      dataCacheRef.current.lang === i18n.language && dataCacheRef.current.payload;
    if (cached) {
      await applyPayload(cached);
      return;
    }

    if (!profileData) setInitialLoading(true);

    try {
      const [pR, skR, prR, exR, edR, reR, soR, aE, aH, enR] = await Promise.allSettled([
        wizardService.getPersonalInfo(i18n.language, { signal }),
        wizardService.getUserSkills({ signal }),
        wizardService.getProjects({ signal }),
        wizardService.getExperiences(i18n.language, { signal }),
        wizardService.getEducation(i18n.language, { signal }),
        wizardService.getResume({ signal }),
        wizardService.getSocialAccounts({ signal }),
        assessmentService.checkEligibility(),
        assessmentService.getHistory(),
        getEngagementStats(),
      ]);

      if (signal.aborted) return;

      const payload = { pR, skR, prR, exR, edR, reR, soR, aE, aH, enR };
      dataCacheRef.current = { lang: i18n.language, payload };
      await applyPayload(payload);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
    } finally {
      if (!signal.aborted) setInitialLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // Apply a payload of settled responses to component state
  const applyPayload = async (payload) => {
    const { pR, skR, prR, exR, edR, reR, soR, aE, aH, enR } = payload;

    if (pR.status === "fulfilled") {
      const d = pR.value.data?.data || pR.value.data || null;
      setProfileData(d);
    }
    if (skR.status === "fulfilled") {
      const raw = skR.value.data?.skills || skR.value.data?.data || [];
      setSkills(Array.isArray(raw) ? raw : []);
    }
    if (prR.status === "fulfilled") {
      setProjects(prR.value.data?.data || []);
    }
    if (exR.status === "fulfilled") {
      const d = exR.value.data?.data || exR.value.data;
      setExperiences(d?.experiences || d || []);
    }
    if (edR.status === "fulfilled") {
      const d = edR.value.data?.data || edR.value.data;
      setEducations(d?.educationList || d?.educations || d || []);
    }
    if (reR.status === "fulfilled") {
      setResumeInfo(
        reR.value.data?.resume || reR.value.data?.data?.resume || reR.value.data || null
      );
    }
    if (soR && soR.status === "fulfilled") {
      const d = soR.value.data?.socialAccounts || soR.value.data?.data?.socialAccounts || soR.value.data?.data || null;
      setSocialLinks(d);
    }
    // Assessment data — failure here is non-fatal: the banner falls back
    // to the neutral "not started" copy. Eligibility and history come
    // from the V2 endpoints (already used by the dedicated Assessment
    // page), so the shape is stable.
    if (aE && aE.status === "fulfilled") {
      const d = aE.value.data?.data || aE.value.data || null;
      setAssessmentEligibility(d);
    }
    if (aH && aH.status === "fulfilled") {
      const d = aH.value.data?.data || aH.value.data || null;
      setAssessmentHistory(d);
    }
    if (enR && enR.status === "fulfilled") {
      const d = enR.value?.data || null;
      setEngagementStats(d);
    }
  };

  useEffect(() => {
    fetchAll();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchAll]);

  // Invalidate cache when language changes — handled inside fetchAll by reading current language.
  // The ref still holds the previous payload, so cache miss is automatic.

  const openModal = useCallback((key, data = null) => {
    setEditData(data);
    setModal(key);
  }, []);
  const closeModal = useCallback(() => {
    setModal(null);
    setEditData(null);
  }, []);
  const handleSaved = useCallback(() => {
    // Invalidate cache and refetch
    dataCacheRef.current = { lang: null, payload: null };
    fetchAll();
  }, [fetchAll]);

  const onDelete = useCallback(
    async (kind, id) => {
      const ok = await confirmAction(
        t("dashboard.alerts.deleteConfirmTitle"),
        t("dashboard.alerts.deleteConfirmText"),
        t("dashboard.alerts.confirm"),
        t("dashboard.alerts.cancel")
      );
      if (!ok) return;
      try {
        if (kind === "experience") await wizardService.deleteExperience(id);
        else if (kind === "education") await wizardService.deleteEducation(id);
        else if (kind === "project") await wizardService.deleteProject(id);
        toastSuccess(t("dashboard.alerts.saved"));
        dataCacheRef.current = { lang: null, payload: null };
        fetchAll();
      } catch (err) {
        alertError(t("dashboard.alerts.deleteFailed"), extractError(err));
      }
    },
    [t, fetchAll]
  );

  const onResumeUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingResume(true);
      try {
        // Pure file upload — NO AI parsing happens here. That is owned by
        // the "Parse & Auto-Fill" action (onResumeParse) and the Profile Wizard.
        await wizardService.uploadResume(file);
        toastSuccess(t("dashboard.alerts.saved"));
        dataCacheRef.current = { lang: null, payload: null };
        await fetchAll();
      } catch (err) {
        alertError(t("dashboard.alerts.resumeUploadFailed"), extractError(err));
      } finally {
        setUploadingResume(false);
        e.target.value = "";
      }
    },
    [t, fetchAll]
  );

  const onResumeParse = useCallback(async () => {
    if (!resumeInfo) {
      alertError(
        t("dashboard.parseResumeFailed"),
        t("dashboard.noResume")
      );
      return;
    }
    setParsingResume(true);
    try {
      await wizardService.parseResume();
      toastSuccess(t("dashboard.parseResumeSuccess"));
      // Invalidate the cache so every section of the dashboard refetches and
      // re-renders with the freshly auto-filled data — no page refresh needed.
      dataCacheRef.current = { lang: null, payload: null };
      await fetchAll();
    } catch (err) {
      alertError(t("dashboard.parseResumeFailed"), extractError(err));
    } finally {
      setParsingResume(false);
    }
  }, [resumeInfo, t, fetchAll]);

  const onPictureUpload = useCallback(
    async (file) => {
      setUploadingPicture(true);
      try {
        await uploadPicture(file);
        toastSuccess(t("dashboard.alerts.pictureUploadSuccess"));
        dataCacheRef.current = { lang: null, payload: null };
        await fetchAll();
      } catch (err) {
        alertError(t("dashboard.alerts.pictureUploadFailed"), extractError(err));
      } finally {
        setUploadingPicture(false);
      }
    },
    [t, fetchAll, uploadPicture]
  );

  const onPictureDelete = useCallback(async () => {
    const ok = await confirmAction(
      t("dashboard.alerts.deletePictureTitle"),
      t("dashboard.alerts.deletePictureText"),
      t("dashboard.alerts.confirm"),
      t("dashboard.alerts.cancel")
    );
    if (!ok) return;
    setDeletingPicture(true);
    try {
      await deletePicture();
      toastSuccess(t("dashboard.alerts.pictureDeletedSuccess"));
      dataCacheRef.current = { lang: null, payload: null };
      await fetchAll();
    } catch (err) {
      alertError(t("dashboard.alerts.pictureDeleteFailed"), extractError(err));
    } finally {
      setDeletingPicture(false);
    }
  }, [t, fetchAll, deletePicture]);

  const onResumeDelete = useCallback(async () => {
    const ok = await confirmAction(
      t("dashboard.alerts.resumeDeleteTitle"),
      t("dashboard.alerts.resumeDeleteText"),
      t("dashboard.alerts.confirm"),
      t("dashboard.alerts.cancel")
    );
    if (!ok) return;
    setDeletingResume(true);
    try {
      await wizardService.deleteResume();
      toastSuccess(t("dashboard.alerts.resumeDeletedSuccess"));
      dataCacheRef.current = { lang: null, payload: null };
      await fetchAll();
    } catch (err) {
      alertError(t("dashboard.alerts.resumeDeleteFailed"), extractError(err));
    } finally {
      setDeletingResume(false);
    }
  }, [t, fetchAll]);

  const onResumeDownload = useCallback(async () => {
    if (!resumeInfo) return;
    try {
      const res = await wizardService.getResumeBlob();
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resumeInfo.fileName || resumeInfo.filename || "resume";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alertError(t("dashboard.alerts.resumeDownloadFailed"), extractError(err));
    }
  }, [resumeInfo, t]);

  // Open the resume in a new browser tab (inline preview) instead of
  // downloading it. The backend's download endpoint always sets
  // Content-Disposition: attachment (via `return File()`), so we can't
  // just point a new tab at its URL. Instead we fetch the file as a
  // blob with the auth token, create a same-origin blob URL (which
  // carries no Content-Disposition), and open that — the browser then
  // uses its built-in PDF viewer for PDFs and falls back to a download
  // for formats it can't render inline (e.g. .docx). The download
  // button is kept untouched for users who still want to save the file.
  const onResumeOpen = useCallback(async () => {
    if (!resumeInfo || openingResume) return;
    setOpeningResume(true);
    let blobUrl = null;
    try {
      const res = await wizardService.getResumeBlob();
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      // Revoke after the new tab has had time to load the blob. The
      // browser keeps the blob alive while the tab is open, so a short
      // delay is enough; revoking later is safe but unnecessary.
      setTimeout(() => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      }, 60_000);
    } catch (err) {
      alertError(t("dashboard.alerts.resumeOpenFailed"), extractError(err));
    } finally {
      setOpeningResume(false);
    }
  }, [resumeInfo, openingResume, t]);

  const onStartTest = useCallback(() => {
    navigate("/employee/tests");
  }, [navigate]);

  // Derive the assessment summary that the TestsCard banner needs.
  // We compute the user-facing state from the same eligibility +
  // history data the dedicated Assessment page uses, so the banner
  // is always in sync with the full assessment view.
  //   • hasInProgressAssessment  → "inProgress"  (amber, Resume CTA)
  //   • isInCooldownPeriod       → "inCooldown"  (red,    Start disabled)
  //   • currentScore >= 50 AND
  //     scoreExpiresAt > now     → "verified"    (green,  View Result CTA)
  //   • default                  → "notStarted"  (blue,   Start CTA)
  //   Loading (eligibility is still null) is treated as "notStarted"
  //   too, with `loading: true` so the banner can suppress any
  //   action until data arrives.
  const assessmentSummary = useMemo(() => {
    if (!assessmentEligibility) {
      return { state: "notStarted", loading: true };
    }
    const e = assessmentEligibility;
    if (e.hasInProgressAssessment) {
      return {
        state: "inProgress",
        loading: false,
        lastScore: e.currentScore ?? null,
        daysUntilEligible: e.daysUntilEligible ?? null,
        bestScore: assessmentHistory?.bestScore ?? null,
      };
    }
    if (e.isInCooldownPeriod) {
      return {
        state: "inCooldown",
        loading: false,
        daysUntilEligible: e.daysUntilEligible ?? 0,
        lastScore: e.currentScore ?? null,
        bestScore: assessmentHistory?.bestScore ?? null,
      };
    }
    const score = typeof e.currentScore === "number" ? e.currentScore : null;
    const expiresAt = e.scoreExpiresAt ? new Date(e.scoreExpiresAt) : null;
    const isVerified = score != null && score >= 50 && (!expiresAt || expiresAt > new Date());
    if (isVerified) {
      return {
        state: "verified",
        loading: false,
        currentScore: score,
        bestScore: assessmentHistory?.bestScore ?? score,
        scoreExpiresAt: e.scoreExpiresAt ?? null,
      };
    }
    return {
      state: "notStarted",
      loading: false,
      bestScore: assessmentHistory?.bestScore ?? null,
    };
  }, [assessmentEligibility, assessmentHistory]);

  if (initialLoading && !profileData && skills.length === 0) {
    return (
      <div className="w-full">
        <DashboardSkeleton />
      </div>
    );
  }

  const languageCount =
    (profileData?.firstLanguageId ? 1 : 0) + (profileData?.secondLanguageId ? 1 : 0);
  const hasBio = Boolean((profileData?.bio || "").trim());
  const personalInfoCount = (hasBio ? 1 : 0) + languageCount;
  const tabCounts = {
    personalInfo: personalInfoCount,
    experience: experiences.length,
    education: educations.length,
    projects: projects.length,
    skills: skills.length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Left side: profile card. No sticky behaviour: the whole page
            uses a single, natural scroll context. Both columns flow in the
            grid and grow with their content. The left column is shorter by
            nature (single user card), so it sits cleanly above the fold on
            most tabs and ends naturally at its own bottom. */}
        <div className="lg:col-span-5 xl:col-span-4 min-w-0">
          <ProfileCard
            profileData={profileData}
            skills={skills}
            experiences={experiences}
            educations={educations}
            projects={projects}
            assessmentSummary={assessmentSummary}
            engagementStats={engagementStats}
            pictureUrl={pictureUrl}
            pictureMeta={pictureMeta}
            resumeInfo={resumeInfo}
            onPictureUpload={onPictureUpload}
            onPictureDelete={onPictureDelete}
            onResumeUpload={onResumeUpload}
            onResumeDelete={onResumeDelete}
            onResumeDownload={onResumeDownload}
            onResumeOpen={onResumeOpen}
            onResumeParse={onResumeParse}
            pictureDeleting={deletingPicture || uploadingPicture}
            resumeDeleting={deletingResume || uploadingResume}
            openingResume={openingResume}
            parsingResume={parsingResume}
            onFieldSaved={handleSaved}
          />
        </div>

        {/* Right side: tests + tabs + active content */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5 lg:space-y-6 min-w-0">
          <div className="space-y-5 lg:space-y-6">
            <TestsCard
              profileData={profileData}
              onStart={onStartTest}
              assessmentSummary={assessmentSummary}
            />

            <TabBar active={activeTab} onChange={setActiveTab} counts={tabCounts} tabs={TABS.map(tab => ({ ...tab, label: t(`dashboard.${tab.labelKey}`) }))} />
          </div>

          {/* Right column content card. No fixed height: the card grows
              naturally with the active tab's content and the page scrolls
              vertically. This keeps the left and right columns in a single,
              natural document flow and avoids the dual-scroll UX. */}
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-3xl bg-gradient-to-b from-white/[.02] to-transparent">
            <TabContent
              tab={activeTab}
              profileData={profileData}
              skills={skills}
              projects={projects}
              experiences={experiences}
              educations={educations}
              socialLinks={socialLinks}
              openModal={openModal}
              onDelete={onDelete}
            />
          </Card>
        </div>
      </div>

      {/* ── Modals ── */}
      <BioModal
        open={modal === "bio"}
        onClose={closeModal}
        initialData={profileData}
        onSaved={handleSaved}
      />
      <LanguageModal
        open={modal === "language"}
        onClose={closeModal}
        initialData={profileData}
        onSaved={handleSaved}
      />
      <SkillsModal
        open={modal === "skills"}
        onClose={closeModal}
        initialSkills={skills}
        onSaved={handleSaved}
      />
      <ExperienceModal
        open={modal === "experience"}
        onClose={closeModal}
        initialData={editData}
        onSaved={handleSaved}
      />
      <EducationModal
        open={modal === "education"}
        onClose={closeModal}
        initialData={editData}
        onSaved={handleSaved}
      />
      <ProjectModal
        open={modal === "project"}
        onClose={closeModal}
        initialData={editData}
        onSaved={handleSaved}
      />
      <SocialLinksModal
        open={modal === "social"}
        onClose={closeModal}
        initialData={socialLinks}
        onSaved={handleSaved}
      />
    </div>
  );
}
