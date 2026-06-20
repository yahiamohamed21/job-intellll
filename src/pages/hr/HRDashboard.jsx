// src/pages/hr/HRDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../theme/ThemeProvider.jsx";
import { Card } from "../../Components/ui/Card.jsx";
import { Pill } from "../../Components/ui/Pill.jsx";
import { EmptyState } from "../../Components/ui/EmptyState.jsx";
import { SectionCard } from "../../Components/ui/SectionCard.jsx";
import { TabBar } from "../../Components/ui/TabBar.jsx";
import { Timeline, TimelineItem } from "../../Components/ui/Timeline.jsx";
import ExpandableText from "../../Components/ui/ExpandableText.jsx";
import SearchableSelect from "../../Components/SearchableSelect.jsx";
import { CompanyLinksModal, CompanyDescriptionModal, IndustryModal, CompanySizeModal } from "../../Components/ProfileModals.jsx";
import { recruiterDashboardService } from "../../api/recruiterDashboardService.js";
import { toastSuccess, alertError, confirmAction } from "../../lib/alerts.js";
import { extractError } from "../../utils/extractError.js";

const COMPANY_LOGO_FALLBACK = "/profile_company/company.png";

/* ─── Employment Type Label Helper ─── */
const getEmploymentTypeLabel = (type, isRtl) => {
  const map = {
    FullTime: isRtl ? "دوام كامل" : "Full-time",
    PartTime: isRtl ? "دوام جزئي" : "Part-time",
    Freelance: isRtl ? "عمل حر" : "Freelance",
    Internship: isRtl ? "تدريب" : "Internship",
  };
  return map[type] || type;
};

/* ─── Work Model Label Helper ─── */
const getWorkModelLabel = (model, isRtl) => {
  const map = {
    Remote: isRtl ? "عن بُعد" : "Remote",
    Hybrid: isRtl ? "هجين" : "Hybrid",
    OnSite: isRtl ? "في المكتب" : "On-site",
  };
  return map[model] || model;
};

/* ─── Profile Strength Ring ─── */
function CompanyStrengthRing({ value, dark }) {
  const radius = 27;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const stroke = dark ? "#38bdf8" : "#f97316";
  const track = dark ? "#1a2540" : "#e2e8f0";
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" aria-hidden="true">
      <circle cx={36} cy={36} r={radius} fill="none" stroke={track} strokeWidth={6} />
      <circle
        cx={36} cy={36} r={radius} fill="none" stroke={stroke}
        strokeWidth={6} strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={offset} transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.22,.68,0,1.2)" }}
      />
      <text x={36} y={37} textAnchor="middle" fill={stroke} fontSize={13} fontWeight={800}>
        {value}%
      </text>
    </svg>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon, value, label }) {
  return (
    <div className="flex-1 text-center p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] transition-all duration-200 hover:border-blue-500/50 hover:-translate-y-0.5 hover:bg-slate-100 dark:hover:bg-[#0e1628]">
      <div className="flex justify-center mb-1">
        <span className="material-symbols-outlined text-blue-600 dark:text-sky-400 text-[18px]">{icon}</span>
      </div>
      <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{value}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{label}</p>
    </div>
  );
}

