import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

const FIXED_FIELDS: { key: string; label: string }[] = [
  { key: 'submitter_name', label: 'Submitted by' },
  { key: 'submitter_email', label: 'Submitter email' },
  { key: 'publication_link', label: 'Publication' },
  { key: 'data_download_url', label: 'Data download URL' },
];

/** Collapsible 'Study design and metadata' section shown on the final screen. */
const StudyDesignSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getParam } = useFilterState();
  const { data, studyMetadataDictionary, approvedMetadata, ensureApprovedMetadata } = useAppContext();

  const datasetKey = getParam('datasetKey');
  const dataset = datasetKey ? data[datasetKey] : undefined;

  useEffect(() => {
    if (datasetKey) ensureApprovedMetadata(datasetKey, dataset);
  }, [datasetKey, dataset, ensureApprovedMetadata]);

  const entry = datasetKey ? approvedMetadata[datasetKey] : undefined;
  const status = entry?.status ?? 'loading';
  const payload = entry?.payload;

  // Group dictionary entries by section_name, preserving CSV row order.
  const sections = new Map<string, { metadata_key: string; metadata_name: string }[]>();
  for (const dictEntry of studyMetadataDictionary) {
    if (!sections.has(dictEntry.section_name)) sections.set(dictEntry.section_name, []);
    sections.get(dictEntry.section_name)!.push({
      metadata_key: dictEntry.metadata_key,
      metadata_name: dictEntry.metadata_name,
    });
  }

  return (
    <div className="mb-4 text-sm text-gray-800">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-lg font-semibold hover:text-gray-600 transition-colors"
      >
        <span>Study design and metadata</span>
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
          {status === 'loaded' && payload && (
            <>
              <div className="mb-3">
                <h4 className="font-semibold text-gray-700 mb-1">Submission</h4>
                <dl className="space-y-0.5 ml-2">
                  {FIXED_FIELDS.map(({ key, label }) => {
                    const value = payload[key];
                    if (!value) return null;
                    return (
                      <div key={key} className="flex gap-1.5">
                        <dt className="text-gray-600 shrink-0">{label}:</dt>
                        <dd>{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
              {Array.from(sections.entries()).map(([sectionName, fields]) => (
                <div key={sectionName} className="mb-3">
                  <h4 className="font-semibold text-gray-700 mb-1">{sectionName}</h4>
                  <dl className="space-y-0.5 ml-2">
                    {fields.map(({ metadata_key, metadata_name }) => {
                      const value = payload[metadata_key];
                      const isEmpty = !value || value.trim() === '';
                      return (
                        <div key={metadata_key} className="flex gap-1.5">
                          <dt className="text-gray-600 shrink-0">{metadata_name}:</dt>
                          <dd>
                            {isEmpty ? (
                              <em className="text-gray-400">Information not uploaded yet</em>
                            ) : (
                              value
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyDesignSection;
