import { useState, useEffect, useMemo, type FormEvent } from 'react';
import Papa from 'papaparse';
import type { StudyMetadataDictionaryEntry } from '../types';
import { DATA_ROOT, BUCKET_URL } from '../constants/mapConfig';

// ─── Config ───────────────────────────────────────────────────────────────────

const DICT_URL = `${DATA_ROOT}/data_inputs/dictionaries/study_metadata_dictionary.csv`;
const LOGO_URL = `${BUCKET_URL}/data_inputs/website_assets/wildmaps_logo.png`;
const SURVEY_API_URL: string = import.meta.env.VITE_SURVEY_API_URL ?? '';

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
}

function StringQuestion({ entry, value, onChange }: Pick<QuestionProps, 'entry' | 'value' | 'onChange'>) {
  return (
    <textarea
      id={entry.metadata_key}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-vertical"
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
          className="border border-gray-300 rounded px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-green-700"
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

function ChoicesQuestion({ entry, value, otherValue, showOther, onChange, onOtherChange, onShowOtherChange }: QuestionProps) {
  const choices = parseChoices(entry.choices);
  return (
    <div className="space-y-1.5">
      {choices.map((choice) => (
        <label key={choice} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={entry.metadata_key}
            value={choice}
            checked={!showOther && value === choice}
            onChange={() => { onShowOtherChange(false); onChange(choice); }}
            className="accent-green-700"
          />
          <span className="text-sm">{choice}</span>
        </label>
      ))}
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="radio"
          name={entry.metadata_key}
          value="Other"
          checked={showOther}
          onChange={() => { onShowOtherChange(true); onChange('Other'); }}
          className="accent-green-700 mt-0.5"
        />
        <div className="flex-1">
          <span className="text-sm">Other</span>
          {showOther && (
            <input
              type="text"
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Please specify..."
              className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          )}
        </div>
      </label>
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
              className="border border-gray-300 rounded px-3 py-2 text-sm w-24 text-center focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
          <span className="text-gray-400 mt-5">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">{labelB} %</span>
            <input
              type="number"
              value={second}
              readOnly
              className="border border-gray-200 rounded px-3 py-2 text-sm w-24 text-center bg-gray-50 text-gray-500"
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
          className="accent-green-700"
        />
        Other / not applicable
      </label>
      {showOther && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Please specify..."
          className="mt-2 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      )}
    </div>
  );
}

function QuestionBlock({ entry, value, otherValue, showOther, onChange, onOtherChange, onShowOtherChange }: QuestionProps) {
  const sharedProps = { entry, value, otherValue, showOther, onChange, onOtherChange, onShowOtherChange };

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <label htmlFor={entry.metadata_key} className="block font-medium text-gray-800 mb-1 text-sm">
        {entry.metadata_name}
      </label>
      {entry.form_prompt && (
        <p className="text-sm text-gray-500 mb-2">{entry.form_prompt}</p>
      )}
      {entry.form_type === 'string'   && <StringQuestion  {...sharedProps} />}
      {entry.form_type === 'integer'  && <IntegerQuestion {...sharedProps} />}
      {entry.form_type === 'choices'  && <ChoicesQuestion {...sharedProps} />}
      {entry.form_type === 'ratio'    && <RatioQuestion   {...sharedProps} />}
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

  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const setDynamic  = (key: string) => (val: string)  => setDynamicValues((p) => ({ ...p, [key]: val }));
  const setOther    = (key: string) => (val: string)  => setOtherValues((p)   => ({ ...p, [key]: val }));
  const setShowOtherKey = (key: string) => (show: boolean) => setShowOther((p) => ({ ...p, [key]: show }));

  // ── Build submission payload ───────────────────────────────────────────────

  const buildPayload = (): Record<string, string> => {
    const payload: Record<string, string> = {
      submitted_at:   new Date().toISOString(),
      submitter_name: submitterName.trim(),
      submitter_email: submitterEmail.trim(),
      publication_link: pubLink.trim(),
      data_download_url: downloadUrl.trim(),
    };

    for (const entry of dictionary) {
      const key = entry.metadata_key;
      const isOther = showOther[key] ?? false;

      if (entry.form_type === 'ratio') {
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

    return payload;
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const canSubmit = useMemo(() => {
    if (!consent) return false;
    if (!submitterName.trim() || !submitterEmail.trim() || !pubLink.trim() || !downloadUrl.trim()) return false;
    if (dictLoading || !!dictError) return false;
    for (const entry of dictionary) {
      const key = entry.metadata_key;
      const isOther = showOther[key] ?? false;
      const filled = isOther
        ? !!(otherValues[key] ?? '').trim()
        : !!(dynamicValues[key] ?? '').trim();
      if (!filled) return false;
    }
    return true;
  }, [consent, submitterName, submitterEmail, pubLink, downloadUrl, dictionary, dynamicValues, otherValues, showOther, dictLoading, dictError]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-10 max-w-lg text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-3">Submission received</h2>
          <p className="text-gray-600">
            Thank you for submitting your data. We will process it and contact you at{' '}
            <strong>{submitterEmail}</strong> when it has been added to the WildMaps catalog.
          </p>
          <p className="mt-4 text-sm text-gray-400">You may now close this tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-green-900 text-white px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img src={LOGO_URL} alt="WildMaps logo" className="h-8 opacity-90" />
          <h1 className="text-xl font-bold tracking-tight">Submit data to WildMAPS catalog</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Preamble */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Use this form to submit your SDM data so it can appear on the WildMAPS catalog.
            You will need a publication URL, and a data download URL with the raster files.
            We will process the data and inform you when it has been added to the website.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* ── Fixed opening questions ────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 space-y-5">
            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-green-700 flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-800">
                I confirm that all authors of the study are happy for the study data to be displayed on WildMAPS.
              </span>
            </label>

            {/* Your name */}
            <div>
              <label htmlFor="submitter_name" className="block text-sm font-medium text-gray-800 mb-1">
                Your name
              </label>
              <p className="text-xs text-gray-500 mb-1.5">Please provide your name.</p>
              <input
                id="submitter_name"
                type="text"
                required
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="submitter_email" className="block text-sm font-medium text-gray-800 mb-1">
                Your email
              </label>
              <p className="text-xs text-gray-500 mb-1.5">
                Please give the email you'd like us to contact you with. This information will not be shared beyond the WildMAPS team.
              </p>
              <input
                id="submitter_email"
                type="email"
                required
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>

            {/* Publication link */}
            <div>
              <label htmlFor="publication_link" className="block text-sm font-medium text-gray-800 mb-1">
                Publication link
              </label>
              <p className="text-xs text-gray-500 mb-1.5">Please provide a URL for the study, preferably the DOI.</p>
              <input
                id="publication_link"
                type="url"
                required
                value={pubLink}
                onChange={(e) => setPubLink(e.target.value)}
                placeholder="https://doi.org/..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>

            {/* Data download URL */}
            <div>
              <label htmlFor="data_download_url" className="block text-sm font-medium text-gray-800 mb-1">
                Data download URL
              </label>
              <p className="text-xs text-gray-500 mb-1.5">
                Please give a link where we can download the raster files, with suitable access permissions.
              </p>
              <input
                id="data_download_url"
                type="url"
                required
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>
          </div>

          {/* ── Dynamic sections from dictionary ──────────────────────────── */}
          {dictLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-500">
              Loading survey questions…
            </div>
          )}
          {dictError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
              {dictError}
            </div>
          )}
          {!dictLoading && !dictError && sections.map(([sectionName, entries]) => (
            <div key={sectionName} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-base font-semibold text-green-900 mb-1 pb-2 border-b border-gray-100">
                {sectionName}
              </h2>
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
                />
              ))}
            </div>
          ))}

          {/* ── Submit ────────────────────────────────────────────────────── */}
          {!dictLoading && !dictError && (
            <div className="mt-6">
              {submitState === 'error' && submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={!canSubmit || submitState === 'submitting'}
                className="w-full py-3 bg-green-800 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
              >
                {submitState === 'submitting' ? 'Submitting…' : 'Submit'}
              </button>
              {!canSubmit && (
                <p className="mt-2 text-center text-xs text-gray-400">
                  Please answer all questions before submitting.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
