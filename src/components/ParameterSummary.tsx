import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

interface ParameterSummaryProps {
  className?: string;
}

interface ParamConfig {
  key: string;
  label: string;
}

const PARAM_CONFIG: ParamConfig[] = [
  { key: 'region',     label: 'Region' },
  { key: 'subregion',  label: 'Sub-region' },
  { key: 'superspecies', label: 'Taxon' },
  { key: 'datasetKey', label: 'Dataset' },
];

/**
 * Displays the currently active filter parameters as a labelled summary table.
 * Shown at the bottom of each selection page.
 */
const ParameterSummary = ({ className = '' }: ParameterSummaryProps) => {
  const { getAllParams } = useFilterState();
  const { data, superSpeciesData } = useAppContext();
  const allParams = getAllParams();

  const getDisplayValue = (paramKey: string, paramValue: string | undefined): React.ReactNode => {
    if (!paramValue) return '-';

    switch (paramKey) {
      case 'superspecies': {
        const info = superSpeciesData?.[paramValue];
        if (!info) return paramValue;
        const sci = info.scientific_name
          ? info.scientific_name.charAt(0).toUpperCase() + info.scientific_name.slice(1)
          : '';
        const common = info.common_name ?? '';
        if (sci && common) return <span>{sci} ({common})</span>;
        return sci || common || paramValue;
      }

      case 'datasetKey': {
        const dataset = data?.[paramValue];
        if (!dataset) return paramValue;
        const { source_text, common_name, scientific_name } = dataset;
        if (source_text && common_name && scientific_name) {
          return <span>Study on the {common_name} (<em>{scientific_name}</em>) by {source_text}</span>;
        }
        if (common_name && scientific_name) {
          return <span>Study on the {common_name} (<em>{scientific_name}</em>)</span>;
        }
        return (dataset as { title?: string }).title ?? paramValue;
      }

      default:
        return paramValue;
    }
  };

  return (
    <div className={`space-y-2 ml-2 pt-10 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Summary of dataset filters:</h3>
      {PARAM_CONFIG.map(({ key, label }) => (
        <div key={key} className="grid grid-cols-[10rem_1fr] gap-2">
          <span className="text-sm font-medium text-gray-900">{label}:</span>
          <span className="text-sm text-gray-600">
            {getDisplayValue(key, allParams[key])}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ParameterSummary;
