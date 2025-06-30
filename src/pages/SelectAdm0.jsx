// SelectAdm0.jsx
import { useEffect } from 'react';
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute } from '../utils/navigationUtils';

const SelectAdm0 = () => {
  const { data, admData, setAdm0Key, setAdm1Key } = useAppContext();
  const { getParam, setParamAndNavigate } = useFilterState();
  
  const datasetKey = getParam('datasetKey');
  const dataset = data?.[datasetKey];
  const startingFilter = getParam('startingFilter');

  const getAdm0Options = (allParams, data) => {
    const datasetKey = allParams.datasetKey;
    const dataset = data?.[datasetKey];
    
    if (!dataset) {
      return [];
    }
    console.log(admData);

    const options = ['all_adm0', ...(dataset?.adm0_list || [])];
    return options.map(key => ({
    value: key,
    cells: [
      key === 'all_adm0'
        ? 'All countries (entire extent of dataset)'
        : admData.adm0?.[key]?.name || key  // Display name, fallback to code
    ]
  }));  
  };

  const getContextDisplay = (allParams) => {
    const context = [];
    if (allParams.superspecies) {
      context.push(`SuperSpecies: **${allParams.superspecies}**`);
    }
    if (allParams.region) {
      context.push(`Region: **${allParams.region}**`);
    }
    if (allParams.subregion) {
      context.push(`SubRegion: **${allParams.subregion}**`);
    }
    if (allParams.datasetKey && data?.[allParams.datasetKey]) {
      const dataset = data[allParams.datasetKey];
      context.push(`Dataset: **${dataset.common_name || 'Unknown'}**`);
    }
    
    if (context.length > 0) {
      return (
        <div className="mb-4">
          {context.map((item, index) => (
            <p key={index} className="mb-1">
              {item.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom handler to set the old context variables and handle auto-redirect
  const handleAdm0Selection = (adm0Key) => {
    setAdm0Key(adm0Key);
    setAdm1Key(null);
  };

  // Auto-redirect logic if there's only one option
  useEffect(() => {
    if (dataset && dataset.adm0_list) {
      const options = ['all_adm0', ...dataset.adm0_list];
      if (options.length === 2) {
        // Only one real option (plus "all"), auto-select it
        const selectedAdm0 = options[1];
        setAdm0Key(selectedAdm0);
        
        // Navigate to next step
        const nextRoute = getNextRoute('/adm0', startingFilter);
        setParamAndNavigate('adm0Key', selectedAdm0, nextRoute);
      }
    }
  }, [dataset, startingFilter, setAdm0Key, setParamAndNavigate]);

  // Don't render if auto-redirecting
  if (dataset && dataset.adm0_list && ['all_adm0', ...dataset.adm0_list].length === 2) {
    return <div>Redirecting...</div>;
  }

  return (
    <GeneralSelectComponent
      route="/adm0"
      paramKey="adm0Key"
      title="Country"
      description="Click on a row to select a country:"
      getOptions={getAdm0Options}
      getContextDisplay={getContextDisplay}
      tableHeaders={[]} // No headers
      onSelect={handleAdm0Selection}
    />
  );
};

export default SelectAdm0;
