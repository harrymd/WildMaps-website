import { useEffect } from 'react';
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute } from '../utils/navigationUtils';
import { useMapPanning } from '../hooks/useMapPanning';

const SelectAdm0 = () => {
  const { data, admData } = useAppContext();
  const { getParam, setParamAndNavigate } = useFilterState();
  
  // Transform admData.adm0 to the format expected by useMapPanning
  const countryBboxData = {};
  if (admData.adm0) {
    Object.entries(admData.adm0).forEach(([countryCode, countryInfo]) => {
      if (countryInfo.bbox) {
        countryBboxData[countryCode] = { bbox: countryInfo.bbox };
      }
    });
  }
  
  const { handleLocationSelection } = useMapPanning('adm0Key', countryBboxData, 'panToCountry');
  
  const datasetKey = getParam('datasetKey');
  const dataset = data?.[datasetKey];
  const startingFilter = getParam('startingFilter');

  const getAdm0Options = (allParams, data) => {
    const datasetKey = allParams.datasetKey;
    const dataset = data?.[datasetKey];
    
    if (!dataset) {
      return [];
    }

    const options = ['all_adm0', ...(dataset?.adm0_list || [])];
    return options.map(key => ({
      value: key,
      cells: [
        key === 'all_adm0'
          ? 'All countries (entire extent of dataset)'
          : admData.adm0?.[key]?.name || key
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

  // Auto-redirect logic if there's only one option
  useEffect(() => {
    const currentAdm0Key = getParam('adm0Key');
    
    // Don't auto-redirect if user already has a selection
    if (currentAdm0Key) {
      return;
    }
    
    if (dataset && dataset.adm0_list) {
      const options = ['all_adm0', ...dataset.adm0_list];
      if (options.length === 2) {
        const selectedAdm0 = options[1];
        const nextRoute = getNextRoute('/adm0', startingFilter);
        setParamAndNavigate('adm0Key', selectedAdm0, nextRoute);
      }
    }
  }, [dataset, startingFilter, setParamAndNavigate, getParam]);

  // Don't render if auto-redirecting
  const currentAdm0Key = getParam('adm0Key');
  if (!currentAdm0Key && dataset && dataset.adm0_list && ['all_adm0', ...dataset.adm0_list].length === 2) {
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
      tableHeaders={[]}
      onSelect={handleLocationSelection}
    />
  );
};

export default SelectAdm0;
