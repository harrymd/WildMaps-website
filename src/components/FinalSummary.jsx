import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

const FinalSummary = ({ className = "" }) => {
  const { getAllParams } = useFilterState();
  const { data, admData, superSpeciesData } = useAppContext();
  const allParams = getAllParams();

  // Get the current dataset entry based on selected parameters
  const getCurrentDatasetEntry = () => {
    if (!data || !allParams.datasetKey) return null;
    return data[allParams.datasetKey];
  };

  const currentEntry = getCurrentDatasetEntry();

  const formatRegionsArray = (regions) => {
    if (!regions || regions.length === 0) return 'Unknown region';
    if (regions.length === 1) return regions[0];
    if (regions.length === 2) return `${regions[0]} and ${regions[1]}`;
    return `${regions.slice(0, -1).join(', ')} and ${regions[regions.length - 1]}`;
  };

  // Get display values for the text template
  const getDisplayValues = () => {
    if (!currentEntry) {
      return {
        source_text: 'Unknown source',
        source_link: '#',
        common_name: 'Unknown species',
        scientific_name: 'Unknown scientific name',
        download_link: 'none'
      };
    }

    return {
      source_text: currentEntry.source_text || 'Unknown source',
      source_link: currentEntry.source_link || '#',
      common_name: currentEntry.common_name || 'Unknown species',
      scientific_name: currentEntry.scientific_name || 'Unknown scientific name',
      download_link: currentEntry.download_link || 'none',
      subregion: allParams.subregion || 'none',
      region: allParams.region || 'Unknown region',
      regionsString: formatRegionsArray(currentEntry.regions)
    };
  };

  const displayValues = getDisplayValues();

  return (
    <div className={`mb-4 ${className}`}>
      <div className="leading-relaxed">
        <p>
          You've selected a species distribution model for the {displayValues.common_name} (<em>{displayValues.scientific_name}</em>) by{' '}
          {displayValues.source_link && displayValues.source_link !== '#' ? (
            <a
              href={displayValues.source_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {displayValues.source_text}
            </a>
          ) : (
            displayValues.source_text
          )}{' '}
          for {displayValues.subregion && displayValues.subregion !== 'none' ? displayValues.subregion : displayValues.regionsString}.{' '}
          {(!displayValues.source_link || displayValues.source_link === '#') &&
            'A link to a reference work has not been added yet. '
          }
          The model is shown on the map, analysis is shown below, and at the end there is information about data access.
        </p>
        
        <p className="mt-3">
          Use the <strong>Location selection</strong> controls to view the graphs for different countries and national subdivisions. 
          Use the <strong>Basemap layers</strong> controls to view the map legend and control map layers.
        </p>
      </div>
    </div>
  );
};

export default FinalSummary;
