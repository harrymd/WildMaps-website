// FinalScreen.jsx
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import { getPreviousRoute } from '../utils/navigationUtils';
import BarChart from '../Components/BarChart';

const FinalScreen = () => {
  const navigate = useNavigate();
  const { data, setDatasetKey, setAdm0Key, setAdm1Key } = useAppContext();
  const { getParam, getAllParams } = useFilterState();
  
  const datasetKey = getParam('datasetKey');
  const adm0Key = getParam('adm0Key');
  const adm1Key = getParam('adm1Key');
  const startingFilter = getParam('startingFilter');
  const allParams = getAllParams();
  
  const dataset = data?.[datasetKey];
  const adm1_list_filtered = adm0Key === 'all_adm0'
    ? dataset?.adm1_list || []
    : dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];

  const handleReset = () => {
    setDatasetKey(null);
    setAdm0Key(null);
    setAdm1Key(null);
    navigate('/');
  };

  const handlePrevious = () => {
    const navigate = useNavigate();
    const dataset = data?.[datasetKey];
    
    // Check if SelectAdm1 would auto-redirect (only one region option)
    let skipAdm1 = false;
    if (dataset && adm0Key) {
      let adm1Options;
      if (adm0Key === 'all_adm0') {
        adm1Options = ['all_adm1'];
      } else {
        const filtered = dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];
        adm1Options = ['all_adm1', ...filtered];
      }
      skipAdm1 = adm1Options.length <= 2; // Only 'all_adm1' or 'all_adm1' + one option
    }
    
    // Check if SelectAdm0 would auto-redirect (only one country option)
    let skipAdm0 = false;
    if (dataset && dataset.adm0_list) {
      const adm0Options = ['all_adm0', ...dataset.adm0_list];
      skipAdm0 = adm0Options.length <= 2; // Only 'all_adm0' or 'all_adm0' + one option
    }
    
    const currentParams = new URLSearchParams(window.location.search);
    
    if (skipAdm1 && skipAdm0) {
      // Skip both SelectAdm1 and SelectAdm0, go back to SelectDataset
      currentParams.delete('adm0Key');
      currentParams.delete('adm1Key');
      currentParams.delete('datasetKey');
      navigate(`/dataset?${currentParams.toString()}`);
    } else if (skipAdm1) {
      // Skip SelectAdm1, go back to SelectAdm0
      currentParams.delete('adm1Key');
      currentParams.delete('datasetKey');
      navigate(`/adm0?${currentParams.toString()}`);
    } else {
      // Normal back to SelectAdm1
      console.log('AAA');
      currentParams.delete('datasetKey');
      navigate(`/adm1?${currentParams.toString()}`);
    }
  };

  const labels = ['Low', 'Low-med', 'High-med', 'High'];
  
  let sub_data;
  if (adm0Key === 'all_adm0') {
    sub_data = dataset?.whole?.whole;
  } else if (adm1Key === 'all_adm1') {
    sub_data = dataset?.country?.[adm0Key];
  } else {
    sub_data = dataset?.['adm1-zone']?.[adm1Key];
  }
  
  // Calculate fraction of protected areas in each bin.
  let chartData_PA_frac = [];
  if (sub_data?.area_km2_by_bin_in_PA) {
    const area_PA = sub_data.area_km2_by_bin_in_PA;
    const total = area_PA.reduce((sum, val) => sum + val, 0);
    chartData_PA_frac = area_PA.map((val, idx) => ({
      label: labels[idx],
      value: total > 0 ? val / total : 0
    }));
  }

  // Step 2: Extract PA and not_PA arrays
  const area_PA = sub_data?.area_km2_by_bin_in_PA || [];
  const area_not_PA = sub_data?.area_km2_by_bin_not_in_PA || [];
  
  // Step 3: Construct stacked data in the format expected by the chart
  let chartData_areas_stacked = [];
  if (area_PA.length === labels.length && area_not_PA.length === labels.length) {
    for (let i = 0; i < labels.length; i++) {
      chartData_areas_stacked.push({
        label: labels[i],
        not_PA: area_not_PA[i],
        PA: area_PA[i],
      });
    }
  }

  // Helper function to get display names
  const getDisplayValue = (key, type) => {
    if (!key) return 'Not selected';
    
    switch (type) {
      case 'dataset':
        return dataset?.common_name || key;
      case 'adm0':
        return key === 'all_adm0' ? 'All countries' : key;
      case 'adm1':
        return key === 'all_adm1' ? 'All regions' : key;
      default:
        return key;
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Summary</h2>
      
      {/* Show selection path */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Your Selection Path:</h3>
        <ul className="space-y-1">
          {allParams.startingFilter && (
            <li><strong>Starting Filter:</strong> {allParams.startingFilter === 'region' ? 'Region First' : 'SuperSpecies First'}</li>
          )}
          {allParams.superspecies && (
            <li><strong>SuperSpecies:</strong> {allParams.superspecies}</li>
          )}
          {allParams.region && (
            <li><strong>Region:</strong> {allParams.region}</li>
          )}
          {allParams.subregion && (
            <li><strong>SubRegion:</strong> {allParams.subregion}</li>
          )}
          {datasetKey && (
            <li><strong>Dataset:</strong> {getDisplayValue(datasetKey, 'dataset')}</li>
          )}
          {adm0Key && (
            <li><strong>Country:</strong> {getDisplayValue(adm0Key, 'adm0')} (out of {dataset?.adm0_list?.length ?? 0} options)</li>
          )}
          {adm1Key && (
            <li><strong>Region:</strong> {getDisplayValue(adm1Key, 'adm1')} (out of {adm1_list_filtered?.length ?? 0} options)</li>
          )}
        </ul>
      </div>
      
      <BarChart data={chartData_PA_frac}
        title = 'Composition of protected area by suitability'
        xLabel  = 'Suitability'
        yLabel  = 'Proportion within protected areas'
      />
      <BarChart data={chartData_areas_stacked}
        title = 'Level of protection by suitability category'
        xLabel  = 'Suitability'
        yLabel  = 'Area (km²)'
      />
      <div className="flex gap-2">
        <button 
          onClick={handlePrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <button 
          onClick={handleReset} 
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reset Parameters
        </button>
      </div>
    </div>
  );
};

export default FinalScreen;
