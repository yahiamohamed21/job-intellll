import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jobsService } from "../../api/jobsService";
import { confirmAction, toastSuccess, alertError } from "../../lib/alerts";
import wizardService from "../../api/wizardService";
import SearchableSelect from "../../Components/SearchableSelect";
import Modal from "../../Components/Modal";
import { Card } from "../../Components/ui/Card";
import { Pill } from "../../Components/ui/Pill";
import { EmptyState } from "../../Components/ui/EmptyState";

const EMPLOYMENT_TYPES = {
  FullTime: "green",
  PartTime: "blue",
  Freelance: "purple",
  Internship: "amber",
};

const formatDate = (dateStr, isRtl) => {
  if (!dateStr) return "\u2014";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    return d.toLocaleDateString(isRtl ? "ar-EG" : "en-US");
  } catch {
    return "\u2014";
  }
};

export default function HRJobs() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileMissing, setProfileMissing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    title: "",
    jobTitleId: "",
    description: "",
    requirements: "",
    employmentType: "FullTime",
    minYearsOfExperience: 0,
    workModel: "Remote",
    countryId: "",
    cityId: "",
    skillIds: [],
  });

  const [jobTitles, setJobTitles] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillsSearch, setSkillsSearch] = useState("");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  const skillsDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target)) {
        setShowSkillsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    const loadRefData = async () => {
      try {
        const [titlesRes, countriesRes] = await Promise.all([
          wizardService.getJobTitles(i18n.language),
          wizardService.getCountries(i18n.language),
        ]);
        setJobTitles(titlesRes.data?.data || titlesRes.data || []);
        setCountries(countriesRes.data?.data || countriesRes.data || []);
      } catch (err) {
        console.error("Failed to load reference data in HRJobs", err);
      }
    };
    loadRefData();
  }, [i18n.language]);

  useEffect(() => {
    if (!form.countryId) {
      setCities([]);
      return;
    }
    const loadCities = async () => {
      setIsCitiesLoading(true);
      try {
        const res = await wizardService.getCities(form.countryId, i18n.language);
        setCities(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to load cities", err);
      } finally {
        setIsCitiesLoading(false);
      }
    };
    loadCities();
  }, [form.countryId, i18n.language]);

  useEffect(() => {
    if (!skillsSearch.trim()) {
      setAvailableSkills([]);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setIsSkillsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await jobsService.getSkills(skillsSearch);
        if (response.data?.success && Array.isArray(response.data.data)) {
          const filtered = response.data.data.filter(
            (sk) => !form.skillIds.includes(sk.id)
          );
          setAvailableSkills(filtered);
        }
      } catch (err) {
        console.error("Error fetching skills catalog", err);
      } finally {
        setIsSkillsLoading(false);
      }
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [skillsSearch, form.skillIds]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = { page, pageSize };
      if (statusFilter === "active") params.isActive = true;
      if (statusFilter === "inactive") params.isActive = false;

      const response = await jobsService.getMyJobs(params);
      if (response.data?.success) {
        setJobs(response.data.data?.jobs || []);
        setTotalCount(response.data.data?.totalCount || 0);
        setTotalPages(response.data.data?.totalPages || 1);
        setProfileMissing(false);
      }
    } catch (err) {
      console.error("Error loading jobs list", err);
      const resMsg = err.response?.data?.message || "";
      if (
        err.response?.status === 400 &&
        (resMsg.toLowerCase().includes("profile") || resMsg.toLowerCase().includes("company"))
      ) {
        setProfileMissing(true);
        setProfileMessage(resMsg || t("hrJobs.profileMissingMessage"));
      } else {
        alertError(t("hrJobs.errorLoad"), t("hrJobs.errorLoadMsg"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormErrors({});
    setForm({
      title: "",
      jobTitleId: "",
      description: "",
      requirements: "",
      employmentType: "FullTime",
      minYearsOfExperience: 0,
      workModel: "Remote",
      countryId: "",
      cityId: "",
      skillIds: [],
    });
    setSelectedSkills([]);
    setSkillsSearch("");
    setShowModal(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setFormErrors({});
    setForm({
      title: job.title || "",
      jobTitleId: job.jobTitleId || job.jobTitle?.id || "",
      description: job.description || "",
      requirements: job.requirements || "",
      employmentType: job.employmentType || "FullTime",
      minYearsOfExperience: job.minYearsOfExperience || 0,
      workModel: job.workModel || "Remote",
      countryId: job.countryId || job.country?.id || "",
      cityId: job.cityId || job.city?.id || "",
      skillIds: job.skills ? job.skills.map((s) => s.id) : [],
    });
    setSelectedSkills(job.skills || []);
    setSkillsSearch("");
    setShowModal(true);
  };

  const handleSelectSkill = (skill) => {
    if (form.skillIds.length >= 15) {
      toastSuccess(t("hrJobs.modal.skillsLabel") + " (max 15)");
      return;
    }
    if (!form.skillIds.includes(skill.id)) {
      setForm((prev) => ({ ...prev, skillIds: [...prev.skillIds, skill.id] }));
      setSelectedSkills((prev) => [...prev, skill]);
    }
    setSkillsSearch("");
    setShowSkillsDropdown(false);
  };

  const handleRemoveSkill = (skillId) => {
    setForm((prev) => ({
      ...prev,
      skillIds: prev.skillIds.filter((id) => id !== skillId),
    }));
    setSelectedSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  const validateLocal = (data) => {
    const errors = {};
    if (!data.title || data.title.trim().length < 3 || data.title.trim().length > 150) {
      errors.title = t("hrJobs.errorData");
    }
    if (!data.jobTitleId || parseInt(data.jobTitleId) === 0) {
      errors.jobTitleId = t("hrJobs.errorData");
    }
    if (!data.description || data.description.trim().length < 20 || data.description.trim().length > 1200) {
      errors.description = t("hrJobs.errorData");
    }
    if (!data.requirements || data.requirements.trim().length < 20 || data.requirements.trim().length > 1200) {
      errors.requirements = t("hrJobs.errorData");
    }
    const exp = Number(data.minYearsOfExperience);
    if (isNaN(exp) || exp < 0 || exp > 30) {
      errors.minYearsOfExperience = t("hrJobs.errorData");
    }
    if (!data.countryId || parseInt(data.countryId) === 0) {
      errors.countryId = t("hrJobs.errorData");
    }
    if (!data.cityId || parseInt(data.cityId) === 0) {
      errors.cityId = t("hrJobs.errorData");
    }
    if (data.skillIds && data.skillIds.length > 15) {
      errors.skillIds = t("hrJobs.errorData");
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const trimmedForm = {
      title: form.title.trim(),
      jobTitleId: parseInt(form.jobTitleId) || 0,
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      employmentType: form.employmentType,
      minYearsOfExperience: Number(form.minYearsOfExperience),
      workModel: form.workModel,
      countryId: parseInt(form.countryId) || 0,
      cityId: parseInt(form.cityId) || 0,
      skillIds: form.skillIds,
    };

    const clientErrors = validateLocal(trimmedForm);
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingJob) {
        const response = await jobsService.updateJob(editingJob.id, trimmedForm);
        if (response.data?.success) {
          toastSuccess(t("hrJobs.successUpdated"));
          setShowModal(false);
          fetchJobs();
        }
      } else {
        const response = await jobsService.createJob(trimmedForm);
        if (response.data?.success) {
          toastSuccess(t("hrJobs.successCreated"));
          setShowModal(false);
          fetchJobs();
        }
      }
    } catch (err) {
      console.error("Error submitting job form", err);
      if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.errors) {
          const errorsObj = {};
          Object.keys(data.errors).forEach((key) => {
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            errorsObj[camelKey] = data.errors[key].join(". ");
          });
          setFormErrors(errorsObj);
        } else if (data.message) {
          alertError(t("hrJobs.errorLoad"), data.message);
        } else {
          alertError(t("hrJobs.errorLoad"), t("hrJobs.errorData"));
        }
      } else if (err.response?.status === 403) {
        alertError(t("hrJobs.errorLoad"), t("hrJobs.errorUnauthorized"));
      } else {
        alertError(t("hrJobs.errorLoad"), t("hrJobs.errorSubmit"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (job) => {
    const isDeactivating = job.isActive;
    const confirmed = await confirmAction(
      isDeactivating ? t("hrJobs.confirmDeactivate") : t("hrJobs.confirmReactivate"),
      `${t("hrJobs.cols.title")}: ${job.title}`,
      isDeactivating ? t("hrJobs.deactivate") : t("hrJobs.activate"),
      t("hrJobs.cancel")
    );
    if (!confirmed) return;

    try {
      const serviceCall = isDeactivating
        ? jobsService.deactivateJob(job.id)
        : jobsService.reactivateJob(job.id);
      const response = await serviceCall;
      if (response.data?.success) {
        toastSuccess(isDeactivating ? t("hrJobs.successDeactivated") : t("hrJobs.successReactivated"));
        fetchJobs();
      }
    } catch (err) {
      console.error("Error toggling job active status", err);
      alertError(t("hrJobs.errorLoad"), err.response?.data?.message || t("hrJobs.errorSubmit"));
    }
  };

  const handleDeleteJob = async (job) => {
    const confirmed = await confirmAction(
      t("hrJobs.confirmDelete"),
      t("hrJobs.confirmDeleteWarning"),
      t("hrJobs.delete"),
      t("hrJobs.cancel")
    );
    if (!confirmed) return;

    try {
      const response = await jobsService.deleteJob(job.id);
      if (response.data?.success) {
        toastSuccess(t("hrJobs.successDeleted"));
        fetchJobs();
      }
    } catch (err) {
      console.error("Error deleting job", err);
      alertError(t("hrJobs.errorLoad"), err.response?.data?.message || t("hrJobs.errorSubmit"));
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      String(job.id).includes(q) ||
      job.location?.toLowerCase().includes(q)
    );
  });

  const getEmploymentTypeLabel = (type) => {
    return t(`employmentType.${type}`, { defaultValue: type });
  };

  const getWorkModelLabel = (model) => {
    return t(`workModel.${model}`, { defaultValue: model });
  };

  const getJobLocationDisplay = (job) => {
    const parts = [job.city?.name || job.city, job.country?.name || job.country].filter(Boolean);
    const locationText = parts.length > 0 ? parts.join(", ") : "";
    const modelText = job.workModel ? getWorkModelLabel(job.workModel) : "";
    if (locationText && modelText) return `${locationText} (${modelText})`;
    return locationText || modelText || job.location || "";
  };

  if (profileMissing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-xl mx-auto my-12" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="p-10 w-full text-center">
          <EmptyState
            variant="page"
            icon="error"
            title={t("hrJobs.profileMissing")}
            subtitle={profileMessage || t("hrJobs.profileMissingMessage")}
          />
          <div className="flex gap-4 justify-center mt-6">
            <Link to="/recruiter-setup" className="btn font-semibold px-6 py-2.5">
              {t("hrJobs.setupProfileBtn")}
            </Link>
            <button onClick={fetchJobs} className="btn ghost flex gap-2 items-center">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              {t("hrJobs.retryBtn")}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t("hrJobs.title")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("hrJobs.subtitle")}</p>
          </div>
          <button onClick={handleOpenCreateModal} className="btn self-start md:self-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>{t("hrJobs.createBtn")}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 items-center">
          <div className="relative flex-grow max-w-md">
            <input
              className="w-full h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white text-sm pr-10"
              placeholder={t("hrJobs.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 dark:text-slate-500">search</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
              {t("hrJobs.statusFilterLabel")}
            </label>
            <div className="relative" style={{ width: 140 }}>
              <select
                className="w-full h-[42px] rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white text-sm appearance-none cursor-pointer px-3"
                style={{ paddingRight: isRtl ? "12px" : "32px", paddingLeft: isRtl ? "32px" : "12px" }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="all">{t("hrJobs.statusAll")}</option>
                <option value="active">{t("hrJobs.statusActive")}</option>
                <option value="inactive">{t("hrJobs.statusInactive")}</option>
              </select>
              <span className={`material-symbols-outlined absolute top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-slate-400 dark:text-slate-500 ${isRtl ? "left-3" : "right-3"}`}>
                expand_more
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-5 sm:p-6 pb-0">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t("hrJobs.tableCardTitle")}</h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <span className="material-symbols-outlined text-[40px] text-blue-500 dark:text-sky-400 animate-spin">progress_activity</span>
            <p className="text-sm text-slate-400 dark:text-slate-500">{t("hrJobs.loading")}</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon="work"
            title={t("hrJobs.empty.title")}
            subtitle={searchQuery ? t("hrJobs.empty.searchSubtitle") : t("hrJobs.empty.subtitle")}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm" style={{ minWidth: 1000 }} dir={isRtl ? "rtl" : "ltr"}>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-400/[.14]">
                    {[
                      "code", "title", "type", "experience",
                      "location", "skills", "applicants", "status", "date", "actions"
                    ].map((key) => (
                      <th key={key} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 px-3 text-right whitespace-nowrap">
                        {t(`hrJobs.cols.${key}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b border-slate-200 dark:border-slate-400/[.14] last:border-0 hover:bg-slate-50 dark:hover:bg-[#0c1424] transition-colors">
                      <td className="px-3 py-4">
                        <span className="font-mono text-xs bg-slate-100 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                          JB-{job.id}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="font-bold text-slate-800 dark:text-white">{job.title}</span>
                      </td>
                      <td className="px-3 py-4">
                        <Pill tone={EMPLOYMENT_TYPES[job.employmentType] || "slate"} sizeClass="text-[10px]">
                          {getEmploymentTypeLabel(job.employmentType)}
                        </Pill>
                      </td>
                      <td className="px-3 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {job.minYearsOfExperience === 0
                          ? t("hrJobs.noExpRequired")
                          : `${job.minYearsOfExperience} ${t("hrJobs.years")}`}
                      </td>
                      <td className="px-3 py-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">location_on</span>
                          {getJobLocationDisplay(job)}
                        </span>
                      </td>
                      <td className="px-3 py-4" style={{ maxWidth: 220 }}>
                        <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                          {job.skills && job.skills.length > 0 ? (
                            <>
                              {job.skills.slice(0, 3).map((sk) => (
                                <span key={sk.id} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] text-slate-500 dark:text-slate-400 font-medium">
                                  {sk.name}
                                </span>
                              ))}
                              {job.skills.length > 3 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] text-blue-600 dark:text-blue-400 font-bold">
                                  +{job.skills.length - 3}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500">&mdash;</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 font-bold text-slate-800 dark:text-white text-sm">
                        {job.candidateCount || 0}
                      </td>
                      <td className="px-3 py-4">
                        <Pill tone={job.isActive ? "green" : "red"} sizeClass="text-[10px]">
                          {job.isActive ? t("hrJobs.active") : t("hrJobs.inactive")}
                        </Pill>
                      </td>
                      <td className="px-3 py-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">calendar_today</span>
                          {formatDate(job.postedAt, isRtl)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(job)}
                            className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-400/[.14] hover:bg-slate-100 dark:hover:bg-[#0c1424] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
                            title={t("hrJobs.editJob")}
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleActive(job)}
                            className={`size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-400/[.14] hover:bg-slate-100 dark:hover:bg-[#0c1424] transition-all ${job.isActive ? "text-amber-500 hover:text-amber-400" : "text-emerald-500 hover:text-emerald-400"}`}
                            title={job.isActive ? t("hrJobs.deactivateJob") : t("hrJobs.reactivateJob")}
                          >
                            <span className="material-symbols-outlined text-[16px]">{job.isActive ? "visibility" : "visibility_off"}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job)}
                            className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-400/[.14] hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-all"
                            title={t("hrJobs.deleteJob")}
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-400/[.14] p-4 bg-slate-50/40 dark:bg-[#0c1424]/60">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t("hrJobs.showing", {
                    start: (page - 1) * pageSize + 1,
                    end: Math.min(page * pageSize, totalCount),
                    total: totalCount,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="size-8 flex items-center justify-center border border-slate-200 dark:border-slate-400/[.14] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#0c1424] text-slate-600 dark:text-slate-300 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px] rtl:rotate-180">chevron_left</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`size-8 flex items-center justify-center border rounded-lg text-xs font-bold transition-all ${
                        page === p
                          ? "border-blue-500 dark:border-sky-400 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-sky-400"
                          : "border-slate-200 dark:border-slate-400/[.14] hover:bg-slate-100 dark:hover:bg-[#0c1424] text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="size-8 flex items-center justify-center border border-slate-200 dark:border-slate-400/[.14] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#0c1424] text-slate-600 dark:text-slate-300 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px] rtl:rotate-180">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <p className="text-xs text-center text-slate-400 dark:text-slate-500 py-4">
        &copy; {new Date().getFullYear()} Job Intel &mdash; {t("hrJobs.footer")}
      </p>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingJob ? `${t("hrJobs.modal.editTitle")} ${editingJob.title}` : t("hrJobs.modal.createTitle")}
        icon="work"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn ghost font-semibold px-4 py-2"
              disabled={isSubmitting}
            >
              {t("hrJobs.modal.cancel")}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn font-semibold px-5 py-2 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>{t("hrJobs.modal.saving")}</span>
                </>
              ) : (
                <span>{t("hrJobs.modal.saveAndPublish")}</span>
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("hrJobs.modal.jobTitle")}
            </label>
            <input
              className={`w-full h-[42px] px-3 rounded-xl border text-sm bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white ${
                formErrors.title ? "border-red-500" : "border-slate-200 dark:border-slate-400/[.14]"
              }`}
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={t("hrJobs.modal.jobTitlePlaceholder")}
            />
            {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("hrJobs.modal.jobTitleCatalog")}
            </label>
            <SearchableSelect
              options={jobTitles.map((j) => ({ value: j.id.toString(), label: j.title }))}
              value={form.jobTitleId?.toString() || ""}
              onChange={(val) => setForm((prev) => ({ ...prev, jobTitleId: val }))}
              placeholder={t("hrJobs.modal.jobTitlePlaceholder")}
              searchPlaceholder={isRtl ? "ابحث..." : "Search..."}
            />
            {formErrors.jobTitleId && <p className="text-xs text-red-500 mt-1">{formErrors.jobTitleId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("hrJobs.modal.employmentType")}
              </label>
              <div className="relative w-full">
                <select
                  className="w-full h-[42px] rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white text-sm appearance-none cursor-pointer px-3"
                  style={{ paddingRight: isRtl ? "12px" : "32px", paddingLeft: isRtl ? "32px" : "12px" }}
                  value={form.employmentType}
                  onChange={(e) => setForm((prev) => ({ ...prev, employmentType: e.target.value }))}
                >
                  {Object.keys(EMPLOYMENT_TYPES).map((key) => (
                    <option key={key} value={key}>{getEmploymentTypeLabel(key)}</option>
                  ))}
                </select>
                <span className={`material-symbols-outlined absolute top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-slate-400 dark:text-slate-500 ${isRtl ? "left-3" : "right-3"}`}>
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("hrJobs.modal.reqExperience")}
              </label>
              <input
                type="number"
                min="0"
                max="30"
                className={`w-full h-[42px] px-3 rounded-xl border text-sm bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white ${
                  formErrors.minYearsOfExperience ? "border-red-500" : "border-slate-200 dark:border-slate-400/[.14]"
                }`}
                value={form.minYearsOfExperience}
                onChange={(e) => setForm((prev) => ({ ...prev, minYearsOfExperience: parseInt(e.target.value) || 0 }))}
              />
              {formErrors.minYearsOfExperience && (
                <p className="text-xs text-red-500 mt-1">{formErrors.minYearsOfExperience}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("hrJobs.modal.workModel")}
              </label>
              <div className="relative w-full">
                <select
                  className="w-full h-[42px] rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white text-sm appearance-none cursor-pointer px-3"
                  style={{ paddingRight: isRtl ? "12px" : "32px", paddingLeft: isRtl ? "32px" : "12px" }}
                  value={form.workModel}
                  onChange={(e) => setForm((prev) => ({ ...prev, workModel: e.target.value }))}
                >
                  <option value="Remote">{t("workModel.Remote")}</option>
                  <option value="Hybrid">{t("workModel.Hybrid")}</option>
                  <option value="OnSite">{t("workModel.OnSite")}</option>
                </select>
                <span className={`material-symbols-outlined absolute top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-slate-400 dark:text-slate-500 ${isRtl ? "left-3" : "right-3"}`}>
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("hrJobs.modal.country")}
              </label>
              <SearchableSelect
                options={countries.map((c) => ({ value: c.id.toString(), label: c.name }))}
                value={form.countryId?.toString() || ""}
                onChange={(val) => setForm((prev) => ({ ...prev, countryId: val, cityId: "" }))}
                placeholder={isRtl ? "اختر الدولة..." : "Select Country..."}
                searchPlaceholder={isRtl ? "ابحث..." : "Search..."}
              />
              {formErrors.countryId && <p className="text-xs text-red-500 mt-1">{formErrors.countryId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("hrJobs.modal.city")}
              </label>
              <SearchableSelect
                options={cities.map((c) => ({ value: c.id.toString(), label: c.name }))}
                value={form.cityId?.toString() || ""}
                onChange={(val) => setForm((prev) => ({ ...prev, cityId: val }))}
                placeholder={isCitiesLoading ? (isRtl ? "جاري التحميل..." : "Loading...") : (isRtl ? "اختر المدينة..." : "Select City...")}
                searchPlaceholder={isRtl ? "ابحث..." : "Search..."}
                disabled={!form.countryId || isCitiesLoading}
              />
              {formErrors.cityId && <p className="text-xs text-red-500 mt-1">{formErrors.cityId}</p>}
            </div>
          </div>

          <div className="relative" ref={skillsDropdownRef}>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("hrJobs.modal.skillsLabel")} ({form.skillIds.length}/15)
            </label>

            <div className="relative">
              <input
                className="w-full h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white text-sm"
                value={skillsSearch}
                onChange={(e) => { setSkillsSearch(e.target.value); setShowSkillsDropdown(true); }}
                onFocus={() => setShowSkillsDropdown(true)}
                placeholder={t("hrJobs.modal.skillsPlaceholder")}
              />
              {isSkillsLoading && (
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-blue-500 dark:text-sky-400 animate-spin">progress_activity</span>
              )}
            </div>

            {showSkillsDropdown && skillsSearch.trim() && (
              <div className="absolute right-0 left-0 top-full mt-1.5 bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
                {availableSkills.length === 0 ? (
                  <div className="p-3.5 text-center text-xs text-slate-400 dark:text-slate-500">
                    {isSkillsLoading ? t("hrJobs.modal.skillsLoading") : t("hrJobs.modal.skillsNoResults")}
                  </div>
                ) : (
                  availableSkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSelectSkill(skill)}
                      className="w-full text-right px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0c1424] flex items-center justify-between transition-colors border-b border-slate-100 dark:border-slate-400/[.08] last:border-0"
                    >
                      <span>{skill.name}</span>
                      <span className="material-symbols-outlined text-[14px] text-blue-500 dark:text-sky-400">add</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50/40 dark:bg-[#0c1424]/60 border border-slate-200 dark:border-slate-400/[.14] rounded-xl">
                {selectedSkills.map((sk) => (
                  <span
                    key={sk.id}
                    className="flex items-center gap-1.5 text-xs bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200 shadow-sm"
                  >
                    {sk.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk.id)}
                      className="text-red-500 hover:text-red-400 p-0.5 rounded-full hover:bg-red-500/10"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
            {formErrors.skillIds && <p className="text-xs text-red-500 mt-1">{formErrors.skillIds}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("hrJobs.modal.description")}
            </label>
            <textarea
              className={`w-full rounded-xl border text-sm bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white p-3 resize-y ${
                formErrors.description ? "border-red-500" : "border-slate-200 dark:border-slate-400/[.14]"
              }`}
              style={{ minHeight: 110 }}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t("hrJobs.modal.descriptionPlaceholder")}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {t("hrJobs.modal.descriptionLength")}{form.description.length}{t("hrJobs.modal.descriptionChars")}
              </span>
              {formErrors.description && <span className="text-xs text-red-500">{formErrors.description}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("hrJobs.modal.requirements")}
            </label>
            <textarea
              className={`w-full rounded-xl border text-sm bg-white dark:bg-[#0a1020] text-slate-800 dark:text-white p-3 resize-y ${
                formErrors.requirements ? "border-red-500" : "border-slate-200 dark:border-slate-400/[.14]"
              }`}
              style={{ minHeight: 110 }}
              value={form.requirements}
              onChange={(e) => setForm((prev) => ({ ...prev, requirements: e.target.value }))}
              placeholder={t("hrJobs.modal.requirementsPlaceholder")}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {t("hrJobs.modal.descriptionLength")}{form.requirements.length}{t("hrJobs.modal.descriptionChars")}
              </span>
              {formErrors.requirements && <span className="text-xs text-red-500">{formErrors.requirements}</span>}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
