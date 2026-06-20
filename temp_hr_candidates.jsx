import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMatchedCandidates, getMyJobs } from "../../api/recruiterCandidateService.js";
import { extractError } from "../../utils/extractError.js";

/* ─── Reusable Primitives ─── */
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-3xl shadow-[0_8px_24px_-12px_rgba(2,6,23,0.18)] dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] ${className}`}
  >
    {children}
  </div>
);

const Pill = ({ children, tone = "blue", className = "" }) => {
  const tones = {
    blue: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/30 text-blue-600 dark:text-blue-400",
    slate: "bg-slate-100 dark:bg-[#0c1424] border-slate-200 dark:border-slate-400/[.14] text-slate-600 dark:text-slate-300",
    green: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border whitespace-nowrap ${tones[tone] || tones.blue} ${className}`}
    >
      {children}
    </span>
  );
};

/* ─── Match Score Ring ─── */
function MatchScoreRing({ score, size = 56 }) {
  const radius = (size - 8) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
          strokeWidth={5} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,.68,0,1.2)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-black" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

/* ─── Custom Job Selector Dropdown ─── */
function CustomJobSelector({ jobs, selectedJobId, onSelect, loading, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedJob = jobs.find(j => j.id.toString() === selectedJobId?.toString());
  const label = loading 
    ? t("hrCandidates.filters.loading") 
    : selectedJob 
      ? (selectedJob.title || selectedJob.jobTitle || `Job #${selectedJob.id}`) 
      : t("hrCandidates.filters.allJobs");

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full flex items-center justify-between h-14 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1020] hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all text-left"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("hrCandidates.filters.selectJob")}
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-white truncate">
            {label}
          </span>
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          <button
            className={`w-full text-left px-5 py-3 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors ${!selectedJobId ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5" : "text-slate-700 dark:text-slate-300"}`}
            onClick={() => { onSelect(""); setIsOpen(false); }}
          >
            {t("hrCandidates.filters.allJobs")}
          </button>
          {jobs.map(job => (
            <button
              key={job.id}
              className={`w-full text-left px-5 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-[#0c1424] transition-colors border-t border-slate-100 dark:border-slate-800/50 ${selectedJobId?.toString() === job.id.toString() ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}
              onClick={() => { onSelect(job.id); setIsOpen(false); }}
            >
              {job.title || job.jobTitle || `Job #${job.id}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Premium Candidate Card ─── */
function CandidateCard({ candidate, onNavigate, t }) {
  const { jobSeekerId, fullName, jobTitle, matchScore, bio, profilePictureUrl } = candidate;
  const scoreTone = matchScore >= 80 ? "green" : matchScore >= 60 ? "amber" : "red";
  const statusLabel = matchScore >= 80 ? t("hrCandidates.status.top") : matchScore >= 60 ? t("hrCandidates.status.good") : t("hrCandidates.status.review");

  return (
    <div
      className="group relative bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-3xl p-5 sm:p-6 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-5"
      onClick={() => onNavigate(jobSeekerId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate(jobSeekerId); } }}
    >
      {/* Avatar */}
      <div className="relative shrink-0 self-start sm:self-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border-2 border-white dark:border-[#0a1020] group-hover:scale-105 transition-transform">
          {fullName?.charAt(0) || "?"}
        </div>
        {profilePictureUrl && (
          <img
            src={profilePictureUrl}
            alt={fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover absolute inset-0 border-2 border-white dark:border-[#0a1020] group-hover:scale-105 transition-transform"
          />
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h4 className="text-lg font-extrabold text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {fullName}
          </h4>
          <Pill tone={scoreTone}>{statusLabel}</Pill>
        </div>
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1 truncate">{jobTitle}</p>
        
        {/* Quick Location / Exp */}
        <div className="flex items-center gap-3 mt-2">
          {(candidate.countryName || candidate.cityName) && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-[#0c1424] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {candidate.cityName}{candidate.cityName && candidate.countryName ? ", " : ""}{candidate.countryName}
            </span>
          )}
          {candidate.yearsOfExperience != null && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-[#0c1424] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-[14px]">work</span>
              {candidate.yearsOfExperience} Years
            </span>
          )}
        </div>
        
        {bio && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">{bio}</p>
        )}
      </div>

      {/* Right Side Stats */}
      <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/50 sm:pl-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <MatchScoreRing score={Math.round(matchScore)} size={56} />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">AI Match</p>
          </div>
          {candidate.assessmentScore != null && (
            <div className="text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <span className="text-[14px] font-black text-slate-700 dark:text-white">{Math.round(candidate.assessmentScore)}%</span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Tech Test</p>
            </div>
          )}
        </div>
        <div className="hidden sm:flex self-end items-center gap-1 text-[11px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-4 group-hover:-translate-x-1 duration-300">
          View Profile <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeletons ─── */
function CandidateCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-3xl p-6 animate-pulse flex flex-col sm:flex-row gap-5">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-3 pt-2">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mt-4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
      </div>
      <div className="shrink-0 flex items-center gap-4 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6 pt-4 sm:pt-0">
        <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-[#0c1424] flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">{icon}</span>
      </div>
      <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">{subtitle}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function HRCandidates() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get("jobId") || "");
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("matchScore");
  const [sortDir, setSortDir] = useState("desc");
  const abortRef = useRef(null);

  /* ─── Load Jobs ─── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setJobsLoading(true);
        const res = await getMyJobs(1, 50, true);
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
  }, []);

  /* ─── Load Candidates ─── */
  const loadCandidates = useCallback(async (jobId) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setCandidatesLoading(true);
      setCandidatesError("");
      setCandidates([]);
      const res = await getMatchedCandidates(jobId, 20);
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
      loadCandidates(selectedJobId);
      setSearchParams((prev) => { prev.set("jobId", selectedJobId); return prev; }, { replace: true });
    } else {
      setCandidates([]);
      setSearchParams((prev) => { prev.delete("jobId"); return prev; }, { replace: true });
    }
  }, [selectedJobId, loadCandidates, setSearchParams]);

  /* ─── Filter & Sort ─── */
  const filteredCandidates = useMemo(() => {
    let list = [...candidates];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        (c.fullName || c.candidateName || "").toLowerCase().includes(q) ||
        (c.jobTitle || "").toLowerCase().includes(q) ||
        (c.bio || c.summary || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const aVal = a[sortBy] ?? a.assessmentScore ?? 0;
      const bVal = b[sortBy] ?? b.assessmentScore ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return list;
  }, [candidates, searchQuery, sortBy, sortDir]);

  const goToCandidateProfile = useCallback((candidateId) => {
    navigate(`/hr/candidates/${candidateId}?jobId=${selectedJobId}`);
  }, [navigate, selectedJobId]);

  const toggleSort = useCallback((field) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortDir((d) => d === "desc" ? "asc" : "desc");
        return field;
      }
      setSortDir("desc");
      return field;
    });
  }, []);

  /* ─── Render ─── */
  return (
    <div className="w-full max-w-5xl mx-auto pb-20">
      
      {/* ─── Page Header ─── */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-[24px]">group_search</span>
          </div>
          {t("hrCandidates.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          {t("hrCandidates.subtitle")}
        </p>
      </div>

      {/* ─── Top Controls ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Left: Job Selector */}
        <div className="lg:col-span-5">
          <CustomJobSelector 
            jobs={jobs} 
            selectedJobId={selectedJobId} 
            onSelect={setSelectedJobId} 
            loading={jobsLoading} 
            t={t} 
          />
        </div>
        
        {/* Right: Search & Sort (Only if job is selected) */}
        {selectedJobId && (
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("hrCandidates.filters.searchPlaceholder")}
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1020] text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm hover:shadow-md"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => toggleSort("matchScore")}
                className={`h-14 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-1 sm:flex-none ${
                  sortBy === "matchScore"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-blue-600"
                    : "bg-white dark:bg-[#0a1020] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0c1424]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                {t("hrCandidates.filters.sortScore")}
                {sortBy === "matchScore" && (
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`}>arrow_downward</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Results Area ─── */}
      <div className="space-y-5">
        {selectedJobId ? (
          <>
            {/* List Header */}
            {!candidatesLoading && !candidatesError && candidates.length > 0 && (
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {filteredCandidates.length} Candidates Found
                </p>
              </div>
            )}

            {/* Loading */}
            {candidatesLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <CandidateCardSkeleton key={i} />)}
              </div>
            )}

            {/* Error */}
            {!candidatesLoading && candidatesError && (
              <Card className="p-10 border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-500/5">
                <div className="flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white">{t("hrCandidates.list.error")}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">{candidatesError}</p>
                  <button
                    onClick={() => loadCandidates(selectedJobId)}
                    className="mt-6 h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:-translate-y-0.5"
                  >
                    {t("hrCandidates.list.retry")}
                  </button>
                </div>
              </Card>
            )}

            {/* Empty State (No Candidates from AI) */}
            {!candidatesLoading && !candidatesError && candidates.length === 0 && (
              <Card className="p-2">
                <EmptyState
                  icon="person_search"
                  title={t("hrCandidates.list.emptyTitle")}
                  subtitle={t("hrCandidates.list.emptySubtitle")}
                />
              </Card>
            )}

            {/* Empty State (Search Filter) */}
            {!candidatesLoading && !candidatesError && candidates.length > 0 && filteredCandidates.length === 0 && (
              <Card className="p-2">
                <EmptyState
                  icon="search_off"
                  title={t("hrCandidates.list.noResults")}
                  subtitle={t("hrCandidates.list.noResultsSubtitle")}
                />
              </Card>
            )}

            {/* Candidate List */}
            {!candidatesLoading && !candidatesError && filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.candidateId || candidate.jobSeekerId}
                candidate={candidate}
                onNavigate={goToCandidateProfile}
                t={t}
              />
            ))}
          </>
        ) : (
          /* Initial State (No Job Selected) */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-32 h-32 mb-8 relative">
              <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full animate-ping opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 border-4 border-white dark:border-[#0a1020]">
                <span className="material-symbols-outlined text-white text-5xl">work</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Select a Job to Discover Talent</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md">
              Choose an active job posting from the dropdown above to view AI-matched candidates ranked by compatibility.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
