import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCandidateProfile, recordProfileView, toggleShortlist, contactCandidate, downloadCandidateResume } from "../../api/recruiterCandidateService.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faGithub, faBehance, faDribbble } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import ExpandableText from "../../Components/ui/ExpandableText";
import Modal from "../../Components/Modal.jsx";
import { toastSuccess, alertError } from "../../lib/alerts.js";

import { Card } from "../../Components/ui/Card";
import { Pill } from "../../Components/ui/Pill";
import { SectionCard } from "../../Components/ui/SectionCard";
import { EmptyState } from "../../Components/ui/EmptyState";
import { Timeline, TimelineItem } from "../../Components/ui/Timeline";
import { TabBar } from "../../Components/ui/TabBar";

/* ─── Date formatting helpers (same as Dashboard.jsx) ─── */
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

/* ─── StatCard from Dashboard ─── */
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

/* ─── Tab definitions ─── */
const TABS = [
  { id: "overview", labelKey: "hrProfile.tabs.overview", icon: "person" },
  { id: "experience", labelKey: "hrProfile.tabs.experience", icon: "work" },
  { id: "education", labelKey: "hrProfile.tabs.education", icon: "school" },
  { id: "projects", labelKey: "hrProfile.tabs.projects", icon: "rocket_launch" },
  { id: "skills", labelKey: "hrProfile.tabs.skills", icon: "psychology" },
];

