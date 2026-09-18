import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';
import { CHECKLIST_SECTIONS, calculateChecklistResultFromPayload } from '../constants/methodologicalStandards';
import MethodStandardMedal from './MethodStandardMedal';

const TIER_LABEL: Record<string, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

/** Collapsible 'Methodological standard score' section shown on the final screen. */
const MethodStandardScoreSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getParam } = useFilterState();
  const { data, approvedMetadata, ensureApprovedMetadata } = useAppContext();

  const datasetKey = getParam('datasetKey');
  const dataset = datasetKey ? data[datasetKey] : undefined;

  useEffect(() => {
    if (datasetKey) ensureApprovedMetadata(datasetKey, dataset);
  }, [datasetKey, dataset, ensureApprovedMetadata]);

  const entry = datasetKey ? approvedMetadata[datasetKey] : undefined;
  const status = entry?.status ?? 'loading';
  const result = calculateChecklistResultFromPayload(entry?.payload);

  return (
    <div className="mb-4 text-sm text-gray-800">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-lg font-semibold hover:text-gray-600 transition-colors"
      >
        <span>Methodological standard score</span>
        <span className="text-sm font-normal text-gray-500 ml-1">
          {isOpen ? '(click to collapse)' : '(click to expand)'}
        </span>
        {isOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
      </button>

      {isOpen && (
        <div className="mt-2">
          {status === 'loading' && <p className="text-gray-600">Loading study design information…</p>}
          {status === 'missing' && (
            <p className="text-gray-600">Study design information has not been uploaded yet.</p>
          )}
          {status === 'error' && (
            <p className="text-gray-600">Study design information could not be loaded.</p>
          )}
          {status === 'loaded' && !result && (
            <p className="text-gray-600 flex items-center gap-2">
              <MethodStandardMedal tier={null} /> This study has not yet been assessed against the
              methodological standards checklist.
            </p>
          )}
          {status === 'loaded' && result && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <MethodStandardMedal tier={result.tier} className="text-3xl" />
                <div>
                  <p className="font-semibold text-gray-900">{TIER_LABEL[result.tier]}</p>
                  <p className="text-gray-600">{result.overallPct}% overall</p>
                </div>
              </div>
              {result.overrideNote && (
                <p className="mb-3 text-gray-600 italic">{result.overrideNote}</p>
              )}

              <h4 className="font-semibold text-gray-700 mb-2">Section breakdown</h4>
              <div className="space-y-2 mb-3">
                {CHECKLIST_SECTIONS.map((section) => {
                  const score = result.sectionScores[section.key];
                  const pct = score === null ? 0 : Math.round(score * 100);
                  return (
                    <div key={section.key}>
                      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                        <span>{section.label}</span>
                        <span>{score === null ? 'N/A' : `${pct}%`}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <h4 className="font-semibold text-gray-700 mb-1">Full checklist</h4>
              {CHECKLIST_SECTIONS.map((section) => (
                <div key={section.key} className="mb-2 ml-2">
                  <p className="font-medium text-gray-700">{section.label}</p>
                  {section.subsections.flatMap((sub) => sub.questions).map((q) => {
                    const answer = entry?.payload?.[`standards.${q.id}`];
                    if (!answer) return null;
                    return (
                      <div key={q.id} className="flex gap-1.5 ml-2">
                        <dt className="text-gray-600">{q.text}</dt>
                        <dd className="font-medium shrink-0">{answer.toUpperCase()}</dd>
                      </div>
                    );
                  })}
                </div>
              ))}

              <p className="mt-3 text-xs text-gray-400">
                Gold — 85% and above · Silver — 60% to 84% · Bronze — below 60%, or predictions not validated.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MethodStandardScoreSection;