/* ─── Info Field (read-only display) ─── */
function InfoField({ label, value, isLink, t }) {
  return (
    <div className="flex flex-col p-3 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1 mt-0.5">
        {isLink && value ? (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="flex-1 min-w-0 font-bold text-blue-600 dark:text-blue-400 hover:underline truncate text-sm" dir="ltr">
            {value}
          </a>
        ) : (
          <span className={`flex-1 min-w-0 truncate text-sm font-bold ${value ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500 italic"}`}>
            {value || t?.("غير محدد", "—")}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Loading Skeleton ─── */
function DashboardSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex justify-center">
              <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-3 w-32 mx-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-5 w-24 mx-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-9 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-7 xl:col-span-8 space-y-5 lg:space-y-6">
          <Card className="p-5 sm:p-6 space-y-3">
            <div className="h-6 w-48 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            {[0, 1].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </Card>
          <Card className="p-5 sm:p-6">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   Main HR Dashboard Component
   ═════════════════════════════════════════════════════════════════════ */
export default function HRDashboard() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isRtl = i18n.dir() === "rtl";
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches);

  const t = useCallback((ar, en) => (isRtl ? ar : en), [isRtl]);

  // ── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsTotalCount, setJobsTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState("companyInfo");
  const [shortlistedCounts, setShortlistedCounts] = useState({});

  // Logo state
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoMeta, setLogoMeta] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [imgError, setImgError] = useState(false);
  const logoInputRef = useRef(null);
  const versionRef = useRef(0);

  // Location editing state
  const [editingLocation, setEditingLocation] = useState(false);
  const [editCountryId, setEditCountryId] = useState("");
  const [editCityId, setEditCityId] = useState("");
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // Country lookup (id → { name, countryCode })
  const [countryMap, setCountryMap] = useState({});

  // City lookup (id → { name }) — for localizing city names
  const [cityMap, setCityMap] = useState({});

  // Modal state
  const [linksModalOpen, setLinksModalOpen] = useState(false);
  const [descModalOpen, setDescModalOpen] = useState(false);
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [companySizeModalOpen, setCompanySizeModalOpen] = useState(false);
  const [savingModal, setSavingModal] = useState(false);

  // Flag state
  const [flagError, setFlagError] = useState(false);

  // Abort + cache
  const abortRef = useRef(null);
  const dataCacheRef = useRef({ lang: null, payload: null });

  // ── Tabs (NO Overview) ────────────────────────────────────────
  const TABS = useMemo(() => [
    { id: "companyInfo", label: t("معلومات الشركة", "Company Info"), icon: "business" },
    { id: "activeJobs", label: t("الوظائف النشطة", "Active Jobs"), icon: "work" },
  ], [t]);

  const tabCounts = useMemo(() => ({
    companyInfo: company ? 1 : 0,
    activeJobs: jobsTotalCount,
  }), [company, jobsTotalCount]);

  // ── Profile Strength ───────────────────────────────────────────
  const strength = useMemo(() => {
    if (!company) return 10;
    let score = 10;
    if (company?.companyName) score += 15;
    if (company?.industry) score += 15;
    if (company?.companySize) score += 10;
    if (company?.countryName || company?.cityName) score += 15;
    if (company?.companyDescription) score += 15;
    if (company?.website) score += 10;
    if (logoMeta?.hasProfilePicture) score += 10;
    return Math.min(score, 100);
  }, [company, logoMeta]);

  // ── Computed Stats ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const activeJobsCount = jobsTotalCount;
    const totalCandidates = jobs.reduce((sum, j) => sum + (j.candidateCount || 0), 0);
    const totalSkills = new Set(jobs.flatMap(j => (j.skills || []).map(s => s.name))).size;
    return { activeJobsCount, totalCandidates, totalSkills };
  }, [jobs, jobsTotalCount]);

  // ── User Initials (for avatar fallback) ─────────────────────────
  const userInitials = useMemo(() => {
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";
    return (first + last).toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";
  }, [user]);

  // ── Location info (localized from countryMap / cityMap) ──────────
  const localizedCity = useMemo(() => {
    if (company?.cityId && cityMap[company.cityId]) {
      return cityMap[company.cityId];
    }
    return company?.cityName || "";
  }, [company, cityMap]);

  const localizedCountry = useMemo(() => {
    if (company?.countryId && countryMap[company.countryId]) {
      return countryMap[company.countryId].name;
    }
    return company?.countryName || "";
  }, [company, countryMap]);

  const countryCode = useMemo(() => {
    if (company?.countryId && countryMap[company.countryId]) {
      return (countryMap[company.countryId].countryCode || "").toLowerCase();
    }
    return "";
  }, [company, countryMap]);

  const flagUrl = countryCode ? `https://flagcdn.com/w80/${countryCode}.png` : null;

  const locationLine = useMemo(() => {
    return [localizedCity, localizedCountry].filter(Boolean).join(", ");
  }, [localizedCity, localizedCountry]);

  // ── Reset imgError on logoUrl change ───────────────────────────
  useEffect(() => { setImgError(false); }, [logoUrl]);

  // ── Reset flagError on countryCode change ──────────────────────
  useEffect(() => { setFlagError(false); }, [countryCode]);

  // ── Fetch Countries (for flag + location editing) ──────────────
  useEffect(() => {
    let cancelled = false;
    const loadCountries = async () => {
      try {
        const res = await recruiterDashboardService.getCountries(i18n.language);
        const list = res.data?.data || res.data || [];
        if (cancelled) return;
        const map = {};
        list.forEach((c) => { map[c.id] = { name: c.name, countryCode: c.countryCode || "" }; });
        setCountryMap(map);
        setCountries(list);
      } catch { /* non-fatal */ }
    };
    loadCountries();
    return () => { cancelled = true; };
  }, [i18n.language]);

  // ── Fetch Cities for company's country (for city localization) ──
  useEffect(() => {
    if (!company?.countryId || !company?.cityId) { setCityMap({}); return; }
    let cancelled = false;
    const loadCities = async () => {
      try {
        const res = await recruiterDashboardService.getCities(company.countryId, i18n.language);
        const list = res.data?.data || res.data || [];
        if (cancelled) return;
        const map = {};
        list.forEach((c) => { map[c.id] = c.name; });
        setCityMap(map);
      } catch { /* non-fatal */ }
    };
    loadCities();
    return () => { cancelled = true; };
  }, [company?.countryId, company?.cityId, i18n.language]);

  // ── Fetch Dashboard Data ───────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    const cached = dataCacheRef.current.lang === i18n.language && dataCacheRef.current.payload;
    if (cached) {
      await applyPayload(cached);
      setLoading(false);
      return;
    }

    if (!company) setLoading(true);
    setError(null);

    try {
      const data = await recruiterDashboardService.getDashboardData();
      if (signal.aborted) return;

      dataCacheRef.current = { lang: i18n.language, payload: data };
      await applyPayload(data);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      if (!signal.aborted) setError(extractError(err));
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPayload = async (data) => {
    // Normalize LinkedIn property name (backend returns `linkedIn`, frontend uses `linkedin`)
    if (data.company && data.company.linkedIn !== undefined && data.company.linkedin === undefined) {
      data.company.linkedin = data.company.linkedIn;
    }
    setCompany(data.company);
    setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    setJobsTotalCount(data.jobsTotalCount || 0);
    setShortlistedCounts(data.shortlistedCounts || {});

    // Resolve logo URL — company logo takes priority, then uploaded picture (skip defaults)
    if (data.company?.logoUrl) {
      setLogoUrl(data.company.logoUrl);
    } else if (data.picture?.url && !data.picture?.isDefaultPicture) {
      setLogoUrl(data.picture.url);
    } else if (data.picture?.hasProfilePicture && !data.picture?.isDefaultPicture) {
      try {
        const picResponse = await recruiterDashboardService.getLogoBlob();
        if (picResponse.data) {
          setLogoUrl(URL.createObjectURL(picResponse.data));
        }
      } catch { /* Non-critical — fall back to default */ }
    }
    // else: logoUrl stays null → falls through to COMPANY_LOGO_FALLBACK

    setLogoMeta(data.picture);

    if (data.companyError) {
      const status = data.companyError?.response?.status;
      if (status === 404) setCompany(null);
    }
  };

  useEffect(() => {
    fetchDashboard();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchDashboard]);

  // ── Invalidate cache & refetch ─────────────────────────────────
  const invalidateAndRefetch = useCallback(() => {
    dataCacheRef.current = { lang: null, payload: null };
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Logo Handlers ──────────────────────────────────────────────
  const handleLogoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadingLogo(true);
    try {
      await recruiterDashboardService.uploadLogo(file);
      versionRef.current += 1;
      toastSuccess(t("تم رفع الشعار بنجاح", "Logo uploaded successfully"));
      invalidateAndRefetch();
    } catch (err) {
      alertError(t("خطأ في رفع الشعار", "Upload Failed"), extractError(err));
    } finally {
      setUploadingLogo(false);
    }
  }, [t, invalidateAndRefetch]);

  const handleLogoDelete = useCallback(async () => {
    const ok = await confirmAction(
      t("حذف الشعار", "Delete Logo"),
      t("هل أنت متأكد من حذف شعار الشركة؟", "Are you sure you want to delete the company logo?"),
      t("حذف", "Delete"),
      t("إلغاء", "Cancel")
    );
    if (!ok) return;
    setDeletingLogo(true);
    try {
      await recruiterDashboardService.deleteLogo();
      versionRef.current += 1;
      setLogoUrl(null);
      setLogoMeta(null);
      toastSuccess(t("تم حذف الشعار بنجاح", "Logo deleted successfully"));
      invalidateAndRefetch();
    } catch (err) {
      alertError(t("خطأ في حذف الشعار", "Delete Failed"), extractError(err));
    } finally {
      setDeletingLogo(false);
    }
  }, [t, invalidateAndRefetch]);

  // ── Location Edit Handlers ─────────────────────────────────────
  const startEditLocation = useCallback(() => {
    setEditingLocation(true);
    setEditCountryId(company?.countryId?.toString() || "");
    setEditCityId(company?.cityId?.toString() || "");
    if (company?.countryId) {
      setLoadingCities(true);
      recruiterDashboardService.getCities(company.countryId, i18n.language)
        .then((res) => setCities(res.data?.data || res.data || []))
        .catch(() => {})
        .finally(() => setLoadingCities(false));
    }
  }, [company, i18n.language]);

  const cancelEditLocation = useCallback(() => {
    setEditingLocation(false);
    setEditCountryId("");
    setEditCityId("");
    setCities([]);
  }, []);

  const handleCountryChange = useCallback(async (newCountryId) => {
    setEditCountryId(newCountryId);
    setEditCityId("");
    if (!newCountryId) { setCities([]); return; }
    setLoadingCities(true);
    try {
      const res = await recruiterDashboardService.getCities(newCountryId, i18n.language);
      setCities(res.data?.data || res.data || []);
    } catch { /* non-fatal */ }
    setLoadingCities(false);
  }, [i18n.language]);

  const saveLocation = useCallback(async () => {
    if (!editCountryId || !editCityId) {
      alertError(t("خطأ", "Error"), t("المدينة والدولة مطلوبان", "Country and city are required"));
      return;
    }
    setSavingLocation(true);
    try {
      await recruiterDashboardService.updateCompanyInfoPartial({
        countryId: parseInt(editCountryId),
        cityId: parseInt(editCityId),
      });
      toastSuccess(t("تم الحفظ بنجاح", "Saved successfully"));
      setEditingLocation(false);
      invalidateAndRefetch();
    } catch (err) {
      alertError(t("خطأ في الحفظ", "Save Failed"), extractError(err));
    } finally {
      setSavingLocation(false);
    }
  }, [editCountryId, editCityId, t, invalidateAndRefetch]);

  // ── Modal Save Handlers ────────────────────────────────────────
  const handleLinksSave = useCallback(async (form) => {
    setSavingModal(true);
    try {
      await recruiterDashboardService.updateCompanyInfoPartial({
        website: form.website?.trim() || null,
        linkedIn: form.linkedin?.trim() || null,
      });
      toastSuccess(t("تم الحفظ بنجاح", "Saved successfully"));
      setLinksModalOpen(false);
      invalidateAndRefetch();
    } catch (err) {
      alertError(t("خطأ في الحفظ", "Save Failed"), extractError(err));
    } finally {
      setSavingModal(false);
    }
  }, [t, invalidateAndRefetch]);

  const handleDescSave = useCallback(async (form) => {
    setSavingModal(true);
    try {
      await recruiterDashboardService.updateCompanyInfoPartial({
        companyDescription: form.companyDescription,
      });
      toastSuccess(t("تم الحفظ بنجاح", "Saved successfully"));
      setDescModalOpen(false);
      invalidateAndRefetch();
    } catch (err) {
      alertError(t("خطأ في الحفظ", "Save Failed"), extractError(err));
    } finally {
      setSavingModal(false);
    }
  }, [t, invalidateAndRefetch]);

  const handleIndustrySave = useCallback(async (form) => {
    setSavingModal(true);
    try {
      await recruiterDashboardService.updateCompanyInfoPartial({
        industry: form.industry,
      });
      toastSuccess(t("تم الحفظ بنجاح", "Saved successfully"));
      setIndustryModalOpen(false);
      invalidateAndRefetch();
    } catch (err) {
      alertError(t("خطأ في الحفظ", "Save Failed"), extractError(err));
    } finally {
      setSavingModal(false);
    }
  }, [t, invalidateAndRefetch]);

  const handleCompanySizeSave = useCallback(async (form) => {
    setSavingModal(true);
    try {
      await recruiterDashboardService.updateCompanyInfoPartial({
        companySize: form.companySize,
      });
      toastSuccess(t("تم الحفظ بنجاح", "Saved successfully"));
      setCompanySizeModalOpen(false);
      invalidateAndRefetch();
    } catch (err) {
      alertError(t("خطأ في الحفظ", "Save Failed"), extractError(err));
    } finally {
      setSavingModal(false);
    }
  }, [t, invalidateAndRefetch]);

  // ── Render ─────────────────────────────────────────────────────

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <Card className="p-8 sm:p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 dark:text-red-500 mb-4 block">error</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t("خطأ في تحميل البيانات", "Failed to Load Dashboard")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
          <button type="button" onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all">
            {t("إعادة المحاولة", "Retry")}
          </button>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <Card className="p-8 sm:p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-blue-400 dark:text-blue-500 mb-4 block">business</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t("الملف التعريفي للشركة غير مكتمل", "Company Profile Incomplete")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {t("يرجى إكمال ملف تعريف الشركة أولاً لتتمكن من الوصول إلى لوحة التحكم.", "Please complete your company profile first to access the dashboard.")}
          </p>
          <Link to="/recruiter-setup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all">
            <span className="material-symbols-outlined text-[18px]">setup</span>
            {t("إعداد ملف الشركة", "Setup Company Profile")}
          </Link>
        </Card>
      </div>
    );
  }

  // Logo display URL with cache busting
  const displayLogoUrl = logoUrl ? `${logoUrl}?v=${versionRef.current}` : null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">

        {/* ═══════════════════ LEFT PROFILE CARD ═══════════════════ */}
        <div className="lg:col-span-5 xl:col-span-4 min-w-0">
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-3xl bg-gradient-to-b from-white/[.02] to-transparent">

            {/* Logo + Strength Ring */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="drop-shadow-[0_0_8px_rgba(56,189,248,0.25)]">
                  <CompanyStrengthRing value={strength} dark={isDark} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-[44px] rounded-full overflow-hidden border-2 border-white dark:border-[#0a1020] bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    {displayLogoUrl && !imgError ? (
                      <img src={displayLogoUrl} alt={company.companyName}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)} />
                    ) : (
                      <img src={COMPANY_LOGO_FALLBACK} alt={company.companyName}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => { e.target.style.display = "none"; }} />
                    )}
                    {!displayLogoUrl && imgError && (
                      <span className="text-sm font-extrabold text-slate-600 dark:text-slate-200">
                        {userInitials}
                      </span>
                    )}
                  </div>
                </div>
                {/* Camera overlay — physical right */}
                <button type="button" onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo || deletingLogo}
                  className="absolute -bottom-0.5 -right-0.5 size-7 rounded-full bg-blue-600 hover:bg-blue-500 hover:scale-110 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-[#0a1020] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label={t("تغيير الشعار", "Change logo")}>
                  {uploadingLogo ? (
                    <span className="material-symbols-outlined text-white text-[14px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-white text-[14px]">photo_camera</span>
                  )}
                </button>
                {/* Delete logo — physical left */}
                {logoMeta?.hasProfilePicture && !logoMeta?.isDefaultPicture && (
                  <button type="button" onClick={handleLogoDelete}
                    disabled={deletingLogo || uploadingLogo}
                    className="absolute -bottom-0.5 -left-0.5 size-7 rounded-full bg-slate-700/90 dark:bg-slate-800/90 hover:bg-red-500 dark:hover:bg-red-500 hover:scale-110 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-[#0a1020] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label={t("حذف الشعار", "Delete logo")}>
                    {deletingLogo ? (
                      <span className="material-symbols-outlined text-white text-[14px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-white text-[14px]">delete</span>
                    )}
                  </button>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>

              <h3 className="mt-3 text-base font-extrabold text-slate-800 dark:text-white truncate max-w-full">
                {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || company.companyName}
              </h3>
              {company.companyName && (
                <div className="mt-1.5">
                  <Pill tone="blue">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    {company.companyName}
                  </Pill>
                </div>
              )}
            </div>

            {/* Quick Action: View Jobs */}
            <button type="button" onClick={() => navigate("/hr/jobs")}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all">
              <span className="material-symbols-outlined text-[18px]">work</span>
              {t("إدارة الوظائف", "Manage Jobs")}
            </button>

            <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />

            {/* Key Stats */}
            <div className="flex flex-row gap-2">
              <StatCard icon="work" value={stats.activeJobsCount} label={t("وظائف نشطة", "Jobs")} />
              <StatCard icon="person_search" value={stats.totalCandidates} label={t("المتقدمون", "Matched")} />
              <StatCard icon="psychology" value={stats.totalSkills} label={t("مهارات", "Skills")} />
            </div>

            <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />

            {/* Contact Details */}
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              {t("بيانات الاتصال", "Contact Details")}
            </p>
            <div className="space-y-2">
              {/* Email */}
              {user?.email && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                  <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[15px]">mail</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                      {t("البريد الإلكتروني", "Email Address")}
                    </p>
                    <p className="text-xs mt-0.5 truncate text-slate-700 dark:text-slate-200 font-semibold" dir="ltr">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Location — editable inline */}
              {editingLocation ? (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-blue-200 dark:border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">location_on</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                      {t("الموقع", "Location")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <SearchableSelect
                      options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                      value={editCountryId}
                      onChange={handleCountryChange}
                      placeholder={t("اختر الدولة", "Select country")}
                      searchPlaceholder={t("بحث...", "Search...")}
                    />
                    <SearchableSelect
                      options={cities.map(c => ({ value: c.id.toString(), label: c.name }))}
                      value={editCityId}
                      onChange={setEditCityId}
                      placeholder={loadingCities ? t("جاري التحميل...", "Loading...") : t("اختر المدينة", "Select city")}
                      searchPlaceholder={t("بحث...", "Search...")}
                      disabled={!editCountryId || loadingCities}
                    />
                    <div className="flex items-center gap-1 mt-1">
                      <button type="button" onClick={saveLocation} disabled={savingLocation}
                        className="shrink-0 size-6 rounded-md bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined text-[13px]">{savingLocation ? "progress_activity" : "check"}</span>
                      </button>
                      <button type="button" onClick={cancelEditLocation} disabled={savingLocation}
                        className="shrink-0 size-6 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                locationLine ? (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                    <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center overflow-hidden">
                      {flagUrl && !flagError ? (
                        <img src={flagUrl} alt={localizedCountry || t("علم", "flag")}
                          className="w-full h-full object-cover" loading="lazy"
                          onError={() => setFlagError(true)} />
                      ) : (
                        <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-blue-400">location_on</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                        {t("الموقع", "Location")}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-xs truncate flex-1 min-w-0 text-slate-700 dark:text-slate-200 font-semibold">{locationLine}</p>
                        <button type="button" onClick={startEditLocation}
                          className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                    <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">location_on</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                        {t("الموقع", "Location")}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-xs truncate flex-1 min-w-0 text-slate-400 dark:text-slate-500 italic">
                          {t("لم يتم التحديد", "Not set")}
                        </p>
                        <button type="button" onClick={startEditLocation}
                          className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Website */}
              {company.website && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                  <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[15px]">public</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                      {t("الموقع الإلكتروني", "Website")}
                    </p>
                    <a href={company.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs mt-0.5 truncate text-blue-600 dark:text-blue-400 font-semibold hover:underline block" dir="ltr">
                      {company.website}
                    </a>
                  </div>
                </div>
              )}

              {/* LinkedIn */}
              {company.linkedin && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                  <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[15px]">link</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">{t("لينكد إن", "LinkedIn")}</p>
                    <a href={company.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-xs mt-0.5 truncate text-blue-600 dark:text-blue-400 font-semibold hover:underline block" dir="ltr">
                      {company.linkedin}
                    </a>
                  </div>
                </div>
              )}

              {/* Website & LinkedIn edit button */}
              <button type="button" onClick={() => setLinksModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-400/[.28] text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500/50 dark:hover:text-blue-400 text-xs font-bold transition-all">
                <span className="material-symbols-outlined text-[15px]">edit</span>
                {t("تعديل الروابط", "Edit Links")}
              </button>
            </div>
          </Card>
        </div>

        {/* ═══════════════════ RIGHT CONTENT ═══════════════════ */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5 lg:space-y-6 min-w-0">

          {/* Welcome Header */}
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-3xl bg-gradient-to-b from-white/[.02] to-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t("مرحباً بك في بوابة التوظيف", "Welcome to the Recruiter Portal")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t("إدارة ملف شركتك، إعلانات الوظائف، والمتقدمين بكفاءة وذكاء.", "Manage your company profile, job listings, and candidates effectively.")}
                </p>
              </div>
              <div className="flex gap-2.5 shrink-0">
                <Link to="/hr/jobs"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  {t("إدارة الوظائف", "Manage Jobs")}
                </Link>
                <Link to="/hr/candidates"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98]">
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  {t("عرض المتقدمين", "View Candidates")}
                </Link>
              </div>
            </div>
          </Card>

          {/* Tab Bar */}
          <TabBar active={activeTab} onChange={setActiveTab} counts={tabCounts} tabs={TABS} />

          {/* ═══════════════ Tab Content ═══════════════ */}

          {/* ─── Tab: Company Info (Editable) ─── */}
          {activeTab === "companyInfo" && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-3xl bg-gradient-to-b from-white/[.02] to-transparent">
              <SectionCard title={t("معلومات المؤسسة", "Company Information")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">

                  {/* Industry — editable via modal */}
                  <div className="flex flex-col p-3 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t("مجال العمل", "Industry")}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`flex-1 min-w-0 truncate text-sm font-bold ${company.industry ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500 italic"}`}>
                        {company.industry || "—"}
                      </span>
                      <button type="button" onClick={() => setIndustryModalOpen(true)}
                        className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                      </button>
                    </div>
                  </div>

                  {/* Company Size — editable via modal */}
                  <div className="flex flex-col p-3 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t("حجم الشركة", "Company Size")}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`flex-1 min-w-0 truncate text-sm font-bold ${company.companySize ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500 italic"}`}>
                        {company.companySize || "—"}
                      </span>
                      <button type="button" onClick={() => setCompanySizeModalOpen(true)}
                        className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                      </button>
                    </div>
                  </div>

                  {/* Website — editable via links modal */}
                  <div className="flex flex-col p-3 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t("الموقع الإلكتروني", "Website")}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer"
                          className="flex-1 min-w-0 font-bold text-blue-600 dark:text-blue-400 hover:underline truncate text-sm" dir="ltr">
                          {company.website}
                        </a>
                      ) : (
                        <span className="flex-1 min-w-0 truncate text-sm font-bold text-slate-400 dark:text-slate-500 italic">—</span>
                      )}
                      <button type="button" onClick={() => setLinksModalOpen(true)}
                        className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                      </button>
                    </div>
                  </div>

                  {/* LinkedIn — editable via links modal */}
                  <div className="flex flex-col p-3 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("لينكد إن", "LinkedIn")}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {company.linkedin ? (
                        <a href={company.linkedin} target="_blank" rel="noopener noreferrer"
                          className="flex-1 min-w-0 font-bold text-blue-600 dark:text-blue-400 hover:underline truncate text-sm" dir="ltr">
                          {company.linkedin}
                        </a>
                      ) : (
                        <span className="flex-1 min-w-0 truncate text-sm font-bold text-slate-400 dark:text-slate-500 italic">—</span>
                      )}
                      <button type="button" onClick={() => setLinksModalOpen(true)}
                        className="shrink-0 p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors">
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company Description */}
                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-400/[.14]">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      {t("نبذة عن الشركة", "Company Description")}
                    </h4>
                    <button type="button" onClick={() => setDescModalOpen(true)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shrink-0">
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110">
                        {company.companyDescription ? "edit" : "add"}
                      </span>
                      <span className="text-xs font-bold">
                        {company.companyDescription ? t("تعديل", "Edit") : t("إضافة", "Add")}
                      </span>
                    </button>
                  </div>
                  {company.companyDescription ? (
                    <ExpandableText
                      text={company.companyDescription}
                      lines={3}
                      className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl whitespace-pre-wrap"
                    />
                  ) : (
                    <EmptyState icon="info" message={t("لم تتم إضافة وصف للشركة بعد.", "No company description added yet.")} />
                  )}
                </div>

                {/* Member Since */}
                {company.createdAt && (
                  <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-400/[.14]">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {t("عضو منذ", "Member since")}{" "}
                      {new Date(company.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </SectionCard>
            </Card>
          )}

          {/* ─── Tab: Active Jobs ─── */}
          {activeTab === "activeJobs" && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-3xl bg-gradient-to-b from-white/[.02] to-transparent">
              <SectionCard title={t("الوظائف الشاغرة النشطة", "Active Job Openings")}>
                {jobs.length > 0 ? (
                  <Timeline>
                    {jobs.map((job, idx) => (
                      <TimelineItem
                        key={job.id}
                        color="bg-blue-500"
                        title={job.title}
                        subtitle={`${job.cityName || job.countryName || ""} · ${getEmploymentTypeLabel(job.employmentType, isRtl)}`}
                        date={job.minYearsOfExperience > 0
                          ? t(`${job.minYearsOfExperience}+ سنوات خبرة`, `${job.minYearsOfExperience}+ yrs exp`)
                          : t("لا تشترط خبرة", "No experience required")
                        }
                        isLast={idx === jobs.length - 1}
                      >
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <Pill tone={job.workModel === "Remote" ? "green" : job.workModel === "Hybrid" ? "amber" : "blue"} sizeClass="text-[10px]">
                            {getWorkModelLabel(job.workModel, isRtl)}
                          </Pill>
                          {job.candidateCount > 0 && (
                            <Pill tone="blue" sizeClass="text-[10px]">
                              {t(`${job.candidateCount} متقدم`, `${job.candidateCount} Matched`)}
                            </Pill>
                          )}
                          {shortlistedCounts[job.id] > 0 && (
                            <Pill tone="green" sizeClass="text-[10px]">
                              {t(`${shortlistedCounts[job.id]} مختصر`, `${shortlistedCounts[job.id]} Shortlisted`)}
                            </Pill>
                          )}
                          {(job.skills || []).slice(0, 2).map((skill) => (
                            <Pill key={skill.id || skill.name} tone="purple" sizeClass="text-[10px]">
                              {skill.name}
                            </Pill>
                          ))}
                          {(job.skills || []).length > 2 && (
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              +{(job.skills || []).length - 2}
                            </span>
                          )}
                          <Link
                            to={`/hr/candidates?jobId=${job.id}`}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 ms-2"
                          >
                            {t("عرض المتقدمين", "View Candidates")}
                            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                          </Link>
                        </div>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <EmptyState
                    icon="work_history"
                    message={t("لا توجد وظائف معلنة حالياً. ابدأ بإنشاء وظيفة جديدة.", "No active jobs advertised. Start by creating a new job.")}
                  />
                )}
              </SectionCard>
            </Card>
          )}

        </div>
      </div>

      {/* Modals */}
      <CompanyLinksModal
        open={linksModalOpen}
        onClose={() => setLinksModalOpen(false)}
        initialData={company}
        saving={savingModal}
        onSubmit={handleLinksSave}
      />
      <CompanyDescriptionModal
        open={descModalOpen}
        onClose={() => setDescModalOpen(false)}
        initialData={company}
        saving={savingModal}
        onSubmit={handleDescSave}
      />
      <IndustryModal
        open={industryModalOpen}
        onClose={() => setIndustryModalOpen(false)}
        initialData={company}
        saving={savingModal}
        onSubmit={handleIndustrySave}
      />
      <CompanySizeModal
        open={companySizeModalOpen}
        onClose={() => setCompanySizeModalOpen(false)}
        initialData={company}
        saving={savingModal}
        onSubmit={handleCompanySizeSave}
      />

      <p className="sub text-center py-4">© {new Date().getFullYear()} Job Intel — {t("لوحة تحكم الشركة", "Company Portal Dashboard")}</p>
    </div>
  );
}