/* ─── Tab: Overview (Flat Dashboard Layout) ─── */
function OverviewTab({ profile, t }) {
  const languages = [];
  if (profile.firstLanguage) {
    languages.push({ name: profile.firstLanguage, proficiency: profile.firstLanguageProficiency });
  }
  if (profile.secondLanguage) {
    languages.push({ name: profile.secondLanguage, proficiency: profile.secondLanguageProficiency });
  }

  return (
    <div className="space-y-8 mt-2 px-1">
      {/* Bio */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">
          {t("hrProfile.overview.about")}
        </h3>
        {profile.bio ? (
          <ExpandableText text={profile.bio} lines={4} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl whitespace-pre-wrap" />
        ) : (
          <EmptyState icon="info" message={t("hrProfile.empty.noBio")} />
        )}
      </div>

      {/* Social Links */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-400/[.14]">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
          {t("hrProfile.sidebar.social", "Social Profiles")}
        </h3>
        {profile.socialAccounts && Object.entries(profile.socialAccounts).some(([key, url]) => url && ['linkedIn', 'github', 'behance', 'dribbble', 'personalWebsite'].includes(key)) ? (
          <div className="flex flex-wrap gap-3">
            {Object.entries(profile.socialAccounts).map(([key, url]) => {
              if (!url || !['linkedIn', 'github', 'behance', 'dribbble', 'personalWebsite'].includes(key)) return null;
              const icons = { linkedIn: faLinkedin, github: faGithub, behance: faBehance, dribbble: faDribbble, personalWebsite: faGlobe };
              const labels = { linkedIn: t("hrProfile.social.linkedIn", "LinkedIn"), github: t("hrProfile.social.github", "GitHub"), behance: t("hrProfile.social.behance", "Behance"), dribbble: t("hrProfile.social.dribbble", "Dribbble"), personalWebsite: t("hrProfile.sidebar.website") };
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all font-semibold shadow-sm"
                >
                  {icons[key] ? (
                    <FontAwesomeIcon icon={icons[key]} className="text-blue-500 text-[18px]" />
                  ) : (
                    <span className="material-symbols-outlined text-blue-500 text-[18px]">link</span>
                  )}
                  {labels[key] || key}
                </a>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="share" message={t("hrProfile.empty.noSocialLinks", "No social profiles linked.")} />
        )}
      </div>

      {/* Languages */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-400/[.14]">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
          {t("hrProfile.tabs.languages")}
        </h3>
        {languages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {languages.map((lang, i) => {
              const getProfPct = (p) => {
                if (!p) return 0;
                const lower = String(p).toLowerCase();
                if (lower.includes('native') || lower.includes('fluent')) return 100;
                if (lower.includes('advanced')) return 80;
                if (lower.includes('intermediate')) return 50;
                if (lower.includes('beginner') || lower.includes('basic')) return 25;
                return 50;
              };
              const pct = getProfPct(lang.proficiency);
              return (
                <div key={i} className="flex flex-col justify-center gap-2.5 bg-slate-50 dark:bg-[#0c1424] rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-400/[.14]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700 dark:text-white">{lang.name}</p>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang.proficiency ? t(`modalLanguage.proficiency.${lang.proficiency}`, lang.proficiency) : ""}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="translate" message={t("hrProfile.empty.noLanguage", "No languages added")} />
        )}
      </div>
    </div>
  );
}

/* ─── Tab: Experience ─── */
function ExperienceTab({ experiences, t, lng }) {
  if (!experiences?.length) {
    return (
      <SectionCard title={t("hrProfile.tabs.experience")}>
        <EmptyState icon="work_history" message={t("hrProfile.empty.noExperience")} />
      </SectionCard>
    );
  }
  return (
    <SectionCard title={t("hrProfile.tabs.experience")}>
      <Timeline>
        {experiences.map((exp, i) => (
          <TimelineItem
            key={exp.id || i}
            color="bg-blue-500"
            title={`${exp.jobTitle}${exp.companyName ? " · " + exp.companyName : ""}`}
            subtitle={[exp.country, exp.city].filter(Boolean).join(", ")}
            date={formatDateRange(exp, lng)}
            isCurrent={Boolean(exp.isCurrent)}
            isLast={i === experiences.length - 1}
          >
            {(exp.employmentType != null || exp.responsibilities) && (
              <div className="mt-2 space-y-2">
                {exp.employmentType != null && (
                  <Pill tone="blue">{t(`modalExperience.employmentType.${exp.employmentType}`, exp.employmentType)}</Pill>
                )}
                {exp.responsibilities && (
                  <ExpandableText text={exp.responsibilities} lines={2} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line break-words" />
                )}
              </div>
            )}
          </TimelineItem>
        ))}
      </Timeline>
    </SectionCard>
  );
}

/* ─── Tab: Education ─── */
function EducationTab({ educations, t, lng }) {
  if (!educations?.length) {
    return (
      <SectionCard title={t("hrProfile.tabs.education")}>
        <EmptyState icon="school" message={t("hrProfile.empty.noEducation")} />
      </SectionCard>
    );
  }
  return (
    <SectionCard title={t("hrProfile.tabs.education")}>
      <Timeline>
        {educations.map((edu, i) => (
          <TimelineItem
            key={edu.id || i}
            color="bg-purple-500"
            title={edu.institution}
            subtitle={`${edu.degree ? t(`modalEducation.degreeOptions.${edu.degree}`, edu.degree) : ""}${edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}`}
            date={formatDateRange(edu, lng)}
            isCurrent={Boolean(edu.isCurrent)}
            isLast={i === educations.length - 1}
          >
            {edu.gradeOrGPA && (
              <div className="mt-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t("hrProfile.overview.gpa", "GPA")}: {edu.gradeOrGPA}
                </span>
              </div>
            )}
          </TimelineItem>
        ))}
      </Timeline>
    </SectionCard>
  );
}

/* ─── Tab: Skills ─── */
function SkillsTab({ skills, t }) {
  if (!skills?.length) {
    return (
      <SectionCard title={t("hrProfile.tabs.skills")}>
        <EmptyState icon="psychology" message={t("hrProfile.empty.noSkills")} />
      </SectionCard>
    );
  }
  return (
    <SectionCard title={t("hrProfile.tabs.skills")}>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <Pill key={i} tone="blue">{skill.name}</Pill>
        ))}
      </div>
    </SectionCard>
  );
}

/* ─── Project Item with Tech Badge Toggle ─── */
function ProjectItem({ proj, t }) {
  const [expandedTechs, setExpandedTechs] = useState(false);

  const techs = (proj.technologiesUsed || "")
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);

  return (
    <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug truncate">
          {proj.title}
        </h3>
        {proj.projectLink && (
          <a
            href={proj.projectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0"
            title={t("hrProfile.actions.viewProject")}
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
        )}
      </div>
      {proj.description && (
        <div className="mb-2">
          <ExpandableText text={proj.description} lines={2} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line break-words" />
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {techs.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {(expandedTechs ? techs : techs.slice(0, 4)).map((tech, j) => (
                <span
                  key={j}
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
          </div>
        )}
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

/* ─── Tab: Projects ─── */
function ProjectsTab({ projects, t }) {
  if (!projects?.length) {
    return (
      <SectionCard title={t("hrProfile.tabs.projects")}>
        <EmptyState icon="rocket_launch" message={t("hrProfile.empty.noProjects")} />
      </SectionCard>
    );
  }
  return (
    <SectionCard title={t("hrProfile.tabs.projects")}>
      <div className="space-y-3">
        {projects.map((proj, i) => (
          <ProjectItem key={i} proj={proj} t={t} />
        ))}
      </div>
    </SectionCard>
  );
}



/* ─── Skeleton (mirrors Dashboard.jsx loading state) ─── */
function ProfileSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-4 min-w-0">
          <Card className="p-5 sm:p-6 space-y-4 rounded-3xl sticky top-24 bg-white dark:bg-[#0a1020]">
            <div className="flex justify-center">
              <div className="size-20 rounded-full bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
            </div>
            <div className="h-3 w-32 mx-auto rounded bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
            <div className="h-9 w-full rounded-xl bg-slate-100 dark:bg-[#0c1424] animate-pulse mt-4" />
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-4" />
            <div className="space-y-3">
              <div className="h-10 bg-slate-100 dark:bg-[#0c1424] rounded-xl w-full animate-pulse" />
              <div className="h-10 bg-slate-100 dark:bg-[#0c1424] rounded-xl w-full animate-pulse" />
              <div className="h-10 bg-slate-100 dark:bg-[#0c1424] rounded-xl w-full animate-pulse" />
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-4" />
            <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
          </Card>
        </div>
        <div className="lg:col-span-8 space-y-5 lg:space-y-6">
          <Card className="p-5 sm:p-6 rounded-[23px] bg-white dark:bg-[#0a1020]">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
              <div className="h-6 w-48 rounded bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-4 bg-slate-100 dark:bg-[#0c1424] rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-100 dark:bg-[#0c1424] rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-100 dark:bg-[#0c1424] rounded w-3/4 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="h-24 rounded-2xl bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
              <div className="h-24 rounded-2xl bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
            </div>
          </Card>

          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 flex-1 rounded-xl bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
            ))}
          </div>

          <Card className="p-5 sm:p-6 rounded-3xl space-y-4 bg-white dark:bg-[#0a1020]">
            <div className="h-6 w-32 rounded bg-slate-100 dark:bg-[#0c1424] animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 dark:bg-[#0c1424] rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-100 dark:bg-[#0c1424] rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-100 dark:bg-[#0c1424] rounded w-2/3 animate-pulse" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function HRCandidateProfile() {
  const { t, i18n } = useTranslation();
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [flagError, setFlagError] = useState(false);

  // Reset imgError when the profile picture URL changes so that a
  // different candidate's picture (or a refreshed URL) always renders.
  useEffect(() => {
    setImgError(false);
  }, [profile?.profilePictureUrl]);
  const [openingResume, setOpeningResume] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);

  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSending, setContactSending] = useState(false);



  /* ─── Fetch profile ─── */
  useEffect(() => {
    if (!jobId || !candidateId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getCandidateProfile(jobId, candidateId);
        if (cancelled) return;
        setProfile(res?.data || null);
        setIsShortlisted(res?.data?.isShortlisted || false);
        // Record view (fire-and-forget)
        recordProfileView(jobId, candidateId).catch((err) => {
          console.warn("Failed to record profile view:", err);
        });
      } catch {
        if (!cancelled) setError(t("hrProfile.error.loading"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [jobId, candidateId, t]);

  const handleToggleShortlist = async () => {
    if (!jobId || !candidateId || isToggling) return;
    try {
      setIsToggling(true);
      setIsShortlisted(prev => !prev);
      await toggleShortlist(jobId, candidateId);
    } catch {
      setIsShortlisted(prev => !prev); // revert on error
    } finally {
      setIsToggling(false);
    }
  };

  const handleContactSend = useCallback(async () => {
    if (!jobId || !candidateId || !contactMessage.trim() || contactSending) return;
    try {
      setContactSending(true);
      await contactCandidate(jobId, candidateId, contactMessage.trim());
      toastSuccess(t("hrProfile.contactModal.success"));
      setContactModalOpen(false);
      setContactMessage("");
    } catch {
      alertError(t("hrProfile.contactModal.title"), t("hrProfile.contactModal.error"));
    } finally {
      setContactSending(false);
    }
  }, [jobId, candidateId, contactMessage, contactSending, t]);

  const onResumeDownload = useCallback(async () => {
    if (!profile?.resumeFileName) return;
    setDownloadingResume(true);
    try {
      const res = await downloadCandidateResume(jobId, candidateId);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = profile.resumeFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toastSuccess(t("hrProfile.resumeDownloaded"));
    } catch (err) {
      alertError(t("hrProfile.resumeDownloadFailed"), extractError(err));
    } finally {
      setDownloadingResume(false);
    }
  }, [jobId, candidateId, profile?.resumeFileName, t]);

  const onResumeOpen = useCallback(async () => {
    if (!profile?.resumeFileName || openingResume) return;
    setOpeningResume(true);
    let blobUrl = null;
    try {
      const res = await downloadCandidateResume(jobId, candidateId);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      }, 60_000);
    } catch (err) {
      alertError(t("hrProfile.resumeOpenFailed"), extractError(err));
    } finally {
      setOpeningResume(false);
    }
  }, [jobId, candidateId, profile?.resumeFileName, openingResume, t]);

  /* ─── Tab counts ─── */
  const tabCounts = useMemo(() => ({
    overview: 1,
    experience: profile?.experiences?.length || 0,
    education: profile?.educations?.length || 0,
    skills: profile?.skills?.length || 0,
    projects: profile?.projects?.length || 0,
  }), [profile]);

  /* ─── Validate Context ─── */
  if (!jobId || !candidateId) {
    return (
      <div className="max-w-5xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/hr/candidates")}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t("hrProfile.back", "Back")}
          </button>
        </div>
        <Card className="p-8">
          <EmptyState 
            variant="page" 
            icon="error" 
            title={t("hrProfile.error.invalidContext", "Invalid Context")} 
            subtitle={t("hrProfile.error.invalidContextDesc", "A Job ID and Candidate ID are required to view this profile.")} 
          />
        </Card>
      </div>
    );
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <>
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t("hrProfile.back")}
          </button>
        </div>
        <ProfileSkeleton />
      </>
    );
  }

  /* ─── Error state ─── */
  if (error || !profile) {
    return (
      <>
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t("hrProfile.back")}
          </button>
        </div>
        <Card className="p-8">
          <div className="flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 dark:text-red-500 mb-3">error</span>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{error || t("hrProfile.error.notFound")}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 h-9 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
            >
              {t("hrProfile.back")}
            </button>
          </div>
        </Card>
      </>
    );
  }

  /* ─── Render ─── */

  return (
    <>
      {/* Header Actions */}
      <div className="mb-5 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t("hrProfile.back")}
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ═══ LEFT: Profile Sidebar ═══ */}
          <div className="lg:col-span-4 min-w-0">
            <Card className="p-5 sm:p-6 bg-white dark:bg-[#0a1020] dark:border-slate-400/[.14] rounded-3xl bg-gradient-to-b from-white/[.02] to-transparent sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="size-20 rounded-full overflow-hidden border-[3px] border-white dark:border-[#0a1020] bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                  {profile.profilePictureUrl && !imgError ? (
                    <img src={profile.profilePictureUrl} alt={profile.fullName || ""} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                  ) : (
                    <span className="text-2xl font-extrabold text-slate-600 dark:text-slate-200">
                      {profile.fullName?.charAt(0) || "?"}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-base font-extrabold text-slate-800 dark:text-white truncate max-w-full">
                  {profile.fullName}
                </h3>
                <div className="mt-1.5">
                  <Pill tone="blue">
                    <span className="material-symbols-outlined text-[12px]">bolt</span>
                    {profile.jobTitle || t("hrProfile.sidebar.jobTitleFallback", "Job Title")}
                  </Pill>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="mt-5 w-full">
                {profile.email ? (
                  <button
                    onClick={() => {
                      setContactMessage("");
                      setContactModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    {t("hrProfile.actions.contact")}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-bold text-sm shadow-sm cursor-not-allowed"
                    title={t("hrProfile.actions.noEmail", "No email available")}
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    {t("hrProfile.actions.contact")}
                  </button>
                )}
              </div>

              <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />

              {/* Stats */}
              <div className="flex flex-row gap-2">
                <div className="flex-1">
                  <StatCard
                    icon="auto_awesome"
                    value={profile.matchScore ? `${Math.round(profile.matchScore)}%` : "N/A"}
                    label={t("hrProfile.stats.aiMatch", "AI Match")}
                  />
                </div>
                <div className="flex-1">
                  <StatCard
                    icon="work_history"
                    value={profile.yearsOfExperience ? `${profile.yearsOfExperience} ${t("hrProfile.stats.years", "Yrs")}` : t("hrProfile.stats.entry", "Entry")}
                    label={t("hrProfile.stats.experience", "Experience")}
                  />
                </div>
                <div className="flex-1">
                  <StatCard
                    icon="verified"
                    value={profile.assessmentScore ? `${Math.round(profile.assessmentScore)}%` : "N/A"}
                    label={t("hrProfile.stats.testScore", "Test Score")}
                  />
                </div>
              </div>

              <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />

              {/* Contact Info */}
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                {t("hrProfile.sidebar.contact", "Contact Info")}
              </p>
              <div className="space-y-2">
                {/* Email */}
                <div
                  role="button"
                  tabIndex={0}
                  className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] cursor-pointer hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-[#0e1628] transition-all relative overflow-hidden"
                  onClick={() => {
                    if (profile.email) {
                      navigator.clipboard.writeText(profile.email);
                      toastSuccess(t("hrProfile.copied", "Copied to clipboard!"));
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && profile.email) {
                      e.preventDefault();
                      navigator.clipboard.writeText(profile.email);
                      toastSuccess(t("hrProfile.copied", "Copied to clipboard!"));
                    }
                  }}
                  title={profile.email ? t("hrProfile.actions.copy", "Click to copy") : undefined}
                >
                  <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20">
                    <span className="material-symbols-outlined text-[15px]">mail</span>
                  </div>
                  <div className="min-w-0 flex-1 transition-transform group-hover:-translate-x-1 duration-200">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                      {t("hrProfile.sidebar.email", "Email")}
                    </p>
                    <p className="text-xs mt-0.5 truncate text-slate-700 dark:text-slate-200 font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" dir="ltr">
                      {profile.email || t("hrProfile.sidebar.noEmail", "No email on file")}
                    </p>
                  </div>
                  {profile.email && (
                    <div className="absolute end-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 flex items-center h-full top-0">
                      <span className="material-symbols-outlined text-[16px] text-blue-500">content_copy</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div
                  role="button"
                  tabIndex={0}
                  className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] cursor-pointer hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-[#0e1628] transition-all relative overflow-hidden"
                  onClick={() => {
                    if (profile.phoneNumber) {
                      navigator.clipboard.writeText(profile.phoneNumber);
                      toastSuccess(t("hrProfile.copied", "Copied to clipboard!"));
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && profile.phoneNumber) {
                      e.preventDefault();
                      navigator.clipboard.writeText(profile.phoneNumber);
                      toastSuccess(t("hrProfile.copied", "Copied to clipboard!"));
                    }
                  }}
                  title={profile.phoneNumber ? t("hrProfile.actions.copy", "Click to copy") : undefined}
                >
                  <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20">
                    <span className="material-symbols-outlined text-[15px]">call</span>
                  </div>
                  <div className="min-w-0 flex-1 transition-transform group-hover:-translate-x-1 duration-200">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                      {t("hrProfile.sidebar.phone", "Phone")}
                    </p>
                    <p className="text-xs mt-0.5 truncate text-slate-700 dark:text-slate-200 font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" dir="ltr">
                      {profile.phoneNumber || t("hrProfile.sidebar.noPhone", "No phone on file")}
                    </p>
                  </div>
                  {profile.phoneNumber && (
                    <div className="absolute end-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 flex items-center h-full top-0">
                      <span className="material-symbols-outlined text-[16px] text-blue-500">content_copy</span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
                  <div className="size-7 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center overflow-hidden">
                    {profile.countryCode && !flagError ? (
                      <img
                        src={`https://flagcdn.com/w80/${profile.countryCode.toLowerCase()}.png`}
                        alt={profile.country || "flag"}
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
                      {t("hrProfile.sidebar.location", "Location")}
                    </p>
                    <p className="text-xs mt-0.5 truncate text-slate-700 dark:text-slate-200 font-semibold">
                      {[profile.city, profile.country].filter(Boolean).join(", ") || t("hrProfile.sidebar.noLocation", "No location set")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />

              {/* Resume */}
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                {t("hrProfile.sidebar.resume", "Resume / CV")}
              </p>
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] group hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-[#0e1628] transition-all">
                {profile.resumeFileName ? (
                  <button
                    type="button"
                    onClick={onResumeOpen}
                    disabled={openingResume}
                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer text-start"
                    title={t("hrProfile.sidebar.viewResume", "View CV")}
                    aria-label={t("hrProfile.sidebar.viewResume", "View CV")}
                  >
                    <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-[18px] shrink-0">
                      description
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate min-w-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {profile.resumeFileName}
                    </span>
                    {openingResume && (
                      <span className="material-symbols-outlined text-[13px] animate-spin shrink-0 text-blue-500">
                        progress_activity
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 min-w-0 flex-1 cursor-default">
                    <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-[18px] shrink-0">
                      description
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate min-w-0">
                      {t("hrProfile.sidebar.noResume")}
                    </span>
                  </div>
                )}

                {profile.resumeFileName && (
                  <div className="flex items-center gap-1 shrink-0 relative z-10">
                    <button
                      type="button"
                      onClick={onResumeDownload}
                      disabled={downloadingResume}
                      className="size-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t("hrProfile.sidebar.downloadResume")}
                      aria-label={t("hrProfile.sidebar.downloadResume")}
                    >
                      {downloadingResume ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">download</span>
                      )}
                    </button>
                  </div>
                )}
              </div>


              {/* Action buttons */}
              <div className="my-5 border-t border-slate-200 dark:border-slate-400/[.14]" />
              <button
                onClick={handleToggleShortlist}
                disabled={isToggling}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${isShortlisted
                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#0e1628] hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300"
                  } ${isToggling ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: isShortlisted ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {isShortlisted ? "bookmark" : "bookmark_add"}
                </span>
                {isShortlisted ? t("hrProfile.actions.shortlisted", "Shortlisted") : t("hrProfile.actions.shortlist")}
              </button>
            </Card>
          </div>

          {/* ═══ RIGHT: Content ═══ */}
          <div className="lg:col-span-8 space-y-5 lg:space-y-6 min-w-0">
            {/* AI Executive Summary */}
            <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-blue-500/40 shadow-sm">
              <Card className="relative p-5 sm:p-6 rounded-[23px] bg-white dark:bg-[#0a1020] border-0">
                <div className="flex items-center justify-between gap-4 mb-5 border-b border-slate-200 dark:border-slate-400/[.14] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                      <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
                        {t("hrProfile.overview.aiMatch", "AI Executive Summary")}
                      </h2>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                        {t("hrProfile.aiSummaryDesc", "Candidate Match & Fit Analysis")}
                      </p>
                    </div>
                  </div>

                </div>

                <div className="space-y-6">
                  {/* AI Reasoning */}
                  {profile.aiReasoning && (
                    <div className="relative">
                      <span className="absolute -top-3 -start-2 text-6xl text-blue-500/10 dark:text-blue-400/10 font-serif leading-none">&ldquo;</span>
                      <ExpandableText text={profile.aiReasoning} lines={4} className="relative text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-s-4 border-blue-400/50 dark:border-blue-500/30 ps-5 sm:ps-6 py-2 z-10 whitespace-pre-line" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Matched Skills */}
                    <div className="bg-slate-50 dark:bg-[#0c1424] rounded-2xl p-4 border border-slate-200 dark:border-slate-400/[.14]">
                      <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        {t("hrProfile.overview.matchedSkills", "Matched Skills")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(profile.matchedSkills || []).map((s, i) => (
                          <Pill key={i} tone="green">{s}</Pill>
                        ))}
                        {(!profile.matchedSkills || profile.matchedSkills.length === 0) && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">{t("hrProfile.overview.none", "None")}</p>
                        )}
                      </div>
                    </div>
                    {/* Missing Skills */}
                    <div className="bg-slate-50 dark:bg-[#0c1424] rounded-2xl p-4 border border-slate-200 dark:border-slate-400/[.14]">
                      <p className="flex items-center gap-2 text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-3">
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        {t("hrProfile.overview.missingSkills", "Missing Skills")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(profile.missingSkills || []).map((s, i) => (
                          <Pill key={i} tone="red">{s}</Pill>
                        ))}
                        {(!profile.missingSkills || profile.missingSkills.length === 0) && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">{t("hrProfile.overview.none", "None")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <TabBar active={activeTab} onChange={setActiveTab} counts={tabCounts} tabs={TABS.map(tab => ({ ...tab, label: t(tab.labelKey) }))} />

            <Card key={activeTab} className="p-5 sm:p-6 rounded-3xl" style={{ animation: 'fadeInUpTab 0.25s ease-out forwards' }}>
              {activeTab === "overview" && <OverviewTab profile={profile} t={t} />}
              {activeTab === "experience" && <ExperienceTab experiences={profile.experiences} t={t} lng={i18n.language} />}
              {activeTab === "education" && <EducationTab educations={profile.educations} t={t} lng={i18n.language} />}
              {activeTab === "skills" && <SkillsTab skills={profile.skills} t={t} />}
              {activeTab === "projects" && <ProjectsTab projects={profile.projects} t={t} />}
            </Card>
          </div>
        </div>
      </div>

      {/* ─── Contact Candidate Modal ─── */}
      <Modal
        open={contactModalOpen}
        onClose={() => { if (!contactSending) { setContactModalOpen(false); setContactMessage(""); } }}
        title={t("hrProfile.contactModal.title")}
        description={t("hrProfile.contactModal.description", { name: profile?.fullName || "", jobTitle: profile?.jobTitle || "" })}
        icon="mail"
        footer={
          <>
            <button
              onClick={() => { setContactModalOpen(false); setContactMessage(""); }}
              disabled={contactSending}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {t("hrProfile.contactModal.cancel")}
            </button>
            <button
              onClick={handleContactSend}
              disabled={contactSending || contactMessage.trim().length < 10}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {contactSending && (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              )}
              {contactSending ? t("hrProfile.contactModal.sending") : t("hrProfile.contactModal.send")}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Recipient info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14]">
            <div className="size-9 shrink-0 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">person</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{profile?.fullName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile?.jobTitle}</p>
            </div>
          </div>

          {/* Message textarea */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("hrProfile.contactModal.messageLabel")}
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder={t("hrProfile.contactModal.messagePlaceholder", { name: profile?.fullName?.split(" ")[0] || "", jobTitle: profile?.jobTitle || "" })}
              rows={5}
              maxLength={2000}
              disabled={contactSending}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none transition-all disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 text-right">
              {t("hrProfile.contactModal.charsLeft", { count: 2000 - contactMessage.length })}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
