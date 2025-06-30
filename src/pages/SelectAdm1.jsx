import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute, getPreviousRoute } from '../utils/navigationUtils';
import { useMapPanning } from '../hooks/useMapPanning';

const SelectAdm1 = () => {
  const { data, admData } = useAppContext();
  const { getParam, setParamAndNavigate } = useFilterState();
  const navigate = useNavigate();
  
  // Transform admData.adm1 to the format expected by useMapPanning
  const adm1BboxData = {};
  if (admData.adm1) {
    Object.entries(admData.adm1).forEach(([adm1Code, adm1Info]) => {
      if (adm1Info.bbox) {
        adm1BboxData[adm1Code] = { bbox: adm1Info.bbox };
      }
    });
  }
  
  const { handleLocationSelection } = useMapPanning('adm1Key', adm1BboxData, 'panToAdm1');
  
  const datasetKey = getParam('datasetKey');
  const adm0Key = getParam('adm0Key');
  const dataset = data?.[datasetKey];
  const startingFilter = getParam('startingFilter');

  const getAdm1Options = (allParams, data) => {
    const datasetKey = allParams.datasetKey;
    const adm0Key = allParams.adm0Key;
    const dataset = data?.[datasetKey];
    
    if (!dataset || !adm0Key) {
      return [];
    }

    if (adm0Key === 'all_adm0') {
      return [{
        value: 'all_adm1',
        cells: ['All regions (entire extent of dataset)']
      }];
    }

    const filtered = dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];
    const options = ['all_adm1', ...filtered];
    
    return options.map(key => ({
      value: key,
      cells: [
        key === 'all_adm1'
          ? 'All regions (entire extent of country)'
          : admData.adm1?.[key]?.name || key
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
    if (allParams.adm0Key) {
      const adm0Name = allParams.adm0Key === 'all_adm0' 
        ? 'All countries' 
        : admData.adm0?.[allParams.adm0Key]?.name || allParams.adm0Key;
      context.push(`Country: **${adm0Name}**`);
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

  // Custom back handler that skips auto-redirect steps
  const handleBack = () => {
    const dataset = data?.[getParam('datasetKey')];
    
    // Check if SelectAdm0 would auto-redirect
    if (dataset && dataset.adm0_list && ['all_adm0', ...dataset.adm0_list].length === 2) {
      const prevPrevRoute = getPreviousRoute('/adm0', startingFilter);
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete('adm0Key');
      currentParams.delete('adm1Key');
      navigate(`${prevPrevRoute}?${currentParams.toString()}`);
    } else {
      const prevRoute = getPreviousRoute('/adm1', startingFilter);
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete('adm1Key');
      navigate(`${prevRoute}?${currentParams.toString()}`);
    }
  };

  // Auto-redirect logic
  useEffect(() => {
    const currentAdm1Key = getParam('adm1Key');
    
    // Don't auto-redirect if user already has a selection
    if (currentAdm1Key) {
      return;
    }
    
    if (dataset && adm0Key) {
      if (adm0Key === 'all_adm0') {
        const nextRoute = getNextRoute('/adm1', startingFilter);
        setParamAndNavigate('adm1Key', 'all_adm1', nextRoute);
        return;
      }
      
      const filtered = dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];
      const options = ['all_adm1', ...filtered];
      
      if (options.length === 2) {
        const selectedAdm1 = options[1];
        const nextRoute = getNextRoute('/adm1', startingFilter);
        setParamAndNavigate('adm1Key', selectedAdm1, nextRoute);
      }
    }
  }, [dataset, adm0Key, startingFilter, setParamAndNavigate, getParam]);

  // Don't render if auto-redirecting
  const currentAdm1Key = getParam('adm1Key');
  if (!currentAdm1Key && dataset && adm0Key) {
    if (adm0Key === 'all_adm0') {
      return <div>Redirecting...</div>;
    }
    
    const filtered = dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];
    const options = ['all_adm1', ...filtered];
    
    if (options.length === 2) {
      return <div>Redirecting...</div>;
    }
  }

  const getTitle = () => {
    if (adm0Key && adm0Key !== 'all_adm0') {
      const countryName = admData.adm0?.[adm0Key]?.name || adm0Key;
      return `Select region of ${countryName}`;
    }
    return 'Select Region';
  };

  return (
    <GeneralSelectComponent
      route="/adm1"
      paramKey="adm1Key"
      title={getTitle()}
      description="Click on a row to select a region:"
      getOptions={getAdm1Options}
      getContextDisplay={getContextDisplay}
      tableHeaders={[]}
      customBackHandler={handleBack}
      onSelect={handleLocationSelection}
    />
  );
};

export default SelectAdm1;
