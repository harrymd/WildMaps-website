import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

interface FinalSummaryProps {
  className?: string;
}

/** Formats an array of region names as a natural-language list. */
const formatRegions = (regions: string[]): string => {
  if (!regions || regions.length === 0) return 'Unknown region';
  if (regions.length === 1) return regions[0];
  if (regions.length === 2) return `${regions[0]} and ${regions[1]}`;
  return `${regions.slice(0, -1).join(', ')} and ${regions[regions.length - 1]}`;
};

/** Introductory paragraph for the FinalScreen describing the selected dataset. */
const FinalSummary = ({ className = '' }: FinalSummaryProps) => {
  const { getAllParams } = useFilterState();
  const { data } = useAppContext();
  const allParams = getAllParams();

  const entry = allParams.datasetKey ? data[allParams.datasetKey] : undefined;

  const source_text   = entry?.source_text   ?? 'Unknown source';
  const source_link   = entry?.source_link   ?? '#';
  const common_name   = entry?.common_name   ?? 'Unknown species';
  const scientific_name = entry?.scientific_name ?? 'Unknown scientific name';
  const download_link = entry?.download_link ?? 'none';
  const subregion     = allParams.subregion  ?? 'none';
  const regionsString = formatRegions(entry?.regions ?? []);

  return (
    <div className={`mb-4 ${className}`}>
      <div className="leading-relaxed">
        <p>
          You've selected a species distribution model for the {common_name} (<em>{scientific_name}</em>) by{' '}
          {source_link && source_link !== '#' ? (
            <a href={source_link} target="_blank" rel="noopener noreferrer"
               className="text-blue-600 hover:text-blue-800 underline">
              {source_text}
            </a>
          ) : (
            source_text
          )}{' '}
          for {subregion !== 'none' ? subregion : regionsString}.{' '}
          {(!source_link || source_link === '#') && 'A link to a reference work has not been added yet. '}
          The model is shown on the map, analysis is shown below, and at the end there is information about data access.
        </p>

        <p className="mt-3">
          Use the <strong>Location selection</strong> controls to view the graphs for different
          countries and national subdivisions. Use the <strong>Basemap layers</strong> controls to
          view the map legend and control map layers.
        </p>
      </div>
    </div>
  );
};

export default FinalSummary;
