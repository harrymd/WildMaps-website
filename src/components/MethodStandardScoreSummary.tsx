import { useEffect } from 'react';
import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';
import { calculateChecklistResultFromPayload } from '../constants/methodologicalStandards';
import MethodStandardMedal from './MethodStandardMedal';

const TIER_LABEL: Record<string, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

/**
 * Compact 'Methodological standard score' summary shown near the top of the
 * final screen — just the medal, tier and overall %, pointing to the full
 * collapsible breakdown (MethodStandardScoreSection) at the bottom of the page.
 */
const MethodStandardScoreSummary = () => {
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
      <h3 className="text-lg font-semibold mb-2">Methodological standard score</h3>

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
        <div className="flex items-center gap-3">
          <MethodStandardMedal tier={result.tier} className="text-3xl" />
          <div>
            <p className="font-semibold text-gray-900">
              {TIER_LABEL[result.tier]} — {result.overallPct}% overall
            </p>
            <p className="text-gray-500 text-xs">Detailed information at the bottom.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MethodStandardScoreSummary;
