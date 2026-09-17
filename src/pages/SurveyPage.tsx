import { useState, useEffect, useMemo, type FormEvent } from 'react';
import Papa from 'papaparse';
import type { StudyMetadataDictionaryEntry } from '../types';
import { DATA_ROOT, BUCKET_URL } from '../constants/mapConfig';
import {
  SURVEY_FORM_VERSION,
  STANDARDS_KEY_PREFIX,
  visibleQuestionIds,
  type ChecklistAnswer,
} from '../constants/methodologicalStandards';
import MethodStandardsSection from '../components/MethodStandardsSection';
import './SurveyPage.css';

// ─── Config ───────────────────────────────────────────────────────────────────

const DICT_URL = `${DATA_ROOT}/data_inputs/dictionaries/study_metadata_dictionary.csv`;
const LOGO_URL = `${BUCKET_URL}/data_inputs/website_assets/wildmaps_logo.png`;
const SURVEY_API_URL: string = import.meta.env.VITE_SURVEY_API_URL ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PredictorEntry {
  name: string;
  resolution: string;
  units: 'km' | 'm' | 'other';
  otherUnit: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseChoices(raw: string): string[] {
  return raw.split(',').map((c) => c.trim()).filter(Boolean);
}

function groupBySection(entries: StudyMetadataDictionaryEntry[]): [string, StudyMetadataDictionaryEntry[]][] {
  const map = new Map<string, StudyMetadataDictionaryEntry[]>();
  for (const entry of entries) {
    const section = entry.section_name || 'General';
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(entry);
  }
  return Array.from(map.entries());
}

// ─── Sub-components for each question type ────────────────────────────────────

interface QuestionProps {
  entry: StudyMetadataDictionaryEntry;
  value: string;
  otherValue: string;
  showOther: boolean;
  onChange: (value: string) => void;
  onOtherChange: (value: string) => void;
  onShowOtherChange: (show: boolean) => void;
  // For 'choices' type: multi-select array
  multiValue?: string[];
  onMultiChange?: (values: string[]) => void;
  // For 'predictors' type
  predictorsValue?: PredictorEntry[];
  onPredictorsChange?: (entries: PredictorEntry[]) => void;
}

function StringQuestion({ entry, value, onChange }: Pick<QuestionProps, 'entry' | 'value' | 'onChange'>) {
  return (
    <textarea
      id={entry.metadata_key}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full"
    />
  );
}

function IntegerQuestion({ entry, value, otherValue, showOther, onChange, onOtherChange, onShowOtherChange }: QuestionProps) {
  return (
    <div className="space-y-2">
      {!showOther && (
        <input
          type="number"
          id={entry.metadata_key}
          value={value}
          min={0}
          step={1}
          onChange={(e) => onChange(e.target.value)}
          className="w-40"
        />
      )}
      <OtherToggle
        showOther={showOther}
        otherValue={otherValue}
        onShowOtherChange={onShowOtherChange}
        onOtherChange={onOtherChange}
      />
    </div>
  );
}

function ChoicesQuestion({ entry, otherValue, showOther, onOtherChange, onShowOtherChange, multiValue = [], onMultiChange = () => {} }: QuestionProps) {
  const choices = parseChoices(entry.choices);

  const toggleChoice = (choice: string) => {
    if (multiValue.includes(choice)) {
      onMultiChange(multiValue.filter((c) => c !== choice));
    } else {
      onMultiChange([...multiValue, choice]);
    }
  };

  return (
    <div className="space-y-1.5">
      {choices.map((choice) => (
        <label key={choice} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={multiValue.includes(choice)}
            onChange={() => toggleChoice(choice)}
            className=""
          />
          <span className="text-sm">{choice}</span>
        </label>
      ))}
      <div className="mt-2 space-y-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOther}
            onChange={(e) => onShowOtherChange(e.target.checked)}
            className=""
          />
          <span className="text-sm">Other</span>
        </label>
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder={showOther ? 'Please specify...' : 'Specify if selecting Other'}
          className="w-full"
          style={showOther ? undefined : { opacity: 0.5 }}
        />
      </div>
    </div>
  );
}

function RatioQuestion({ entry, value, otherValue, showOther, onChange, onOtherChange, onShowOtherChange }: QuestionProps) {
  const first = parseInt(value || '80');
  const second = isNaN(first) ? 20 : Math.max(0, Math.min(100, 100 - first));
  const parts = entry.metadata_name.split('--');
  const labelA = parts[0]?.trim() ?? 'Train';
  const labelB = parts[1]?.trim() ?? 'Test';

  const handleFirstChange = (raw: string) => {
    const n = parseInt(raw);
    if (isNaN(n)) { onChange(''); return; }
    onChange(String(Math.max(0, Math.min(100, n))));
  };

  return (
    <div className="space-y-2">
      {!showOther && (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">{labelA} %</span>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={value === '' ? '' : (isNaN(first) ? 80 : first)}
              onChange={(e) => handleFirstChange(e.target.value)}
              className="w-24 text-center"
            />
          </div>
          <span className="text-gray-400 mt-5">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">{labelB} %</span>
            <input
              type="number"
              value={second}
              readOnly
              className="w-24 text-center"
              style={{ opacity: 0.6 }}
            />
          </div>
        </div>
      )}
      <OtherToggle
        showOther={showOther}
        otherValue={otherValue}
        onShowOtherChange={onShowOtherChange}
        onOtherChange={onOtherChange}
      />
    </div>
  );
}

function OtherToggle({
  showOther,
  otherValue,
  onShowOtherChange,
  onOtherChange,
}: {
  showOther: boolean;
  otherValue: string;
  onShowOtherChange: (show: boolean) => void;
  onOtherChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showOther}
          onChange={(e) => onShowOtherChange(e.target.checked)}
          className=""
        />
        Other / not applicable
      </label>
      {showOther && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Please specify..."
          className="mt-2 w-full"
        />
      )}
    </div>
  );
}

