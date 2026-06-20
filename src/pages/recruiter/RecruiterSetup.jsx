import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSetupNavbar from '../../Components/ProfileSetupNavbar.jsx';
import wizardService from '../../api/wizardService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toastSuccess, alertError } from '../../lib/alerts.js';
import { extractError } from '../../utils/extractError.js';
import { useTranslation } from 'react-i18next';
import SearchableSelect from '../../Components/SearchableSelect.jsx';

const RecruiterSetup = () => {
    const { t, i18n } = useTranslation();
    const companySizeOptions = [
        { value: '1-10', label: t('recruiterSetup.sizeOptions.1-10') },
        { value: '11-50', label: t('recruiterSetup.sizeOptions.11-50') },
        { value: '51-200', label: t('recruiterSetup.sizeOptions.51-200') },
        { value: '201-500', label: t('recruiterSetup.sizeOptions.201-500') },
        { value: '501-1000', label: t('recruiterSetup.sizeOptions.501-1000') },
        { value: '1000+', label: t('recruiterSetup.sizeOptions.1000+') },
    ];
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    const [form, setForm] = useState({
        companyName: '',
        companySize: '',
        industry: '',
        countryId: '',
        cityId: '',
        website: '',
        linkedIn: '',
        companyDescription: '',
    });

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [err, setErr] = useState('');

    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [countriesRes, industriesRes] = await Promise.all([
                    wizardService.getCountries(i18n.language),
                    wizardService.getIndustries(),
                ]);

                setCountries(countriesRes.data?.data || countriesRes.data || []);
                setIndustries(industriesRes.data?.data || industriesRes.data || []);

                // Try to load existing company info
                try {
                    const infoRes = await wizardService.getCompanyInfo();
                    const info = infoRes.data?.data || infoRes.data;
                    if (info && info.companyName && info.companyName !== 'Not Specified') {
                        setForm({
                            companyName: info.companyName || '',
                            companySize: info.companySize || '',
                            industry: info.industry || '',
                            countryId: info.countryId?.toString() || '',
                            cityId: info.cityId?.toString() || '',
                            website: info.website || '',
                            linkedIn: info.linkedIn || '',
                            companyDescription: info.companyDescription || '',
                        });

                        if (info.countryId) {
                            setIsCitiesLoading(true);
                            try {
                                const citiesRes = await wizardService.getCities(info.countryId, i18n.language);
                                setCities(citiesRes.data?.data || citiesRes.data || []);
                            } catch (e) {
                                console.error('Failed to load cities for saved profile', e);
                            } finally {
                                setIsCitiesLoading(false);
                            }
                        }
                    }
                } catch {
                    // No existing info, form stays with defaults
                }
            } catch (ex) {
                console.error('Failed to load reference data', ex);
                setErr(t('recruiterSetup.alerts.loadError', 'Failed to load form data. Please refresh the page.'));
            } finally {
                setDataLoading(false);
            }
        };
        loadData();
    }, [i18n.language]);

    const handleChange = async (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));

        if (field === 'countryId') {
            setForm(prev => ({ ...prev, cityId: '' }));
            if (!value) {
                setCities([]);
                return;
            }
            setIsCitiesLoading(true);
            try {
                const res = await wizardService.getCities(value, i18n.language);
                setCities(res.data?.data || res.data || []);
            } catch (ex) {
                console.error('Failed to fetch cities', ex);
            } finally {
                setIsCitiesLoading(false);
            }
        }
    };

    const handleSubmit = async () => {
        setErr('');
        setLoading(true);

        // Basic validation
        if (!form.companyName.trim() || form.companyName.trim().length < 2) {
            alertError(t('recruiterSetup.alerts.validationError', 'Validation Error'), t('recruiterSetup.alerts.companyNameRequired', 'Company name must be at least 2 characters'));
            setLoading(false);
            return;
        }
        if (!form.companySize) {
            alertError(t('recruiterSetup.alerts.validationError', 'Validation Error'), t('recruiterSetup.alerts.companySizeRequired', 'Please select a company size'));
            setLoading(false);
            return;
        }
        if (!form.industry) {
            alertError(t('recruiterSetup.alerts.validationError', 'Validation Error'), t('recruiterSetup.alerts.industryRequired', 'Please select an industry'));
            setLoading(false);
            return;
        }
        if (!form.countryId) {
            alertError(t('recruiterSetup.alerts.validationError', 'Validation Error'), t('recruiterSetup.alerts.countryRequired', 'Please select a country'));
            setLoading(false);
            return;
        }
        if (!form.cityId) {
            alertError(t('recruiterSetup.alerts.validationError', 'Validation Error'), t('recruiterSetup.alerts.cityRequired', 'Please select a city'));
            setLoading(false);
            return;
        }

        const payload = {
            companyName: form.companyName.trim(),
            companySize: form.companySize,
            industry: form.industry,
            countryId: parseInt(form.countryId) || 0,
            cityId: parseInt(form.cityId) || 0,
            website: form.website?.trim() || null,
            linkedIn: form.linkedIn?.trim() || null,
            companyDescription: form.companyDescription?.trim() || null,
        };

        try {
            await wizardService.saveCompanyInfo(payload);

            // Update local auth state so the wizard guard redirects correctly
            updateUser({ profileCompletionStep: 1 });

            toastSuccess(t('recruiterSetup.alerts.saved', 'Company information saved successfully'));
            navigate('/hr');
        } catch (ex) {
            const msg = extractError(ex);
            setErr(msg);
            alertError(t('recruiterSetup.alerts.saveFailed', 'Save Failed'), msg);
        } finally {
            setLoading(false);
        }
    };

    const baseInputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm";
    const inputClass = baseInputClass + " h-12";
    const labelClass = "block text-[13.5px] font-medium text-slate-700 dark:text-slate-300 mb-2 tracking-wide";

    if (dataLoading) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display antialiased min-h-screen flex flex-col">
                <ProfileSetupNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-4xl animate-spin">progress_activity</span>
                        <p className="text-slate-600 dark:text-slate-400">{t('recruiterSetup.loading', 'Loading...')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display antialiased min-h-screen flex flex-col transition-colors duration-200">
            <ProfileSetupNavbar />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-8 text-start">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                        {t('recruiterSetup.title', 'Company Information')}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                        {t('recruiterSetup.desc', 'Tell us about your company to complete your profile setup.')}
                    </p>
                </div>

                {err && (
                    <div className="text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg mb-6">
                        {err}
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                        {/* Company Name */}
                        <div className="sm:col-span-2">
                            <label className={labelClass}>{t('recruiterSetup.companyName', 'Company Name')}<span className="text-red-500 ms-1">*</span></label>
                            <input
                                className={inputClass}
                                type="text"
                                placeholder={t('recruiterSetup.companyNamePlaceholder', 'e.g. Acme Corporation')}
                                value={form.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                                maxLength={150}
                            />
                        </div>

                        {/* Industry */}
                        <div>
                            <label className={labelClass}>{t('recruiterSetup.industry', 'Industry')}<span className="text-red-500 ms-1">*</span></label>
                            <SearchableSelect
                                options={industries.map(i => ({ value: i.name, label: i.name }))}
                                value={form.industry}
                                onChange={(val) => handleChange('industry', val)}
                                placeholder={t('recruiterSetup.selectIndustry', 'Select Industry')}
                                searchPlaceholder={t('recruiterSetup.search', 'Search...')}
                            />
                        </div>

                        {/* Company Size */}
                        <div>
                            <label className={labelClass}>{t('recruiterSetup.companySize', 'Company Size')}<span className="text-red-500 ms-1">*</span></label>
                            <SearchableSelect
                                options={companySizeOptions}
                                value={form.companySize}
                                onChange={(val) => handleChange('companySize', val)}
                                placeholder={t('recruiterSetup.selectSize', 'Select Company Size')}
                                searchPlaceholder={t('recruiterSetup.search', 'Search...')}
                            />
                        </div>

                        {/* Country */}
                        <div>
                            <label className={labelClass}>{t('recruiterSetup.country', 'Country')}<span className="text-red-500 ms-1">*</span></label>
                            <SearchableSelect
                                options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                                value={form.countryId?.toString() || ''}
                                onChange={(val) => handleChange('countryId', val)}
                                placeholder={t('recruiterSetup.selectCountry', 'Select Country')}
                                searchPlaceholder={t('recruiterSetup.search', 'Search...')}
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className={labelClass}>{t('recruiterSetup.city', 'City')}<span className="text-red-500 ms-1">*</span></label>
                            <SearchableSelect
                                options={cities.map(c => ({ value: c.id.toString(), label: c.name }))}
                                value={form.cityId?.toString() || ''}
                                onChange={(val) => handleChange('cityId', val)}
                                placeholder={isCitiesLoading ? t('recruiterSetup.loadingRegions', 'Loading...') : t('recruiterSetup.selectCity', 'Select City')}
                                searchPlaceholder={t('recruiterSetup.search', 'Search...')}
                                disabled={!form.countryId || isCitiesLoading}
                            />
                        </div>

                        {/* Website */}
                        <div className="sm:col-span-2">
                            <label className={labelClass}>{t('recruiterSetup.website', 'Website')}</label>
                            <input
                                className={inputClass}
                                type="url"
                                placeholder={t('recruiterSetup.websitePlaceholder', 'https://yourcompany.com')}
                                value={form.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                maxLength={300}
                            />
                        </div>

                        {/* LinkedIn */}
                        <div className="sm:col-span-2">
                            <label className={labelClass}>{t('recruiterSetup.linkedin', 'LinkedIn')}</label>
                            <input
                                className={inputClass}
                                type="url"
                                placeholder={t('recruiterSetup.linkedinPlaceholder', 'https://linkedin.com/company/your-company')}
                                value={form.linkedIn}
                                onChange={(e) => handleChange('linkedIn', e.target.value)}
                                maxLength={300}
                            />
                        </div>

                        {/* Company Description */}
                        <div className="sm:col-span-2">
                            <label className={labelClass}>{t('recruiterSetup.description', 'Company Description')} <span className="text-slate-400 font-normal text-xs">{t('recruiterSetup.maxChars', 'Max 500 characters')}</span></label>
                            <textarea
                                className={baseInputClass + " min-h-[160px] resize-none py-3 custom-scrollbar leading-relaxed"}
                                placeholder={t('recruiterSetup.descriptionPlaceholder', 'Brief description of your company...')}
                                maxLength={500}
                                value={form.companyDescription}
                                onChange={(e) => handleChange('companyDescription', e.target.value)}
                            />
                            <p className="text-[11px] text-slate-400 text-end mt-1.5 font-medium">{form.companyDescription.length}/500</p>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-700 flex justify-end gap-4 shadow-sm rounded-xl w-full mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                    >
                        {loading ? t('recruiterSetup.saving', 'Saving...') : t('recruiterSetup.saveAndContinue', 'Save & Continue')}
                        {!loading && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default RecruiterSetup;
