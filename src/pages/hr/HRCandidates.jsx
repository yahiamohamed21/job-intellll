import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMatchedCandidates, getShortlistedCandidates, getMyJobs, refreshCandidates } from "../../api/recruiterCandidateService.js";
import { extractError } from "../../utils/extractError.js";

import { Card } from "../../Components/ui/Card";
import { Pill } from "../../Components/ui/Pill";
import { EmptyState } from "../../Components/ui/EmptyState";

/* ─── Match score ring (small, used in cards) ─── */
function MatchScoreRing({ score, size = 48 }) {
  const radius = (size - 8) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
        strokeWidth={4} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.22,.68,0,1.2)" }}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" fill={color} fontSize={size * 0.25} fontWeight={800}>
        {score}%
      </text>
    </svg>
  );
}

/* ─── Stat card (used in candidate cards) ─── */
function StatCard({ icon, label, value, color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Candidate card (list item) ─── */
const CandidateCard = React.memo(function CandidateCard({ candidate, onNavigate, t }) {
  const {
    jobSeekerId, candidateId, id, fullName, jobTitle, matchScore, bio,
    countryName, cityName, yearsOfExperience, profilePictureUrl,
    assessmentScore, matchedSkills, missingSkills, aiReasoning, isShortlisted, isAssessed
  } = candidate;

  const [isAiExpanded, setIsAiExpanded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  // Safely resolve the ID depending on the API schema returned
  const targetId = jobSeekerId || candidateId || id;

  // Reset imgError when the picture URL changes
  React.useEffect(() => {
    setImgError(false);
  }, [profilePictureUrl]);

  const scoreTone = matchScore >= 80 ? "emerald" : matchScore >= 60 ? "amber" : "red";

  const location = [cityName, countryName].filter(Boolean).join(", ");
  const experienceText = yearsOfExperience ? `${yearsOfExperience} ${t("hrCandidates.labels.years", "Yrs")}` : "";

  // Resolve proper full URL for the avatar if it's a relative path
  let picUrl = profilePictureUrl;
  if (picUrl && picUrl.startsWith("/")) {
    picUrl = `${import.meta.env.VITE_API_URL || ""}${picUrl}`;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(targetId)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate(targetId); } }}
      className="group cursor-pointer relative bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-[24px] p-6 sm:p-7 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.08)] transition-all duration-300 flex flex-col gap-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-[#0a1020]"
    >

      {/* 1. Top Section: Identity & Actions */}
      <div className="flex justify-between items-start gap-4 z-10">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-[20px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl shrink-0 shadow-lg shadow-blue-500/20 overflow-hidden ring-[4px] ring-white dark:ring-[#0a1020] transition-transform duration-300 group-hover:scale-[1.02] group-hover:-translate-y-0.5">
            {picUrl && !imgError ? (
              <img src={picUrl} alt={fullName} className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              fullName?.charAt(0) || "?"
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-[17px] font-extrabold text-slate-800 dark:text-white leading-tight truncate" title={fullName}>{fullName}</h4>
              {isShortlisted && (
                <span className="material-symbols-outlined text-[18px] text-blue-500 drop-shadow-sm" title={t("hrCandidates.labels.shortlisted", "Shortlisted")} style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              )}
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 font-bold mb-1 line-clamp-1">{jobTitle}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">
              {location && (
                <span className="flex items-center gap-1 line-clamp-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {location}
                </span>
              )}
            </div>

            {/* Compact Horizontal Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Match Badge */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] border shadow-sm ${scoreTone === "emerald" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                scoreTone === "amber" ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400" :
                  "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
                }`}>
                <span className="material-symbols-outlined text-[14px]">radar</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest">{t("hrCandidates.labels.matchPrefix", "MATCH")} {Math.round(matchScore)}%</span>
              </div>

              {/* Experience Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-[14px] text-blue-500">work</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest">{experienceText || "-"}</span>
              </div>

              {/* Technical / Not Assessed Badge */}
              {isAssessed ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-[14px] text-amber-500">workspace_premium</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">{t("hrCandidates.labels.tech", "Tech")} {Math.round(assessmentScore)}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-700/30 shadow-sm" title={t("hrCandidates.labels.notAssessedTitle", "This candidate has not completed the technical assessment")}>
                  <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500" style={{ fontVariationSettings: "'FILL' 0" }}>quiz</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t("hrCandidates.labels.notAssessed", "Not Assessed")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 hidden sm:block">
          <div className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-700/80 text-[11.5px] sm:text-[12.5px] font-bold text-slate-600 dark:text-slate-300 group-hover:border-blue-300 dark:group-hover:border-blue-500/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 hover:!bg-blue-600 hover:!border-blue-600 hover:!text-white hover:shadow-[0_8px_20px_-4px_rgba(59,130,246,0.4)] transition-all duration-300">
            {t("hrCandidates.labels.viewProfile", "View Profile")}
            <span className="material-symbols-outlined text-[14px] sm:text-[16px] rtl:rotate-180">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* Subtle Horizontal Divider */}
      <hr className="border-slate-200/50 dark:border-slate-700/40 border-dashed z-10 my-1 lg:my-0" />

      {/* 2. Bottom Section: AI Insights inner pane spanning full width */}
      <div className="w-full flex flex-col justify-center bg-slate-50/80 dark:bg-[#0c1424]/90 backdrop-blur-sm rounded-[20px] p-4 lg:p-5 border border-slate-200/80 dark:border-slate-700/50 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)] group-hover:border-blue-300 dark:group-hover:border-blue-500/30 group-hover:shadow-[0_8px_24px_-4px_rgba(59,130,246,0.1)] transition-all duration-300 z-10">
        {/* AI Summary */}
        {(aiReasoning || bio) && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-[13px]">
                <span className="material-symbols-outlined text-[14px] text-purple-500">auto_awesome</span>
                {t("hrCandidates.labels.aiSummary", "AI Insight:")}
              </span>
            </div>
            <p className={`text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed italic ${!isAiExpanded ? "line-clamp-3 sm:line-clamp-none" : ""}`}>
              "{aiReasoning || bio}"
            </p>
            <div className="sm:hidden mt-2 flex justify-start">
              <button
                onClick={(e) => { e.stopPropagation(); setIsAiExpanded(!isAiExpanded); }}
                className="flex items-center gap-1 text-[11.5px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {isAiExpanded ? t("hrCandidates.labels.showLess", "Show less") : t("hrCandidates.labels.showMore", "Show more")}
                <span className="material-symbols-outlined text-[14px]">
                  {isAiExpanded ? "expand_less" : "expand_more"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Skills Section */}
        <div className="flex flex-col gap-3.5 mt-auto">
          {matchedSkills?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[14px] text-emerald-500" style={{ fontVariationSettings: "'FILL' 0" }}>check_circle</span>
                <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">{t("hrCandidates.labels.matchedSkills", "Top Matched Skills")}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {matchedSkills.slice(0, 6).map((s, i) => (
                  <span key={`match-${i}`} className="px-2 py-1 bg-emerald-500/[0.08] border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-bold rounded-md whitespace-nowrap">
                    {s}
                  </span>
                ))}
                {matchedSkills.length > 6 && (
                  <span className="px-2 py-1 text-emerald-600/60 dark:text-emerald-400/60 text-[10px] uppercase tracking-wider font-bold whitespace-nowrap">
                    +{matchedSkills.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}

          {missingSkills?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[14px] text-rose-500" style={{ fontVariationSettings: "'FILL' 0" }}>cancel</span>
                <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">{t("hrCandidates.labels.missingSkills", "Missing Skills")}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {missingSkills.slice(0, 5).map((s, i) => (
                  <span key={`miss-${i}`} className="px-2 py-1 bg-rose-500/[0.08] border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] uppercase tracking-wider font-bold rounded-md whitespace-nowrap">
                    {s}
                  </span>
                ))}
                {missingSkills.length > 5 && (
                  <span className="px-2 py-1 text-rose-500/60 dark:text-rose-400/60 text-[10px] uppercase tracking-wider font-bold whitespace-nowrap">
                    +{missingSkills.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
});




/* ─── Skeleton loader for candidate cards ─── */
function CandidateCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-800/[.6] rounded-[24px] lg:rounded-[28px] p-5 sm:p-6 flex flex-col gap-5 lg:gap-6 animate-pulse">
      {/* 1. Identity & Badges */}
      <div className="flex justify-between items-start gap-4 z-10">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-[20px] bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-1" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-2" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
            </div>
          </div>
        </div>
        <div className="shrink-0 hidden sm:block">
          <div className="h-8 sm:h-9 w-24 sm:w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* Divider */}
      <hr className="border-slate-200/80 dark:border-slate-800/80 border-dashed z-10 my-1 lg:my-0" />

      {/* 2. AI Insights */}
      <div className="w-full flex flex-col justify-center bg-slate-50/80 dark:bg-[#0c1424]/90 rounded-[20px] p-4 lg:p-5 border border-slate-200/80 dark:border-slate-700/50 z-10">
        <div className="flex gap-3 mb-4">
          <div className="w-1 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
        </div>
        <div className="flex items-center gap-5 mt-auto">
          <div className="flex items-center gap-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-8 shrink-0" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-8 shrink-0" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-16" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function HRCandidates() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  /* ─── State ─── */
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get("jobId") || "");
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState("");
  const activeTab = searchParams.get("tab") === "shortlisted" ? "shortlisted" : "matched";
  const setActiveTab = (tab) => {
    setSearchParams((prev) => { prev.set("tab", tab); return prev; }, { replace: true });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [debouncedJobSearch, setDebouncedJobSearch] = useState("");
  const [sortBy, setSortBy] = useState("matchScore");
  const [sortDir, setSortDir] = useState("desc");
  const [showOnlyAssessed, setShowOnlyAssessed] = useState(false);

  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const jobDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(event.target)) {
        setIsJobDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedJob = useMemo(() => jobs.find(j => String(j.id) === String(selectedJobId)), [jobs, selectedJobId]);

  const abortRef = useRef(null);

  /* ─── Debounce Job Search ─── */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedJobSearch(jobSearchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [jobSearchQuery]);

  /* ─── Debounce Candidate Search ─── */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  /* ─── Load jobs when search changes ─── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setJobsLoading(true);
        const res = await getMyJobs(1, 50, true, debouncedJobSearch);
        if (cancelled) return;
        const jobsData = res?.data?.jobs || res?.data || [];
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch {
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setJobsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedJobSearch, i18n.language]);

  /* ─── Load candidates when job is selected ─── */
  const loadCandidates = useCallback(async (jobId, tab) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setCandidatesLoading(true);
      setCandidatesError("");

      const res = tab === "shortlisted"
        ? await getShortlistedCandidates(jobId, { signal: controller.signal })
        : await getMatchedCandidates(jobId, 20, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const list = res?.data?.candidates || res?.data || [];
      setCandidates(Array.isArray(list) ? list : []);
    } catch (err) {
      if (!controller.signal.aborted) {
        setCandidatesError(extractError(err));
      }
    } finally {
      if (!controller.signal.aborted) setCandidatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadCandidates(selectedJobId, activeTab);
      if (searchParams.get("jobId") !== selectedJobId) {
        setSearchParams((prev) => { prev.set("jobId", selectedJobId); return prev; }, { replace: true });
      }
    } else {
      setCandidates([]);
      if (searchParams.has("jobId")) {
        setSearchParams((prev) => { prev.delete("jobId"); return prev; }, { replace: true });
      }
    }
  }, [selectedJobId, activeTab, loadCandidates, searchParams, setSearchParams, i18n.language]);

  /* ─── Filter + sort ─── */
  const filteredCandidates = useMemo(() => {
    let list = [...candidates];
    if (showOnlyAssessed) {
      list = list.filter((c) => c.isAssessed);
    }
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      list = list.filter((c) =>
        (c.fullName || "").toLowerCase().includes(q) ||
        (c.jobTitle || "").toLowerCase().includes(q) ||
        (c.bio || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return list;
  }, [candidates, debouncedSearchQuery, sortBy, sortDir, showOnlyAssessed]);

  /* ─── Navigate to candidate profile ─── */
  const goToCandidateProfile = useCallback((candidateId) => {
    navigate(`/hr/candidates/${candidateId}?jobId=${selectedJobId}`);
  }, [navigate, selectedJobId]);

  /* ─── Instant refresh: bypass cache and fetch fresh AI recommendations ─── */
  const handleRefresh = useCallback(async () => {
    if (!selectedJobId || isRefreshing) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setIsRefreshing(true);
      setCandidatesError("");
      const res = await refreshCandidates(selectedJobId, 20, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const list = res?.data?.candidates || res?.data || [];
      setCandidates(Array.isArray(list) ? list : []);
    } catch (err) {
      if (!controller.signal.aborted) setCandidatesError(extractError(err));
    } finally {
      if (!controller.signal.aborted) setIsRefreshing(false);
    }
  }, [selectedJobId, isRefreshing]);

  /* ─── Toggle sort ─── */
  const toggleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }, [sortBy]);



  /* ─── Render ─── */
  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-2xl">group_search</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {t("hrCandidates.title")}
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("hrCandidates.subtitle")}</p>
      </div>

      {/* Job selector + filters */}
      <Card className="mb-5">
        <div className="p-5">
          {/* Job selector row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                {t("hrCandidates.filters.selectJob", "Select Job")}
              </label>
              <div className="relative" ref={jobDropdownRef}>
                <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] z-10 pointer-events-none">search</span>
                <input
                  type="text"
                  value={isJobDropdownOpen ? jobSearchQuery : (selectedJob ? `#${selectedJob.id} - ${selectedJob.title || selectedJob.jobTitle}` : (selectedJobId ? `Job #${selectedJobId}` : ""))}
                  onChange={(e) => {
                    setJobSearchQuery(e.target.value);
                    if (!isJobDropdownOpen) setIsJobDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsJobDropdownOpen(true);
                    setJobSearchQuery(""); // Clear search so they can see all jobs or start typing
                  }}
                  placeholder={t("hrCandidates.filters.allJobs", "Search or select a job...")}
                  className="w-full h-11 ps-10 pe-10 rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0c1424] text-sm text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 transition-colors duration-300"
                />
                <span className="material-symbols-outlined absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none z-10">
                  {isJobDropdownOpen ? "expand_less" : "expand_more"}
                </span>

                {isJobDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] max-h-64 overflow-y-auto overflow-x-hidden">
                    {jobsLoading ? (
                      <div className="p-4 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></span>
                        {t("hrCandidates.filters.loading")}
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                        {t("hrCandidates.filters.noJobsFound")}
                      </div>
                    ) : (
                      <div className="py-1">
                        {jobs.map(job => (
                          <div 
                            key={job.id}
                            className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex flex-col transition-colors"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setJobSearchQuery("");
                              setIsJobDropdownOpen(false);
                            }}
                          >
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {job.title || job.jobTitle}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                              {t("hrCandidates.labels.jobId", "Job ID: #")} {job.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search + sort row (visible when job selected) */}
          {selectedJobId && (
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-200 dark:border-slate-400/[.14]" style={{ animation: "fadeInUpTab 0.2s ease-out forwards" }}>
              {/* Search */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hrCandidates.filters.searchPlaceholder")}
                  className="w-full h-10 ps-10 pe-4 rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0c1424] text-sm text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-offset-transparent transition-colors duration-300"
                />
              </div>
              {/* Sort & Filter */}
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab(activeTab === "shortlisted" ? "matched" : "shortlisted")}
                  className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === "shortlisted"
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-400/60 dark:border-blue-500/50 text-blue-600 dark:text-blue-400"
                    : "bg-white dark:bg-[#0c1424] border-slate-200 dark:border-slate-400/[.14] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#101828]"
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: activeTab === "shortlisted" ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                  {t("hrCandidates.filters.shortlisted", "Shortlisted")}
                </button>
                <button
                  onClick={() => setShowOnlyAssessed(!showOnlyAssessed)}
                  className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${showOnlyAssessed
                    ? "bg-amber-50 dark:bg-amber-500/10 border-amber-400/60 dark:border-amber-500/50 text-amber-600 dark:text-amber-400"
                    : "bg-white dark:bg-[#0c1424] border-slate-200 dark:border-slate-400/[.14] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#101828]"
                    }`}
                  title={t("hrCandidates.filters.onlyAssessedTitle", "Show only candidates who completed the technical assessment")}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: showOnlyAssessed ? "'FILL' 1" : "'FILL' 0" }}>workspace_premium</span>
                  {t("hrCandidates.filters.onlyAssessed", "Assessed Only")}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || activeTab === "shortlisted"}
                  className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${isRefreshing
                    ? "bg-violet-50 dark:bg-violet-500/10 border-violet-400/60 dark:border-violet-500/50 text-violet-600 dark:text-violet-400 cursor-wait"
                    : "bg-white dark:bg-[#0c1424] border-slate-200 dark:border-slate-400/[.14] text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-300 dark:hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-violet-400"
                    }`}
                  title={activeTab === "shortlisted"
                    ? t("hrCandidates.filters.refreshShortlistedDisabled", "Switch to Matched tab to refresh AI recommendations")
                    : t("hrCandidates.filters.refreshTitle", "Bypass cache and fetch fresh AI recommendations instantly")}
                >
                  <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? "animate-spin" : ""}`}>refresh</span>
                  {isRefreshing
                    ? t("hrCandidates.filters.refreshing", "Refreshing...")
                    : t("hrCandidates.filters.refresh", "Refresh")}
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 self-center mx-1 shrink-0 hidden sm:block" />
                <div className="flex flex-1 gap-2 min-w-0">
                  {[
                    { key: "matchScore", label: t("hrCandidates.filters.sortScore", "Match Score") },
                    { key: "assessmentScore", label: t("hrCandidates.filters.sortTechnical", "Technical") },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => toggleSort(key)}
                      className={`flex-1 h-10 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${sortBy === key
                        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
                        : "bg-white dark:bg-[#0c1424] border-slate-200 dark:border-slate-400/[.14] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#101828]"
                        }`}
                    >
                      {label}
                      <span className={`material-symbols-outlined text-[14px] transition-transform ${sortBy === key ? "opacity-100 scale-100" : "opacity-0 scale-50"} ${sortDir === "asc" ? "rotate-180" : ""}`}>
                        arrow_downward
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Candidates list */}
      {selectedJobId ? (
        <div key={`${activeTab}-${selectedJobId}`} style={{ animation: "fadeInUpTab 0.25s ease-out forwards" }}>
          {/* Count */}
          {!candidatesLoading && !candidatesError && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {t("hrCandidates.list.showing", { count: filteredCandidates.length, total: candidates.length })}
              </p>
            </div>
          )}

          {/* Loading */}
          {candidatesLoading && candidates.length === 0 && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <CandidateCardSkeleton key={i} />)}
            </div>
          )}

          {/* Error */}
          {!candidatesLoading && candidatesError && (
            <Card className="p-8">
              <div className="flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-4xl text-red-400 dark:text-red-500 mb-3">error</span>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("hrCandidates.list.error")}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{candidatesError}</p>
                <button
                  onClick={() => loadCandidates(selectedJobId, activeTab)}
                  className="mt-4 h-9 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                >
                  {t("hrCandidates.list.retry")}
                </button>
              </div>
            </Card>
          )}

          {/* Empty (no candidates) */}
          {!candidatesLoading && !candidatesError && candidates.length === 0 && (
            <Card className="p-8">
              <EmptyState variant="page"
                icon={activeTab === "shortlisted" ? "bookmark_border" : "person_search"}
                title={activeTab === "shortlisted" ? t("hrCandidates.list.noShortlisted", "No Shortlisted Candidates") : t("hrCandidates.list.emptyTitle")}
                subtitle={activeTab === "shortlisted" ? t("hrCandidates.list.noShortlistedSubtitle", "You haven't bookmarked any candidates for this job yet.") : t("hrCandidates.list.emptySubtitle")}
              />
            </Card>
          )}

          {/* Empty (search yielded no results) */}
          {!candidatesLoading && !candidatesError && candidates.length > 0 && filteredCandidates.length === 0 && (
            <Card className="p-8">
              <EmptyState variant="page"
                icon="search_off"
                title={t("hrCandidates.list.noResults")}
                subtitle={t("hrCandidates.list.noResultsSubtitle")}
              />
            </Card>
          )}

          {/* Candidate cards */}
          {!candidatesError && filteredCandidates.length > 0 && (
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.candidateId || candidate.jobSeekerId}
                  candidate={candidate}
                  onNavigate={goToCandidateProfile}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* No job selected state */
        <Card className="p-8">
          <EmptyState variant="page"
            icon="work"
            title={t("hrCandidates.empty.title")}
            subtitle={t("hrCandidates.empty.subtitle")}
          />
        </Card>
      )}
    </div>
  );
}
