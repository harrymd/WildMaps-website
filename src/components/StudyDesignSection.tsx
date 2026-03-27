import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

/** Collapsible 'Study design' section shown on the final screen. */
const StudyDesignSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getParam } = useFilterState();
  const { studyMetadataDictionary, studyMetadataCatalog } = useAppContext();

  const datasetKey = getParam('datasetKey');
  const catalogEntry = datasetKey ? studyMetadataCatalog[String(datasetKey)] : undefined;
  const studyMissing = !catalogEntry;

  // Group dictionary entries by section_name, preserving CSV row order.
  const sections = new Map<string, { metadata_key: string; metadata_name: string }[]>();
  for (const entry of studyMetadataDictionary) {
    if (!sections.has(entry.section_name)) sections.set(entry.section_name, []);
    sections.get(entry.section_name)!.push({
      metadata_key: entry.metadata_key,
      metadata_name: entry.metadata_name,
    });
  }

  return (
    <div className="mb-4 text-sm text-gray-800">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-lg font-semibold hover:text-gray-600 transition-colors"
      >
        <span>Study design</span>
        <span className="text-sm font-normal text-gray-500 ml-1">
          {isOpen ? '(click to collapse)' : '(click to expand)'}
        </span>
        {isOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
      </button>

      {isOpen && (
        <div className="mt-2">
          {studyMissing ? (
            <p className="text-gray-600">Study design information has not been uploaded yet.</p>
          ) : (
            Array.from(sections.entries()).map(([sectionName, fields]) => (
              <div key={sectionName} className="mb-3">
                <h4 className="font-semibold text-gray-700 mb-1">{sectionName}</h4>
                <dl className="space-y-0.5 ml-2">
                  {fields.map(({ metadata_key, metadata_name }) => {
                    const value = catalogEntry[metadata_key];
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudyDesignSection;