function PredictorsQuestion({ entry, predictorsValue = [], onPredictorsChange = () => {} }: QuestionProps) {
  const updateEntry = (index: number, field: keyof PredictorEntry, value: string) => {
    const updated = [...predictorsValue];
    updated[index] = { ...updated[index], [field]: value };
    onPredictorsChange(updated);
  };

  const addEntry = () => {
    onPredictorsChange([...predictorsValue, { name: '', resolution: '', units: 'km', otherUnit: '' }]);
  };

  const removeEntry = (index: number) => {
    onPredictorsChange(predictorsValue.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {predictorsValue.map((predictor, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Predictor {index + 1}</span>
            {predictorsValue.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Name
            </label>
            <input
              type="text"
              value={predictor.name}
              onChange={(e) => updateEntry(index, 'name', e.target.value)}
              placeholder="e.g. Elevation"
              className="w-full"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">
                Spatial resolution
              </label>
              <input
                type="number"
                value={predictor.resolution}
                min={0}
                onChange={(e) => updateEntry(index, 'resolution', e.target.value)}
                placeholder="e.g. 90"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Units
              </label>
              <select
                value={predictor.units}
                onChange={(e) => updateEntry(index, 'units', e.target.value as PredictorEntry['units'])}
                className=""
              >
                <option value="km">km</option>
                <option value="m">m</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {predictor.units === 'other' && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Specify units
              </label>
              <input
                type="text"
                value={predictor.otherUnit}
                onChange={(e) => updateEntry(index, 'otherUnit', e.target.value)}
                placeholder="Please specify..."
                className="w-full"
              />
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="text-sm text-green-700 hover:text-green-900 font-medium flex items-center gap-1"
      >
        + Add predictor
      </button>
    </div>
  );
}

function QuestionBlock({ entry, value, otherValue, showOther, onChange, onOtherChange, onShowOtherChange, multiValue, onMultiChange, predictorsValue, onPredictorsChange }: QuestionProps) {
  const sharedProps = { entry, value, otherValue, showOther, onChange, onOtherChange, onShowOtherChange, multiValue, onMultiChange, predictorsValue, onPredictorsChange };

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <label htmlFor={entry.metadata_key} className="block font-medium text-gray-800 mb-1 text-sm">
        {entry.metadata_name}
      </label>
      {entry.form_prompt && (
        <p className="text-sm text-gray-500 mb-2">{entry.form_prompt}</p>
      )}
      {entry.form_type === 'string'     && <StringQuestion     {...sharedProps} />}
      {entry.form_type === 'integer'    && <IntegerQuestion    {...sharedProps} />}
      {entry.form_type === 'choices'    && <ChoicesQuestion    {...sharedProps} />}
      {entry.form_type === 'ratio'      && <RatioQuestion      {...sharedProps} />}
      {entry.form_type === 'predictors' && <PredictorsQuestion {...sharedProps} />}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SurveyPage() {
  const [dictionary, setDictionary]   = useState<StudyMetadataDictionaryEntry[]>([]);
  const [dictLoading, setDictLoading] = useState(true);
  const [dictError,   setDictError]   = useState<string | null>(null);

  // Fixed opening fields
  const [consent,        setConsent]        = useState(false);
  const [submitterName,  setSubmitterName]  = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [pubLink,        setPubLink]        = useState('');
  const [downloadUrl,    setDownloadUrl]    = useState('');

  // Dynamic fields: answers, "other" free-text, "show other" toggle
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [otherValues,   setOtherValues]   = useState<Record<string, string>>({});
  const [showOther,     setShowOther]     = useState<Record<string, boolean>>({});

  // Multi-select values for 'choices' type questions
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>({});

  // Structured predictor entries
  const [predictors, setPredictors] = useState<PredictorEntry[]>([
    { name: '', resolution: '', units: 'km', otherUnit: '' },
  ]);

  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Which page of the form is showing: 1 = study metadata, 2 = methodological standards
  const [page, setPage] = useState<1 | 2>(1);

  // Methodological standards checklist answers (separate feature — see constants/methodologicalStandards.ts)
  const [standardsAnswers, setStandardsAnswers] = useState<Record<string, ChecklistAnswer | undefined>>({});
  const setStandardsAnswer = (qid: string, value: ChecklistAnswer) =>
    setStandardsAnswers((p) => ({ ...p, [qid]: value }));

  // ── Fetch dictionary from S3 ───────────────────────────────────────────────

  useEffect(() => {
    fetch(DICT_URL)
      .then((r) => r.text())
      .then((text) => {
        Papa.parse<{ metadata_key: string; section_name: string; metadata_name: string; form_type: string; choices: string; form_prompt: string }>(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const entries = results.data
              .filter((row) => row.metadata_key)
              .map((row) => ({
                metadata_key: row.metadata_key,
                section_name: row.section_name ?? '',
                metadata_name: row.metadata_name ?? '',
                form_type: (row.form_type || 'string') as StudyMetadataDictionaryEntry['form_type'],
                choices: row.choices ?? '',
                form_prompt: row.form_prompt ?? '',
              }));

            // Seed ratio fields with default 80
            const ratioDefaults: Record<string, string> = {};
            entries.filter((e) => e.form_type === 'ratio').forEach((e) => {
              ratioDefaults[e.metadata_key] = '80';
            });
            setDynamicValues(ratioDefaults);
            setDictionary(entries);
            setDictLoading(false);
          },
          error: () => { setDictError('Failed to parse the metadata dictionary.'); setDictLoading(false); },
        });
      })
      .catch(() => { setDictError('Failed to load the metadata dictionary from S3.'); setDictLoading(false); });
  }, []);

  // ── Field helpers ─────────────────────────────────────────────────────────

  const setDynamic      = (key: string) => (val: string)    => setDynamicValues((p) => ({ ...p, [key]: val }));
  const setOther        = (key: string) => (val: string)    => setOtherValues((p)   => ({ ...p, [key]: val }));
  const setShowOtherKey = (key: string) => (show: boolean)  => setShowOther((p)     => ({ ...p, [key]: show }));
  const setMulti        = (key: string) => (vals: string[]) => setMultiValues((p)   => ({ ...p, [key]: vals }));

  // ── Build submission payload ───────────────────────────────────────────────

  const buildPayload = (): Record<string, string> => {
    const payload: Record<string, string> = {
      form_version:    SURVEY_FORM_VERSION,
      submitted_at:    new Date().toISOString(),
      submitter_name:  submitterName.trim(),
      submitter_email: submitterEmail.trim(),
      publication_link: pubLink.trim(),
      data_download_url: downloadUrl.trim(),
    };

    for (const entry of dictionary) {
      const key = entry.metadata_key;
      const isOther = showOther[key] ?? false;

      if (entry.form_type === 'choices') {
        const selected = [...(multiValues[key] ?? [])];
        if (isOther) {
          const otherText = (otherValues[key] ?? '').trim();
          if (otherText) selected.push(`Other: ${otherText}`);
        }
        payload[key] = selected.join(', ');
      } else if (entry.form_type === 'predictors') {
        const parts = predictors.map((p) => {
          const unit = p.units === 'other' ? p.otherUnit.trim() : p.units;
          return `${p.name.trim()} (${p.resolution.trim()} ${unit})`;
        });
        payload[key] = parts.join('; ');
      } else if (entry.form_type === 'ratio') {
        if (isOther) {
          payload[key] = otherValues[key] ?? '';
        } else {
          const first = parseInt(dynamicValues[key] || '80');
          const clamped = isNaN(first) ? 80 : Math.max(0, Math.min(100, first));
          payload[key] = `${clamped}:${100 - clamped}`;
        }
      } else if (entry.form_type !== 'string' && isOther) {
        payload[key] = otherValues[key] ?? '';
      } else {
        payload[key] = dynamicValues[key] ?? '';
      }
    }

    // Methodological standards answers — a separate feature from the study
    // metadata dictionary above. The calculated Gold/Silver/Bronze score is
    // intentionally NOT stored here, only the raw answers (it can be
    // recalculated downstream if the scoring rules change).
    for (const qid of visibleQuestionIds(standardsAnswers)) {
      payload[`${STANDARDS_KEY_PREFIX}${qid}`] = standardsAnswers[qid] ?? '';
    }

    return payload;
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const canSubmitPage1 = useMemo(() => {
    if (!consent) return false;
    if (!submitterName.trim() || !submitterEmail.trim() || !pubLink.trim() || !downloadUrl.trim()) return false;
    if (dictLoading || !!dictError) return false;

    for (const entry of dictionary) {
      const key = entry.metadata_key;
      const isOther = showOther[key] ?? false;

      if (entry.form_type === 'choices') {
        const selected = multiValues[key] ?? [];
        const hasAnySelection = selected.length > 0 || isOther;
        if (!hasAnySelection) return false;
        if (isOther && !(otherValues[key] ?? '').trim()) return false;
      } else if (entry.form_type === 'predictors') {
        if (predictors.length === 0) return false;
        for (const p of predictors) {
          if (!p.name.trim() || !p.resolution.trim()) return false;
          if (p.units === 'other' && !p.otherUnit.trim()) return false;
        }
      } else {
        const filled = isOther
          ? !!(otherValues[key] ?? '').trim()
          : !!(dynamicValues[key] ?? '').trim();
        if (!filled) return false;
      }
    }
    return true;
  }, [consent, submitterName, submitterEmail, pubLink, downloadUrl, dictionary, dynamicValues, otherValues, showOther, multiValues, predictors, dictLoading, dictError]);

  const canSubmitPage2 = useMemo(() => {
    const visible = visibleQuestionIds(standardsAnswers);
    return visible.length > 0 && visible.every((qid) => !!standardsAnswers[qid]);
  }, [standardsAnswers]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmitPage1 || !canSubmitPage2) return;

    if (!SURVEY_API_URL) {
      setSubmitError('Submission endpoint is not configured. Please contact the WildMaps team directly.');
      setSubmitState('error');
      return;
    }

    setSubmitState('submitting');
    setSubmitError(null);

    try {
      const res = await fetch(SURVEY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setSubmitState('success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      setSubmitState('error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const sections = groupBySection(dictionary);

  if (submitState === 'success') {
    return (
      <div className="wm-survey min-h-screen flex items-center justify-center p-6">
        <div className="wm-panel p-10 max-w-lg text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--teal-dark)' }}>Submission received</h2>
          <p className="text-gray-600">
            Thank you for submitting your data. We will process it and contact you at{' '}
            <strong>{submitterEmail}</strong> when it has been added to the WildMaps catalog.
          </p>
          <p className="mt-4 text-sm text-gray-400">You may now close this tab.</p>
        </div>
      </div>
    );
  }

  const goToPage2 = () => {
    if (!canSubmitPage1) return;
    setPage(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPage1 = () => {
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="wm-survey pb-16">
      {/* Header */}
      <div className="wm-header px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img src={LOGO_URL} alt="WildMaps logo" className="h-8 opacity-90" />
          <h1 className="text-xl font-bold tracking-tight">Submit data to WildMAPS catalog</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator — these are two distinct features appended to one form */}
        <div className="wm-stepper">
          <span className={`step ${page === 1 ? 'active' : 'done'}`}>1. Study metadata</span>
          <span className="sep">→</span>
          <span className={`step ${page === 2 ? 'active' : ''}`}>2. Methodological standards</span>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ══════════════════════════ PAGE 1: Study metadata ══════════════════════════ */}
          {page === 1 && (
            <>
              <div className="wm-intro p-5 mb-6">
                <strong>Study metadata.</strong> Use this section to tell us about your study. You will need a
                publication URL, and a data download URL with the raster files. We will process the data and
                inform you when it has been added to the website.
              </div>

              {/* ── Fixed opening questions ────────────────────────────────────── */}
              <div className="wm-panel p-6 mb-6 space-y-5">
                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    I confirm that all authors of the study are happy for the study data to be displayed on WildMAPS.
                  </span>
                </label>

                {/* Your name */}
                <div>
                  <label htmlFor="submitter_name" className="wm-field-label">
                    Your name
                  </label>
                  <p className="wm-field-note">Please provide your name.</p>
                  <input
                    id="submitter_name"
                    type="text"
                    required
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="submitter_email" className="wm-field-label">
                    Your email
                  </label>
                  <p className="wm-field-note">
                    Please give the email you'd like us to contact you with. This information will not be shared beyond the WildMAPS team.
                  </p>
                  <input
                    id="submitter_email"
                    type="email"
                    required
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Publication link */}
                <div>
                  <label htmlFor="publication_link" className="wm-field-label">
                    Publication link
                  </label>
                  <p className="wm-field-note">Please provide a URL for the study, preferably the DOI.</p>
                  <input
                    id="publication_link"
                    type="url"
                    required
                    value={pubLink}
                    onChange={(e) => setPubLink(e.target.value)}
                    placeholder="https://doi.org/..."
                    className="w-full"
                  />
                </div>

                {/* Data download URL */}
                <div>
                  <label htmlFor="data_download_url" className="wm-field-label">
                    Data download URL
                  </label>
                  <p className="wm-field-note">
                    Please give a link where we can download the raster files, with suitable access permissions.
                  </p>
                  <input
                    id="data_download_url"
                    type="url"
                    required
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full"
                  />
                </div>
              </div>

              {/* ── Dynamic sections from dictionary ──────────────────────────── */}
              {dictLoading && (
                <div className="wm-panel p-6 text-center text-sm text-gray-500">
                  Loading survey questions…
                </div>
              )}
              {dictError && (
                <div className="wm-panel p-6 text-sm bg-red-50 border-red-200" style={{ color: 'var(--rust)' }}>
                  {dictError}
                </div>
              )}
              {!dictLoading && !dictError && sections.map(([sectionName, entries]) => (
                <div key={sectionName} className="wm-panel p-6 mb-4">
                  <div className="wm-section-head">
                    <h2 className="text-base">{sectionName}</h2>
                  </div>
                  {entries.map((entry) => (
                    <QuestionBlock
                      key={entry.metadata_key}
                      entry={entry}
                      value={dynamicValues[entry.metadata_key] ?? ''}
                      otherValue={otherValues[entry.metadata_key] ?? ''}
                      showOther={showOther[entry.metadata_key] ?? false}
                      onChange={setDynamic(entry.metadata_key)}
                      onOtherChange={setOther(entry.metadata_key)}
                      onShowOtherChange={setShowOtherKey(entry.metadata_key)}
                      multiValue={multiValues[entry.metadata_key] ?? []}
                      onMultiChange={setMulti(entry.metadata_key)}
                      predictorsValue={entry.form_type === 'predictors' ? predictors : undefined}
                      onPredictorsChange={entry.form_type === 'predictors' ? setPredictors : undefined}
                    />
                  ))}
                </div>
              ))}

              {!dictLoading && !dictError && (
                <div className="mt-6">
                  <button
                    type="button"
                    className="wm-btn wm-btn-primary w-full"
                    disabled={!canSubmitPage1}
                    onClick={goToPage2}
                  >
                    Proceed to next section
                  </button>
                  {!canSubmitPage1 && (
                    <p className="mt-2 text-center text-xs text-gray-400">
                      Please answer all questions before proceeding.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* ══════════════════════ PAGE 2: Methodological standards ══════════════════════ */}
          {page === 2 && (
            <>
              <div className="wm-intro p-5 mb-6">
                <strong>Methodological standards.</strong> This is a separate checklist from the study metadata
                above — it estimates a Gold/Silver/Bronze quality rating for your model. Every "Yes" earns a
                mark; where an "N/A" option is offered, choosing it removes that question from its section's
                total. Answer every question, then use "Calculate score" to see your rating before submitting.
              </div>

              <div className="wm-panel p-6">
                <MethodStandardsSection answers={standardsAnswers} onAnswer={setStandardsAnswer} />
              </div>

              <div className="wm-actions mt-8 flex items-center gap-3 flex-wrap">
                <button type="button" className="wm-btn wm-btn-secondary" onClick={goToPage1}>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!canSubmitPage1 || !canSubmitPage2 || submitState === 'submitting'}
                  className="wm-btn wm-btn-primary flex-1"
                >
                  {submitState === 'submitting' ? 'Submitting…' : 'Submit'}
                </button>
              </div>
              {submitState === 'error' && submitError && (
                <div className="mt-4 p-4 rounded-lg text-sm bg-red-50 border-red-200" style={{ color: 'var(--rust)', border: '1px solid var(--rust)' }}>
                  {submitError}
                </div>
              )}
              {!canSubmitPage2 && (
                <p className="mt-2 text-xs text-gray-400">
                  Please answer all methodological standards questions before submitting.
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
