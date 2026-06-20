import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal.jsx";
import SearchableSelect from "./SearchableSelect.jsx";
import wizardService from "../api/wizardService.js";
import { toastSuccess, alertError } from "../lib/alerts.js";
import { extractError } from "../utils/extractError.js";

/* ─── Shared styles (mirror the Wizard's input/label conventions) ─── */
const baseInputClass =
  "w-full bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] rounded-xl px-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm";
const inputClass = baseInputClass + " h-12";
const labelClass =
  "block text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 mb-2 tracking-wide";

const CancelButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0c1424] text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-[#0e1628] transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
  >
    <span className="material-symbols-outlined text-[18px]">close</span>
    {children}
  </button>
);

const PrimaryButton = ({ loading, children, disabled, icon = "check_circle", onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading || disabled}
    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
  >
    {loading ? (
      <>
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
        {children}
      </>
    ) : (
      <>
        {children}
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </>
    )}
  </button>
);

/* ═════════════════════════════════════════════════════════════════════
   1) BioModal
   ═════════════════════════════════════════════════════════════════════ */
export function BioModal({ open = true, onClose, initialData, onSaved }) {
  const { t } = useTranslation();
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setBio(initialData?.bio || "");
  }, [open, initialData]);

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        bio: bio.trim() || null,
      };
      await wizardService.updateBio(payload);
      toastSuccess(t("dashboard.alerts.saved"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      alertError(t("modal.save"), extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modalBio.title")}
      description={t("modalBio.desc")}
      icon="person"
      size="md"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={submit}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div>
        <label className={labelClass}>
          {t("modalBio.bio")}{" "}
          <span className="text-slate-400 font-normal text-xs">{t("modalBio.maxChars")}</span>
        </label>
        <textarea
          className={baseInputClass + " min-h-[180px] resize-none py-3 custom-scrollbar leading-relaxed"}
          maxLength={500}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="text-[11px] text-slate-400 text-end mt-1.5 font-medium">
          {bio.length}/500
        </p>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   2) LanguageModal
   ═════════════════════════════════════════════════════════════════════ */
const PROFICIENCY_OPTIONS = [
  { value: "Beginner", labelKey: "Beginner" },
  { value: "Intermediate", labelKey: "Intermediate" },
  { value: "Advanced", labelKey: "Advanced" },
  { value: "Native", labelKey: "Native" },
];

export function LanguageModal({ open = true, onClose, initialData, onSaved }) {
  const { t, i18n } = useTranslation();
  const [languages, setLanguages] = useState([]);
  const [firstLang, setFirstLang] = useState("");
  const [firstProf, setFirstProf] = useState("Native");
  const [secondLang, setSecondLang] = useState("");
  const [secondProf, setSecondProf] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFirstLang(initialData?.firstLanguageId?.toString() || "");
    setFirstProf(initialData?.firstLanguageProficiency || "Native");
    setSecondLang(initialData?.secondLanguageId?.toString() || "");
    setSecondProf(initialData?.secondLanguageProficiency || "");
    const load = async () => {
      try {
        const res = await wizardService.getLanguages(i18n.language);
        setLanguages(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to load languages", err);
      }
    };
    load();
  }, [open, initialData, i18n.language]);

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        firstLanguageId: parseInt(firstLang) || 0,
        firstLanguageProficiency: firstProf,
        secondLanguageId: secondLang ? parseInt(secondLang) : null,
        secondLanguageProficiency: secondProf || null,
      };
      await wizardService.updateLanguages(payload);
      toastSuccess(t("dashboard.alerts.saved"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      alertError(t("modal.save"), extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modalLanguage.title")}
      description={t("modalLanguage.desc")}
      icon="translate"
      size="md"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={submit}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="w-full">
          <label className={labelClass}>{t("modalLanguage.firstLanguage")}</label>
          <SearchableSelect
            options={languages.map((l) => ({ value: l.id.toString(), label: l.name }))}
            value={firstLang}
            onChange={setFirstLang}
            placeholder={t("modalLanguage.selectLanguage")}
            searchPlaceholder={t("modalLanguage.searchLanguage")}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalLanguage.firstProficiency")}</label>
          <SearchableSelect
            options={PROFICIENCY_OPTIONS.map((p) => ({
              value: p.value,
              label: t(`modalLanguage.proficiency.${p.labelKey}`),
            }))}
            value={firstProf}
            onChange={setFirstProf}
            placeholder={t("modalLanguage.selectProficiency")}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalLanguage.secondLanguage")}</label>
          <SearchableSelect
            options={languages.map((l) => ({ value: l.id.toString(), label: l.name }))}
            value={secondLang}
            onChange={setSecondLang}
            placeholder={t("modalLanguage.selectLanguage")}
            searchPlaceholder={t("modalLanguage.searchLanguage")}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalLanguage.secondProficiency")}</label>
          <SearchableSelect
            options={PROFICIENCY_OPTIONS.map((p) => ({
              value: p.value,
              label: t(`modalLanguage.proficiency.${p.labelKey}`),
            }))}
            value={secondProf}
            onChange={setSecondProf}
            placeholder={t("modalLanguage.selectProficiency")}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   3) ExperienceModal
   ═════════════════════════════════════════════════════════════════════ */
export function ExperienceModal({ open = true, onClose, initialData, onSaved }) {
  const { t, i18n } = useTranslation();
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    jobTitle: "",
    companyName: "",
    countryId: "",
    cityId: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    employmentType: "FullTime",
    responsibilities: "",
  });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      jobTitle: initialData?.jobTitle || "",
      companyName: initialData?.companyName || "",
      countryId: initialData?.countryId?.toString() || "",
      cityId: initialData?.cityId?.toString() || "",
      startDate: initialData?.startDate ? initialData.startDate.split("T")[0] : "",
      endDate: initialData?.endDate ? initialData.endDate.split("T")[0] : "",
      isCurrent: Boolean(initialData?.isCurrent),
      employmentType: initialData?.employmentType || "FullTime",
      responsibilities: initialData?.responsibilities || "",
    });
    const loadCountries = async () => {
      try {
        const res = await wizardService.getCountries(i18n.language);
        setCountries(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    };
    loadCountries();
    if (initialData?.countryId) {
      const loadCities = async () => {
        setCitiesLoading(true);
        try {
          const res = await wizardService.getCities(initialData.countryId, i18n.language);
          setCities(res.data?.data || res.data || []);
        } catch (err) {
          console.error("Failed to load cities", err);
        } finally {
          setCitiesLoading(false);
        }
      };
      loadCities();
    } else {
      setCities([]);
    }
  }, [open, initialData, i18n.language]);

  const update = async (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "isCurrent" && value) next.endDate = "";
      if (field === "countryId") next.cityId = "";
      return next;
    });
    if (field === "countryId" && value) {
      setCitiesLoading(true);
      try {
        const res = await wizardService.getCities(value, i18n.language);
        setCities(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to load cities", err);
      } finally {
        setCitiesLoading(false);
      }
    }
  };

  const submit = async () => {
    if (
      !form.jobTitle ||
      !form.companyName ||
      !form.startDate ||
      !form.countryId ||
      !form.cityId
    ) {
      alertError(t("modalExperience.titleAdd"), t("modalExperience.missingFields"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        jobTitle: form.jobTitle,
        companyName: form.companyName,
        countryId: parseInt(form.countryId) || 0,
        cityId: parseInt(form.cityId) || 0,
        startDate: form.startDate,
        endDate: form.isCurrent ? null : form.endDate || null,
        isCurrent: form.isCurrent,
        employmentType: form.employmentType,
        responsibilities: form.responsibilities || null,
      };
      if (isEdit) {
        await wizardService.updateExperience(initialData.id, payload);
      } else {
        await wizardService.addExperience(payload);
      }
      toastSuccess(t("dashboard.alerts.saved"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      alertError(t("modal.save"), extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("modalExperience.titleEdit") : t("modalExperience.titleAdd")}
      description={t("modalExperience.desc")}
      icon="work"
      size="lg"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={submit}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="w-full">
          <label className={labelClass}>{t("modalExperience.jobTitle")}</label>
          <input
            className={inputClass}
            value={form.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalExperience.companyName")}</label>
          <input
            className={inputClass}
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalExperience.country")}</label>
          <SearchableSelect
            options={countries.map((c) => ({ value: c.id.toString(), label: c.name }))}
            value={form.countryId}
            onChange={(v) => update("countryId", v)}
            placeholder={t("modalExperience.selectCountry")}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalExperience.city")}</label>
          <SearchableSelect
            options={cities.map((c) => ({ value: c.id.toString(), label: c.name }))}
            value={form.cityId}
            onChange={(v) => update("cityId", v)}
            placeholder={
              citiesLoading ? t("modalExperience.loadingRegions") : t("modalExperience.selectCity")
            }
            disabled={!form.countryId || citiesLoading}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalExperience.employmentTypeLabel")}</label>
          <SearchableSelect
            options={[
              { value: "FullTime", label: t("modalExperience.employmentType.FullTime") },
              { value: "PartTime", label: t("modalExperience.employmentType.PartTime") },
              { value: "Freelance", label: t("modalExperience.employmentType.Freelance") },
              { value: "Internship", label: t("modalExperience.employmentType.Internship") },
            ]}
            value={form.employmentType}
            onChange={(v) => update("employmentType", v)}
            placeholder={t("modalExperience.employmentTypePlaceholder")}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalExperience.startDate")}</label>
          <input
            className={inputClass}
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
          />
        </div>
        {!form.isCurrent && (
          <div className="w-full">
            <label className={labelClass}>{t("modalExperience.endDate")}</label>
            <input
              className={inputClass}
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
            />
          </div>
        )}
        <div className="w-full sm:col-span-2 flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              id="exp-current-modal"
              checked={form.isCurrent}
              onChange={(e) => update("isCurrent", e.target.checked)}
              className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-400/[.14] rounded bg-white dark:bg-[#0c1424] checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
            />
            <span className="material-symbols-outlined text-white text-[14px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
              check
            </span>
          </div>
          <label
            htmlFor="exp-current-modal"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
          >
            {t("modalExperience.iCurrentlyWorkHere")}
          </label>
        </div>
        <div className="w-full sm:col-span-2">
          <label className={labelClass}>{t("modalExperience.responsibilities")}</label>
          <textarea
            className={baseInputClass + " min-h-[160px] resize-none py-3 custom-scrollbar leading-relaxed"}
            value={form.responsibilities}
            onChange={(e) => update("responsibilities", e.target.value)}
            placeholder={t("modalExperience.responsibilitiesHint")}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   4) EducationModal
   ═════════════════════════════════════════════════════════════════════ */
const DEGREE_OPTIONS = [
  "HighSchool",
  "Diploma",
  "Associate",
  "Bachelor",
  "Master",
  "PhD",
  "Other",
];

export function EducationModal({ open = true, onClose, initialData, onSaved }) {
  const { t, i18n } = useTranslation();
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    institution: "",
    degree: "Bachelor",
    fieldOfStudyId: "",
    fieldOfStudyName: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    gradeOrGPA: "",
  });
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      institution: initialData?.institution || "",
      degree: initialData?.degree || "Bachelor",
      fieldOfStudyId: initialData?.fieldOfStudyId?.toString() || "",
      fieldOfStudyName: initialData?.fieldOfStudyName || "",
      startDate: initialData?.startDate ? initialData.startDate.split("T")[0] : "",
      endDate: initialData?.endDate ? initialData.endDate.split("T")[0] : "",
      isCurrent: Boolean(initialData?.isCurrent),
      gradeOrGPA: initialData?.gradeOrGPA || "",
    });
    const loadFields = async () => {
      try {
        const res = await wizardService.getFieldsOfStudy(i18n.language);
        setFields(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to load fields of study", err);
      }
    };
    loadFields();
  }, [open, initialData, i18n.language]);

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "isCurrent" && value) next.endDate = "";
      return next;
    });
  };

  const submit = async () => {
    if (!form.institution || !form.startDate) {
      alertError(t("modalEducation.titleAdd"), t("modalEducation.missingFields"));
      return;
    }
    const hasFosId = parseInt(form.fieldOfStudyId) > 0;
    const hasFosName = Boolean(form.fieldOfStudyName?.trim());
    if (!hasFosId && !hasFosName) {
      alertError(t("modalEducation.titleAdd"), t("modalEducation.missingFields"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        institution: form.institution,
        degree: form.degree,
        fieldOfStudyId: hasFosId ? parseInt(form.fieldOfStudyId) : null,
        fieldOfStudyName: !hasFosId ? form.fieldOfStudyName?.trim() || null : null,
        startDate: form.startDate || null,
        endDate: form.isCurrent ? null : form.endDate || null,
        isCurrent: form.isCurrent,
        gradeOrGPA: form.gradeOrGPA || null,
      };
      if (isEdit) {
        await wizardService.updateEducation(initialData.id, payload);
      } else {
        await wizardService.addEducation(payload);
      }
      toastSuccess(t("dashboard.alerts.saved"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      alertError(t("modal.save"), extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("modalEducation.titleEdit") : t("modalEducation.titleAdd")}
      description={t("modalEducation.desc")}
      icon="school"
      size="lg"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={submit}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="w-full sm:col-span-2">
          <label className={labelClass}>{t("modalEducation.institution")}</label>
          <input
            className={inputClass}
            value={form.institution}
            onChange={(e) => update("institution", e.target.value)}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalEducation.degree")}</label>
          <SearchableSelect
            options={DEGREE_OPTIONS.map((d) => ({
              value: d,
              label: t(`modalEducation.degreeOptions.${d}`),
            }))}
            value={form.degree}
            onChange={(v) => update("degree", v)}
            placeholder={t("modalEducation.selectDegree")}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalEducation.fieldOfStudy")}</label>
          <SearchableSelect
            options={[{ value: "", label: t("modalEducation.customFieldOfStudy") || "Other (type below)" }, ...fields.map((f) => ({ value: f.id.toString(), label: f.name }))]}
            value={form.fieldOfStudyId}
            onChange={(v) => update("fieldOfStudyId", v)}
            placeholder={t("modalEducation.selectFieldOfStudy")}
          />
        </div>
        {!form.fieldOfStudyId && (
          <div className="w-full sm:col-span-2">
            <label className={labelClass}>{t("modalEducation.customFieldOfStudy") || "Custom Field of Study"}</label>
            <input
              className={inputClass}
              value={form.fieldOfStudyName}
              onChange={(e) => update("fieldOfStudyName", e.target.value)}
              placeholder={t("modalEducation.customFieldOfStudyPlaceholder") || "e.g. Computer and Communication Engineering"}
            />
          </div>
        )}
        <div className="w-full">
          <label className={labelClass}>{t("modalEducation.startDate")}</label>
          <input
            className={inputClass}
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
          />
        </div>
        {!form.isCurrent && (
          <div className="w-full">
            <label className={labelClass}>{t("modalEducation.endDate")}</label>
            <input
              className={inputClass}
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
            />
          </div>
        )}
        <div className="w-full">
          <label className={labelClass}>{t("modalEducation.gradeOrGPA")}</label>
          <input
            className={inputClass}
            value={form.gradeOrGPA}
            onChange={(e) => update("gradeOrGPA", e.target.value)}
            placeholder={t("modalEducation.gradeOrGPAHint")}
          />
        </div>
        <div className="w-full sm:col-span-2 flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              id="edu-current-modal"
              checked={form.isCurrent}
              onChange={(e) => update("isCurrent", e.target.checked)}
              className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-400/[.14] rounded bg-white dark:bg-[#0c1424] checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
            />
            <span className="material-symbols-outlined text-white text-[14px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
              check
            </span>
          </div>
          <label
            htmlFor="edu-current-modal"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
          >
            {t("modalEducation.iCurrentlyStudyHere")}
          </label>
        </div>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   5) ProjectModal
   ═════════════════════════════════════════════════════════════════════ */
export function ProjectModal({ open = true, onClose, initialData, onSaved }) {
  const { t } = useTranslation();
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    title: "",
    technologiesUsed: "",
    description: "",
    projectLink: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: initialData?.title || "",
        technologiesUsed: initialData?.technologiesUsed || "",
        description: initialData?.description || "",
        projectLink: initialData?.projectLink || "",
      });
    }
  }, [open, initialData]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!form.title.trim()) {
      alertError(t("modalProject.titleAdd"), t("modalProject.missingFields"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        technologiesUsed: form.technologiesUsed?.trim() || null,
        description: form.description?.trim() || null,
        projectLink: form.projectLink?.trim() || null,
      };
      if (isEdit) {
        await wizardService.updateProject(initialData.id, payload);
      } else {
        await wizardService.addProject(payload);
      }
      toastSuccess(t("dashboard.alerts.saved"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      alertError(t("modal.save"), extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("modalProject.titleEdit") : t("modalProject.titleAdd")}
      description={t("modalProject.desc")}
      icon="rocket_launch"
      size="lg"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={submit}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="w-full sm:col-span-2">
          <label className={labelClass}>{t("modalProject.title")}</label>
          <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalProject.technologiesUsed")}</label>
          <input
            className={inputClass}
            value={form.technologiesUsed}
            onChange={(e) => update("technologiesUsed", e.target.value)}
            placeholder="React, Node.js, MongoDB"
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalProject.projectLink")}</label>
          <input
            className={inputClass}
            value={form.projectLink}
            onChange={(e) => update("projectLink", e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
        <div className="w-full sm:col-span-2">
          <label className={labelClass}>{t("modalProject.description")}</label>
          <textarea
            className={baseInputClass + " min-h-[160px] resize-none py-3 custom-scrollbar leading-relaxed"}
            placeholder={t("modalProject.descriptionPlaceholder", "Describe what the project does, your role, and the impact it had...")}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   6) CertificateModal
   ═════════════════════════════════════════════════════════════════════ */
export function CertificateModal({ open = true, onClose, initialData, onSaved }) {
  const { t } = useTranslation();
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    title: "",
    issuingOrganization: "",
    issueDate: "",
    expirationDate: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: initialData?.title || "",
        issuingOrganization: initialData?.issuingOrganization || "",
        issueDate: initialData?.issueDate ? initialData.issueDate.split("T")[0] : "",
        expirationDate: initialData?.expirationDate ? initialData.expirationDate.split("T")[0] : "",
      });
    }
  }, [open, initialData]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!form.title.trim() || !form.issuingOrganization.trim()) {
      alertError(t("modalCertificate.titleAdd"), t("modalCertificate.missingFields"));
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("Title", form.title.trim());
      formData.append("IssuingOrganization", form.issuingOrganization.trim());
      if (form.issueDate) formData.append("IssueDate", form.issueDate);
      if (form.expirationDate) formData.append("ExpirationDate", form.expirationDate);
      if (isEdit) {
        await wizardService.updateCertificate(initialData.id, formData);
      } else {
        await wizardService.addCertificate(formData);
      }
      toastSuccess(t("dashboard.alerts.saved"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      alertError(t("modal.save"), extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("modalCertificate.titleEdit") : t("modalCertificate.titleAdd")}
      description={t("modalCertificate.desc")}
      icon="workspace_premium"
      size="lg"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={submit}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="w-full sm:col-span-2">
          <label className={labelClass}>{t("modalCertificate.name")}</label>
          <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="w-full sm:col-span-2">
          <label className={labelClass}>{t("modalCertificate.issuer")}</label>
          <input className={inputClass} value={form.issuingOrganization} onChange={(e) => update("issuingOrganization", e.target.value)} />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalCertificate.issueDate")}</label>
          <input
            className={inputClass}
            type="date"
            value={form.issueDate}
            onChange={(e) => update("issueDate", e.target.value)}
          />
        </div>
        <div className="w-full">
          <label className={labelClass}>{t("modalCertificate.expiryDate")}</label>
          <input
            className={inputClass}
            type="date"
            value={form.expirationDate}
            onChange={(e) => update("expirationDate", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   7) SkillsModal — multi-select chips
   ═════════════════════════════════════════════════════════════════════ */
export function SkillsModal({ open = true, onClose, initialSkills = [], onSaved }) {
  const { t } = useTranslation();
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(initialSkills.map((s) => s.id));
    const load = async () => {
      try {
        const res = await wizardService.getAvailableSkills();
        setAvailable(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to load available skills", err);
      }
    };
    load();
  }, [open, initialSkills]);

  const filtered = useMemo(() => {
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter((s) => s.name.toLowerCase().includes(q));
  }, [available, search]);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 25) {
        alertError(t("dashboard.alerts.skillLimitReached"), t("dashboard.alerts.maxSkillsMsg"));
        return prev;
      }
      return [...prev, id];
    });
  };

  const submit = async () => {
    setSaving(true);
    try {
      await wizardService.updateSkills(selected);
      toastSuccess(t("dashboard.alerts.saved"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      alertError(t("modal.save"), extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modalSkills.title")}
      description={t("modalSkills.desc")}
      icon="psychology"
      size="lg"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={submit}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      {/* Search */}
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          search
        </span>
        <input
          type="text"
          className={inputClass + " ps-9 w-full"}
          placeholder={t("dashboard.alerts.searchSkills")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Available skills (addable) */}
      <div className="mb-5">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          {t("modalSkills.title")}
        </p>
        {filtered.filter((s) => !selected.includes(s.id)).length === 0 ? (
          <div className="p-6 text-center text-sm font-medium text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-400/[.14] rounded-xl">
            {search
              ? `${t("modalSkills.noSkillsFound")} "${search}"`
              : t("modalSkills.allSkillsSelected")}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered
              .filter((s) => !selected.includes(s.id))
              .map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggle(skill.id)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-400/[.14] text-slate-700 dark:text-slate-300 text-[13px] font-medium hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all"
                >
                  <span className="material-symbols-outlined text-[14px] text-slate-400 group-hover:text-blue-500">
                    add
                  </span>
                  {skill.name}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Selected skills — subtle blue-tint dark style matching the
          pre-update Step-3 wizard and the Tests module aesthetic.
          The blue tint clearly distinguishes "selected" from the
          neutral outlined "addable" chips above. */}
      {selected.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t("dashboard.alerts.selectedSkills")} ({selected.length})
            </p>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20"
            >
              <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
              {t("dashboard.alerts.clearAll")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const skill = available.find((s) => s.id === id);
              if (!skill) return null;
              return (
                <div
                  key={id}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50/80 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium shadow-sm"
                >
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="rounded-md p-0.5 ms-0.5 flex items-center justify-center text-blue-400 dark:text-blue-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title={`Remove ${skill.name}`}
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   8) SocialLinksModal
   ═════════════════════════════════════════════════════════════════════ */
const SOCIAL_FIELDS = [
  { key: "linkedIn", label: "LinkedIn", faClass: "fa-brands fa-linkedin-in", brandColor: "#0A66C2", placeholder: "https://linkedin.com/in/your-profile" },
  { key: "github", label: "GitHub", faClass: "fa-brands fa-github", brandColor: "#6e40c9", brandColorDark: "#e6edf3", placeholder: "https://github.com/your-username" },
  { key: "behance", label: "Behance", faClass: "fa-brands fa-behance", brandColor: "#1769FF", placeholder: "https://behance.net/your-profile" },
  { key: "dribbble", label: "Dribbble", faClass: "fa-brands fa-dribbble", brandColor: "#EA4C89", placeholder: "https://dribbble.com/your-username" },
  { key: "personalWebsite", label: "Personal Website", faClass: "fa-solid fa-globe", brandColor: "#6366f1", placeholder: "https://your-website.com" },
];

/* ═════════════════════════════════════════════════════════════════════
   8) CompanyLinksModal — Website + LinkedIn for recruiter dashboard
   ═════════════════════════════════════════════════════════════════════ */
export function CompanyLinksModal({ open = true, onClose, initialData, saving, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ website: "", linkedin: "" });

  useEffect(() => {
    if (open) {
      setForm({
        website: initialData?.website || "",
        linkedin: initialData?.linkedin || "",
      });
    }
  }, [open, initialData]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modalCompanyLinks.title", "Website & LinkedIn")}
      description={t("modalCompanyLinks.desc", "Update your company's website and LinkedIn page.")}
      icon="link"
      size="md"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={() => onSubmit?.(form)}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className={labelClass}>{t("modalCompanyLinks.website", "Website")}</label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2">
              <i className="fa-solid fa-globe text-[18px]" style={{ color: "#6366f1" }} />
            </span>
            <input
              type="url"
              className={inputClass + " ps-10"}
              placeholder="https://your-company.com"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>LinkedIn</label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2">
              <i className="fa-brands fa-linkedin-in text-[18px]" style={{ color: "#0A66C2" }} />
            </span>
            <input
              type="url"
              className={inputClass + " ps-10"}
              placeholder="https://linkedin.com/company/your-company"
              value={form.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   9) CompanyDescriptionModal — textarea for recruiter description
   ═════════════════════════════════════════════════════════════════════ */
export function CompanyDescriptionModal({ open = true, onClose, initialData, saving, onSubmit }) {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) setDescription(initialData?.companyDescription || "");
  }, [open, initialData]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modalCompanyDesc.title", "Company Description")}
      description={t("modalCompanyDesc.desc", "Describe your company to potential candidates.")}
      icon="info"
      size="md"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={() => onSubmit?.({ companyDescription: description.trim() })}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div>
        <label className={labelClass}>
          {t("modalCompanyDesc.description", "Description")}{" "}
          <span className="text-slate-400 font-normal text-xs">{t("modalCompanyDesc.maxChars", "Max 500 characters")}</span>
        </label>
        <textarea
          className={baseInputClass + " min-h-[180px] resize-none py-3 custom-scrollbar leading-relaxed"}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-[11px] text-slate-400 text-end mt-1.5 font-medium">
          {description.length}/500
        </p>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   10) IndustryModal — SearchableSelect for industry field
   ═════════════════════════════════════════════════════════════════════ */
export function IndustryModal({ open = true, onClose, initialData, saving, onSubmit }) {
  const { t, i18n } = useTranslation();
  const [industry, setIndustry] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!open) return;
    setIndustry(initialData?.industry || "");
    const load = async () => {
      try {
        const res = await wizardService.getIndustries(i18n.language);
        const list = res.data?.data || res.data || [];
        setOptions(list.map((item) => ({ value: item.name, label: item.name })));
      } catch { /* non-fatal */ }
    };
    load();
  }, [open, initialData, i18n.language]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modalIndustry.title", "Edit Industry")}
      description={t("modalIndustry.desc", "Select the industry that best describes your company.")}
      icon="apartment"
      size="md"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={() => onSubmit?.({ industry: industry || null })}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div>
        <label className={labelClass}>{t("modalIndustry.industry", "Industry")}</label>
        <SearchableSelect
          options={options}
          value={industry}
          onChange={setIndustry}
          placeholder={t("modalIndustry.selectIndustry", "Select industry")}
          searchPlaceholder={t("modalIndustry.searchIndustry", "Search industries...")}
        />
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   11) CompanySizeModal — SearchableSelect for company size field
   ═════════════════════════════════════════════════════════════════════ */
export function CompanySizeModal({ open = true, onClose, initialData, saving, onSubmit }) {
  const { t, i18n } = useTranslation();
  const [companySize, setCompanySize] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!open) return;
    setCompanySize(initialData?.companySize || "");
    const load = async () => {
      try {
        const res = await wizardService.getCompanySizes(i18n.language);
        const list = res.data?.data || res.data || [];
        setOptions(list.map((item) => ({ value: item.value, label: item.label })));
      } catch { /* non-fatal */ }
    };
    load();
  }, [open, initialData, i18n.language]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modalCompanySize.title", "Edit Company Size")}
      description={t("modalCompanySize.desc", "Select the size range that best represents your company.")}
      icon="group"
      size="md"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={() => onSubmit?.({ companySize: companySize || null })}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div>
        <label className={labelClass}>{t("modalCompanySize.companySize", "Company Size")}</label>
        <SearchableSelect
          options={options}
          value={companySize}
          onChange={setCompanySize}
          placeholder={t("modalCompanySize.selectSize", "Select company size")}
          searchPlaceholder={t("modalCompanySize.searchSize", "Search sizes...")}
        />
      </div>
    </Modal>
  );
}

export function SocialLinksModal({ open = true, onClose, initialData, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        linkedIn: initialData?.linkedIn || "",
        github: initialData?.github || "",
        behance: initialData?.behance || "",
        dribbble: initialData?.dribbble || "",
        personalWebsite: initialData?.personalWebsite || "",
      });
    }
  }, [open, initialData]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      SOCIAL_FIELDS.forEach((f) => {
        const val = form[f.key]?.trim();
        if (val) payload[f.key] = val;
      });
      await wizardService.updateSocialAccounts(payload);
      toastSuccess(t("dashboard.alerts.saved"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      alertError(t("dashboard.alerts.saveFailed"), extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("dashboard.section.socialLinks")}
      description={t("modalSocial.desc")}
      icon="share"
      size="md"
      footer={
        <>
          <CancelButton onClick={onClose}>{t("modal.cancel")}</CancelButton>
          <PrimaryButton loading={saving} onClick={handleSave}>
            {t("modal.save")}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {SOCIAL_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className={labelClass}>{t(`step3.social.${field.key}`, field.label)}</label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2">
                <i className={`${field.faClass} text-[18px]`} style={{ color: field.brandColor }} />
              </span>
              <input
                type="url"
                className={inputClass + " ps-10"}
                placeholder={t(`step3.socialPlaceholder.${field.key}`, field.placeholder)}
                value={form[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
