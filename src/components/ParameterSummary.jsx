import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

const ParameterSummary = ({ className = "" }) => {
  const { getAllParams } = useFilterState();
  const { data, admData, superSpeciesData } = useAppContext();
  const allParams = getAllParams();

  // Define the parameters to display in order
  const parameterConfig = [
    { key: 'region', label: 'Region' },
    { key: 'subregion', label: 'Sub-region' },
    { key: 'superspecies', label: 'Taxon' },
    { key: 'datasetKey', label: 'Dataset' },
    //{ key: 'adm0Key', label: 'Country' },
    //{ key: 'adm1Key', label: 'Administrative Level 1' }
  ];

  // Helper function to get display value for a parameter
  const getDisplayValue = (paramKey, paramValue) => {
    if (!paramValue || paramValue === '') return '-';
    
    switch (paramKey) {
      case 'superspecies':
        // Get superspecies info from superSpeciesData
        const superspeciesInfo = superSpeciesData?.[paramValue];
        if (superspeciesInfo) {
          const scientificName = superspeciesInfo.scientific_name;
          const commonName = superspeciesInfo.common_name;
          
          if (scientificName && commonName) {
            return (
              <span>
              {commonName} (<em>{scientificName}</em>)
              </span>
            );
          } else if (scientificName) {
            return <em>{scientificName}</em>;
          } else if (commonName) {
            return commonName;
          }
        }
        return paramValue; // fallback to original value

        case 'datasetKey':
          // Get dataset info from data
          const dataset = data?.[paramValue];
          if (dataset) {
            const sourceText = dataset.source_text || '';
            const commonName = dataset.common_name || '';
            const scientificName = dataset.scientific_name || '';

            if (sourceText && commonName && scientificName) {
              return (
                <span>
                  Study on the {commonName} (<em>{scientificName}</em>) by {sourceText}
                </span>
              );
            } else if (commonName && scientificName) {
              return (
                <span>
                  Study on the {commonName} (<em>{scientificName}</em>)
                </span>
              );
            } else if (dataset.title) {
              return dataset.title;
            }
          }
          return paramValue; // fallback to original value
      
      //case 'adm0Key':
      //  if (paramValue === 'all_adm0') return 'All Countries';
      //  // Get country name from admData if available
      //  const countryName = admData?.adm0_list?.find(item => item.key === paramValue)?.name;
      //  return countryName || paramValue;
      //
      //case 'adm1Key':
      //  if (paramValue === 'all_adm1') return 'All Administrative Areas';
      //  // Get adm1 name from admData if available
      //  const adm1Name = admData?.adm1_list?.find(item => item.key === paramValue)?.name;
      //  return adm1Name || paramValue;
      
      default:
        return paramValue;
    }
  };

  return (
    <div className="space-y-2 ml-2 pt-10">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Summary of dataset filters:</h3>
      {parameterConfig.map(({ key, label }) => (
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
