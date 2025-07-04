import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

const FinalDatasetInfo = ({ className = "" }) => {
  const { getAllParams } = useFilterState();
  const { data, admData, superSpeciesData } = useAppContext();
  const allParams = getAllParams();

  // Get the current dataset entry based on selected parameters
  const getCurrentDatasetEntry = () => {
    if (!data || !allParams.datasetKey) return null;
    return data[allParams.datasetKey];
  };

  const currentEntry = getCurrentDatasetEntry();

  // Get display values for the text template
  const getDisplayValues = () => {
    if (!currentEntry) {
      return {
        source_text: 'Unknown source',
        source_link: '#',
        common_name: 'Unknown species',
        scientific_name: 'Unknown scientific name',
        download_link: 'none',
        source_contact: 'none'
      };
    }

    return {
      source_text: currentEntry.source_text || 'Unknown source',
      source_link: currentEntry.source_link || '#',
      common_name: currentEntry.common_name || 'Unknown species',
      scientific_name: currentEntry.scientific_name || 'Unknown scientific name',
      download_link: currentEntry.download_link || 'none',
      source_contact: currentEntry.source_contact || 'none'
    };
  };

  const displayValues = getDisplayValues();

  return (
    <div className={`mb-4 ${className}`}>
      <div className="text-sm text-gray-800 leading-relaxed">
        <h3 className="text-lg font-semibold mb-2">Data access</h3>
        <p>
          {displayValues.download_link === 'none' ? (
            <>A link to download the source data has not been added yet.{' '}</>
          ) : (
            <>
              The data can be downloaded{' '}
              <a 
                href={displayValues.download_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                here
              </a>.{' '}
            </>
          )}
          {displayValues.source_contact === 'none' ? (
            'Contact details have not yet been added for this dataset.'
          ) : (
            <>
            For more information, contact{' '}
            <a
              href={`mailto:${displayValues.source_contact}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {displayValues.source_contact}
            </a>.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default FinalDatasetInfo;
