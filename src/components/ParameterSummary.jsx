import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

const ParameterSummary = ({ className = "" }) => {
  const { getAllParams } = useFilterState();
  const { data, admData } = useAppContext();
  const allParams = getAllParams();

  // Define the parameters to display in order
  const parameterConfig = [
    { key: 'region', label: 'Region' },
    { key: 'subregion', label: 'Subregion' },
    { key: 'superspecies', label: 'SuperSpecies' },
    { key: 'datasetKey', label: 'Dataset' },
    { key: 'adm0Key', label: 'Country' },
    { key: 'adm1Key', label: 'Administrative Level 1' }
  ];

  // Helper function to get display value for a parameter
  const getDisplayValue = (paramKey, paramValue) => {
    if (!paramValue || paramValue === '') return '-';
    
    switch (paramKey) {
      case 'datasetKey':
        // Get dataset title from data if available
        const dataset = data?.[paramValue];
        return dataset?.title || paramValue;
      
      case 'adm0Key':
        if (paramValue === 'all_adm0') return 'All Countries';
        // Get country name from admData if available
        const countryName = admData?.adm0_list?.find(item => item.key === paramValue)?.name;
        return countryName || paramValue;
      
      case 'adm1Key':
        if (paramValue === 'all_adm1') return 'All Administrative Areas';
        // Get adm1 name from admData if available
        const adm1Name = admData?.adm1_list?.find(item => item.key === paramValue)?.name;
        return adm1Name || paramValue;
      
      default:
        return paramValue;
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Your choices so far</h3>
      <div className="space-y-2 ml-2">
        {parameterConfig.map(({ key, label }) => (
          <div key={key} className="flex">
            <span className="text-sm font-medium text-gray-600 w-40">{label}:</span>
            <span className="text-sm text-gray-900">
              {getDisplayValue(key, allParams[key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParameterSummary;
