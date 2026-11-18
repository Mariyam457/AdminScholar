'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const DEGREE_OPTIONS = [
  { id: 'bachelors', label: 'Bachelors' },
  { id: 'masters', label: 'Masters' },
  { id: 'phd', label: 'PhD' },
  { id: 'internship', label: 'Internship / Practical Training' },
  { id: 'postdoc', label: 'Post-Doctoral' },
  { id: 'certificate', label: 'Certificate / Diploma' },
  { id: 'other', label: 'Other' },
];

const FUNDING_OPTIONS = [
  { id: 'full_funding', label: 'Fully Funded (Tuition + Stipend + Travel)' },
  { id: 'tuition_only', label: 'Tuition Fee Waiver Only' },
  { id: 'stipend_only', label: 'Monthly Stipend Only' },
  { id: 'partial', label: 'Partial Funding / Contribution' },
  { id: 'grant', label: 'One-time Research Grant' },
];

export default function OpportunityModal({ isOpen, onClose, initialData, defaultType = 'scholarship', onSaved }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [opportunityType, setOpportunityType] = useState('scholarship');
  const [hostCountries, setHostCountries] = useState('GB');
  const [overview, setOverview] = useState('');
  const [description, setDescription] = useState('');
  const [degreeLevels, setDegreeLevels] = useState(['masters']);
  const [fieldsOfStudy, setFieldsOfStudy] = useState('Computer Science, Engineering, Business');
  const [fundingType, setFundingType] = useState('full_funding');
  
  // Funding breakdown
  const [tuitionCovered, setTuitionCovered] = useState(true);
  const [stipendProvided, setStipendProvided] = useState(true);
  const [stipendAmount, setStipendAmount] = useState('1450');
  const [stipendCurrency, setStipendCurrency] = useState('GBP');
  const [flightTickets, setFlightTickets] = useState(true);
  const [healthInsurance, setHealthInsurance] = useState(true);
  const [visaFeesCovered, setVisaFeesCovered] = useState(true);

  // Deadlines
  const [deadline, setDeadline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [isRolling, setIsRolling] = useState(false);

  // Eligibility
  const [minGpa, setMinGpa] = useState('3.0');
  const [gpaScale, setGpaScale] = useState('4.0');
  const [englishTest, setEnglishTest] = useState('IELTS');
  const [englishMinScore, setEnglishMinScore] = useState('6.5');
  const [eligibleNationalities, setEligibleNationalities] = useState('ALL');

  // Source attribution
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [forceRestoreLink, setForceRestoreLink] = useState(false);

  // Fetch sources for dropdown
  useEffect(() => {
    if (isOpen) {
      api.getSources()
        .then((res) => {
          const list = res?.data?.sources || [];
          setSources(list);
          if (list.length > 0 && !selectedSourceId && !initialData) {
            setSelectedSourceId(list[0]._id);
            setSourceName(list[0].name);
            setOfficialUrl(list[0].officialUrl || 'https://');
            setApplicationUrl(list[0].targetScholarshipUrl || list[0].officialUrl || 'https://');
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Populate if editing or reset if adding
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setForceRestoreLink(false);
    if (initialData) {
      setTitle(initialData.title || '');
      setProvider(initialData.provider || '');
      setHostCountries((initialData.hostCountries || []).join(', '));
      setOverview(initialData.overview || '');
      setDescription(initialData.description || '');
      setDegreeLevels(initialData.degreeLevels || ['masters']);
      setFieldsOfStudy((initialData.fieldsOfStudy || []).join(', '));
      setFundingType(initialData.fundingType || 'full_funding');

      const fb = initialData.fundingBreakdown || {};
      setTuitionCovered(!!fb.tuitionCovered);
      setStipendProvided(!!fb.livingStipend?.provided);
      setStipendAmount(fb.livingStipend?.amount ? String(fb.livingStipend.amount) : '');
      setStipendCurrency(fb.livingStipend?.currency || 'USD');
      setFlightTickets(!!fb.travelAllowance?.flightTicketsProvided);
      setHealthInsurance(!!fb.healthInsurance);
      setVisaFeesCovered(!!fb.visaFeesCovered);

      if (initialData.deadlines?.applicationDeadline) {
        const d = new Date(initialData.deadlines.applicationDeadline);
        setDeadline(d.toISOString().split('T')[0]);
      }
      if (initialData.deadlines?.applicationStart) {
        const d = new Date(initialData.deadlines.applicationStart);
        setStartDate(d.toISOString().split('T')[0]);
      }
      setAcademicYear(initialData.deadlines?.academicYear || '2026/2027');
      setIsRolling(!!initialData.deadlines?.isRolling);

      const el = initialData.eligibility || {};
      setMinGpa(el.minGpa ? String(el.minGpa) : '3.0');
      setGpaScale(el.gpaScale ? String(el.gpaScale) : '4.0');
      setEligibleNationalities((el.eligibleNationalities || ['ALL']).join(', '));

      const lr = (el.languageRequirements || [])[0];
      if (lr) {
        setEnglishTest(lr.test || 'IELTS');
        setEnglishMinScore(lr.minScore || '6.5');
      }

      const sa = initialData.sourceAttribution || {};
      setSelectedSourceId(sa.sourceId?._id || sa.sourceId || '');
      setSourceName(sa.sourceName || '');
      setOfficialUrl(sa.officialSourceUrl || '');
      setApplicationUrl(sa.applicationUrl || '');
      setIsFeatured(!!initialData.isFeatured);

      const isInt = (initialData.degreeLevels || []).includes('internship') || (initialData.tags || []).includes('internship');
      setOpportunityType(isInt ? 'internship' : 'scholarship');
    } else {
      // Adding new
      setOpportunityType(defaultType);
      if (defaultType === 'internship') {
        setTitle('Global Graduate Internship Program 2026');
        setProvider('International Research Institute');
        setDegreeLevels(['internship']);
        setOverview('Comprehensive paid internship opportunity with hands-on research and mentorship.');
        setDescription('This prestigious internship offers university students and recent graduates real-world practical experience, weekly stipends, travel assistance, and mentorship.');
        setFundingType('stipend_only');
        setTuitionCovered(false);
        setStipendProvided(true);
        setStipendAmount('1200');
        setStipendCurrency('EUR');
      } else {
        setTitle('');
        setProvider('');
        setDegreeLevels(['masters']);
        setOverview('');
        setDescription('');
        setFundingType('full_funding');
        setTuitionCovered(true);
        setStipendProvided(true);
        setStipendAmount('1500');
        setStipendCurrency('GBP');
      }
      const defaultFutureDate = new Date();
      defaultFutureDate.setMonth(defaultFutureDate.getMonth() + 4);
      setDeadline(defaultFutureDate.toISOString().split('T')[0]);
    }
  }, [isOpen, initialData, defaultType]);

  const toggleDegree = (deg) => {
    if (degreeLevels.includes(deg)) {
      if (degreeLevels.length > 1) {
        setDegreeLevels(degreeLevels.filter((d) => d !== deg));
      }
    } else {
      setDegreeLevels([...degreeLevels, deg]);
    }
  };

  const handleSourceSelect = (e) => {
    const srcId = e.target.value;
    setSelectedSourceId(srcId);
    const found = sources.find((s) => s._id === srcId);
    if (found) {
      setSourceName(found.name);
      setOfficialUrl(found.officialUrl || '');
      setApplicationUrl(found.targetScholarshipUrl || found.officialUrl || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!title.trim() || title.trim().length < 5) {
        throw new Error('Title must be at least 5 characters long.');
      }
      if (!provider.trim() || provider.trim().length < 2) {
        throw new Error('Provider/University name is required.');
      }
      if (!overview.trim() || overview.trim().length < 10) {
        throw new Error('Overview must be at least 10 characters long.');
      }
      if (!description.trim() || description.trim().length < 20) {
        throw new Error('Full description must be at least 20 characters long.');
      }
      if (!deadline) {
        throw new Error('Application deadline date is required.');
      }

      const countriesArr = hostCountries
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);

      const fieldsArr = fieldsOfStudy
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const nationalitiesArr = eligibleNationalities
        .split(',')
        .map((n) => n.trim().toUpperCase())
        .filter(Boolean);

      // Make sure sourceId exists or default to first source
      let finalSourceId = selectedSourceId;
      let finalSourceName = sourceName;
      if (!finalSourceId && sources.length > 0) {
        finalSourceId = sources[0]._id;
        finalSourceName = sources[0].name;
      }

      if (!finalSourceId) {
        throw new Error('Please select an Official Source Attribution.');
      }

      const resolvedFields = fieldsArr.length > 0 ? fieldsArr : ['General Studies'];
      const parsedStipend =
        stipendProvided && stipendAmount !== '' && !Number.isNaN(Number(stipendAmount))
          ? Number(stipendAmount)
          : undefined;
      const parsedMinGpa =
        minGpa !== '' && !Number.isNaN(Number(minGpa)) ? Number(minGpa) : undefined;
      const parsedGpaScale =
        gpaScale !== '' && !Number.isNaN(Number(gpaScale)) ? Number(gpaScale) : 4.0;

      const payload = {
        title: title.trim(),
        provider: provider.trim(),
        hostCountries: countriesArr.length > 0 ? countriesArr : ['ALL'],
        overview: overview.trim(),
        description: description.trim(),
        degreeLevels,
        fieldsOfStudy: resolvedFields,
        fundingType,
        fundingBreakdown: {
          tuitionCovered,
          tuitionPercentage: tuitionCovered ? 100 : 0,
          livingStipend: {
            provided: stipendProvided,
            amount: parsedStipend,
            currency: stipendCurrency,
            frequency: 'monthly',
          },
          travelAllowance: {
            flightTicketsProvided: flightTickets,
          },
          healthInsurance,
          visaFeesCovered,
          booksAllowance: false,
        },
        eligibility: {
          minGpa: parsedMinGpa,
          gpaScale: parsedGpaScale,
          eligibleNationalities: nationalitiesArr.length > 0 ? nationalitiesArr : ['ALL'],
          degreeLevels,
          fieldsOfStudy: resolvedFields,
          languageRequirements: [
            {
              test: englishTest,
              minScore: englishMinScore,
            },
          ],
        },
        deadlines: {
          applicationDeadline: new Date(deadline),
          applicationStart: startDate ? new Date(startDate) : undefined,
          academicYear,
          isRolling,
        },
        sourceAttribution: {
          sourceId: String(finalSourceId),
          sourceName: finalSourceName || 'Official Direct Portal',
          officialSourceUrl: officialUrl.trim() || 'https://scholarbeacon.org',
          applicationUrl: applicationUrl.trim() || officialUrl.trim() || 'https://scholarbeacon.org',
          verificationMethod: 'official_portal',
        },
        ...(initialData?._id && forceRestoreLink
          ? { linkHealth: { isBroken: false, brokenReason: '' } }
          : {}),
        isFeatured,
        isActive: true,
        tags: opportunityType === 'internship' ? ['internship', 'training'] : ['scholarship', 'academic'],
      };

      if (initialData?._id) {
        const res = await api.updateScholarship(initialData._id, payload);
        if (res?.data?.scholarship?.linkHealth?.isBroken && !forceRestoreLink) {
          onSaved();
          setError(
            `Changes saved, but auto-verification still flagged a broken link (${res.data.scholarship.linkHealth.brokenReason || 'URL failed check'}). Update the failing URL or check "Force mark link as verified" below to restore visibility.`
          );
          return;
        }
      } else {
        await api.createScholarship(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      const detailsText =
        Array.isArray(err.details) && err.details.length > 0
          ? ` (${err.details.map((d) => `${d.field}: ${d.message}`).join(', ')})`
          : '';
      setError(`${err.message || 'Failed to save opportunity'}${detailsText}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div>
            <h2>{initialData ? 'Edit Opportunity' : `Add New ${opportunityType === 'internship' ? 'Internship' : 'Scholarship'}`}</h2>
            <p>Fill out the official details according to the platform database schema.</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div className="modal-body">
            {initialData?.linkHealth?.isBroken && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <strong>Currently Hidden from Student Mobile App:</strong>{' '}
                  {initialData.linkHealth.brokenReason || 'The official URL failed verification.'}
                  {initialData.linkHealth.checkedUrl && (
                    <div style={{ fontSize: '12px', marginTop: '4px', wordBreak: 'break-all' }}>
                      <strong>Failing URL:</strong> <code>{initialData.linkHealth.checkedUrl}</code>
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    <input
                      type="checkbox"
                      checked={forceRestoreLink}
                      onChange={(e) => setForceRestoreLink(e.target.checked)}
                    />
                    <span>Force mark link as verified &amp; restore to mobile app immediately</span>
                  </label>
                </div>
              </div>
            )}
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Type Selector (Scholarship vs Internship) */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">Opportunity Classification</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpportunityType('scholarship');
                    if (!degreeLevels.includes('masters')) setDegreeLevels(['masters']);
                  }}
                  className={`btn ${opportunityType === 'scholarship' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Scholarship / Degree Program
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpportunityType('internship');
                    setDegreeLevels(['internship']);
                  }}
                  className={`btn ${opportunityType === 'internship' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Internship / Practical Training
                </button>
              </div>
            </div>

            {/* Row 1: Title & Provider */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Opportunity Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Chevening Scholarships 2026 or CERN Research Internship"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Provider / Body *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. UK Foreign Commonwealth Office / CERN"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Host Countries & Academic Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Host Destination Countries (ISO Codes, comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. GB, DE, US, FR, CH"
                  value={hostCountries}
                  onChange={(e) => setHostCountries(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Academic Intake Year</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="2026/2027"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>
            </div>

            {/* Degree Levels (Multi-select pills) */}
            <div className="form-group">
              <label className="form-label">Target Degree / Program Levels *</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DEGREE_OPTIONS.map((deg) => {
                  const active = degreeLevels.includes(deg.id);
                  return (
                    <button
                      type="button"
                      key={deg.id}
                      onClick={() => toggleDegree(deg.id)}
                      className={`badge ${active ? 'badge-blue' : 'badge-gray'}`}
                      style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '13px' }}
                    >
                      {active && <Check size={13} style={{ marginRight: '4px' }} />}
                      {deg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Funding Type */}
            <div className="form-group">
              <label className="form-label">Funding Type Coverage *</label>
              <select className="form-control" value={fundingType} onChange={(e) => setFundingType(e.target.value)}>
                {FUNDING_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Funding Breakdown */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>
                Financial Coverage & Allowances
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tuitionCovered}
                    onChange={(e) => setTuitionCovered(e.target.checked)}
                  />
                  <span>100% Tuition Covered</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={flightTickets}
                    onChange={(e) => setFlightTickets(e.target.checked)}
                  />
                  <span>Return Airfare Provided</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={healthInsurance}
                    onChange={(e) => setHealthInsurance(e.target.checked)}
                  />
                  <span>Health Insurance</span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Monthly Living Stipend?</label>
                  <select
                    className="form-control"
                    value={stipendProvided ? 'yes' : 'no'}
                    onChange={(e) => setStipendProvided(e.target.value === 'yes')}
                  >
                    <option value="yes">Yes, Stipend Provided</option>
                    <option value="no">No Stipend</option>
                  </select>
                </div>
                {stipendProvided && (
                  <>
                    <div>
                      <label className="form-label" style={{ fontSize: '12px' }}>Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="1400"
                        value={stipendAmount}
                        onChange={(e) => setStipendAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '12px' }}>Currency</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="GBP / EUR / USD"
                        value={stipendCurrency}
                        onChange={(e) => setStipendCurrency(e.target.value.toUpperCase())}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Deadlines */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Application Deadline *</label>
                <input
                  type="date"
                  className="form-control"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Admissions Style</label>
                <select
                  className="form-control"
                  value={isRolling ? 'rolling' : 'fixed'}
                  onChange={(e) => setIsRolling(e.target.value === 'rolling')}
                >
                  <option value="fixed">Fixed Official Deadline</option>
                  <option value="rolling">Rolling Admissions (All Year)</option>
                </select>
              </div>
            </div>

            {/* Academic Eligibility */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Minimum CGPA Required</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="3.0"
                  value={minGpa}
                  onChange={(e) => setMinGpa(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">English Test</label>
                <select className="form-control" value={englishTest} onChange={(e) => setEnglishTest(e.target.value)}>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="DUOLINGO">Duolingo</option>
                  <option value="NONE">Not Required / Waived</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Min English Score</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="6.5 or 90"
                  value={englishMinScore}
                  onChange={(e) => setEnglishMinScore(e.target.value)}
                />
              </div>
            </div>

            {/* Overview & Description */}
            <div className="form-group">
              <label className="form-label">Brief Overview / Highlight (1-2 sentences) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Prestigious UK government award for emerging global leaders."
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Comprehensive Description *</label>
              <textarea
                className="form-control"
                placeholder="Include eligibility criteria, application process, and documentation guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Source Attribution */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>
                Official Source & Direct Application URLs
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px' }}>Attributed Official Source Body</label>
                <select className="form-control" value={selectedSourceId} onChange={handleSourceSelect}>
                  {sources.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.organization})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Official Portal Info URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Direct Student Application URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={applicationUrl}
                    onChange={(e) => setApplicationUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{initialData ? 'Update Opportunity' : 'Save & Publish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

