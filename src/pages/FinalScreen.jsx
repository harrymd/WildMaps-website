import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import BarChart from '../Components/BarChart';

const FinalScreen = () => {
  const navigate = useNavigate();
  const { data } = useAppContext();
  const { getParam, getAllParams } = useFilterState();
  
  const datasetKey = getParam('datasetKey');
  const adm0Key = getParam('adm0Key');
  const adm1Key = getParam('adm1Key');
  const allParams = getAllParams();
  
  const dataset = data?.[datasetKey];
  const adm1_list_filtered = adm0Key === 'all_adm0'
    ? dataset?.adm1_list || []
    : dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];

  const handleReset = () => {
    navigate('/');
  };

  const handlePrevious = () => {
    const dataset = data?.[datasetKey];
    
    // Check if SelectAdm1 would auto-redirect
    let skipAdm1 = false;
    if (dataset && adm0Key) {
      let adm1Options;
      if (adm0Key === 'all_adm0') {
        adm1Options = ['all_adm1'];
      } else {
        const filtered = dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];
        adm1Options = ['all_adm1', ...filtered];
      }
      skipAdm1 = adm1Options.length <= 2;
    }
    
    // Check if SelectAdm0 would auto-redirect
    let skipAdm0 = false;
    if (dataset && dataset.adm0_list) {
      const adm0Options = ['all_adm0', ...dataset.adm0_list];
      skipAdm0 = adm0Options.length <= 2;
    }
    
    const currentParams = new URLSearchParams(window.location.search);
    
    if (skipAdm1 && skipAdm0) {
      currentParams.delete('adm0Key');
      currentParams.delete('adm1Key');
      navigate(`/dataset?${currentParams.toString()}`);
    } else if (skipAdm1) {
      currentParams.delete('adm1Key');
      navigate(`/adm0?${currentParams.toString()}`);
    } else {
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
  
  //// Calculate fraction of protected areas in each bin
  //let chartData_PA_frac = [];
  //if (sub_data?.area_km2_by_bin_in_PA) {
  //  const area_PA = sub_data.area_km2_by_bin_in_PA;
  //  const total = area_PA.reduce((sum, val) => sum + val, 0);
  //  chartData_PA_frac = area_PA.map((val, idx) => ({
  //    label: labels[idx],
  //    value: total > 0 ? val / total : 0
  //  }));
  //}

  // Extract PA and not_PA arrays
  const area_PA = sub_data?.area_km2_by_bin_in_PA || [];
  const area_not_PA = sub_data?.area_km2_by_bin_not_in_PA || [];

  const sum_PA = area_PA.reduce((sum, val) => sum + val, 0);
  const sum_not_PA = area_not_PA.reduce((sum, val) => sum + val, 0);
  
  const area_PA_frac = area_PA.map(val => sum_PA > 0 ? (val / sum_PA) * 100 : 0);
  const area_not_PA_frac = area_not_PA.map(val => sum_not_PA > 0 ? (val / sum_not_PA) * 100 : 0);
  
  // Construct transposed stacked data: 2 bars (Unprotected, Protected) with 4 stacks each (Low to High)
  let chartData_areas_transposed = [];
  if (area_PA_frac.length === labels.length && area_not_PA_frac.length === labels.length) {
    chartData_areas_transposed = [
      {
        label: 'Unprotected',
        Low: area_not_PA_frac[0],
        'Low-med': area_not_PA_frac[1],
        'High-med': area_not_PA_frac[2],
        High: area_not_PA_frac[3]
      },
      {
        label: 'Protected',
        Low: area_PA_frac[0],
        'Low-med': area_PA_frac[1],
        'High-med': area_PA_frac[2],
        High: area_PA_frac[3]
      }
    ];
  }

  // Prepare land use chart data
  let chartData_landuse = [];
  let chartData_landuse_normalized = [];
  
  if (sub_data?.area_km2_by_landuse_and_bin) {
    const landuse_data = sub_data.area_km2_by_landuse_and_bin;
    
    // Calculate sum for each land use category
    const category_sums = {};
    let total_sum = 0;
    
    Object.entries(landuse_data).forEach(([category, values]) => {
      const sum = values.reduce((acc, val) => acc + val, 0);
      category_sums[category] = sum;
      total_sum += sum;
    });
    
    // Determine which categories are >= 1% of total
    const threshold = total_sum * 0.01;
    const major_categories = [];
    const minor_categories = [];
    
    Object.entries(category_sums).forEach(([category, sum]) => {
      if (sum >= threshold) {
        major_categories.push(category);
      } else {
        minor_categories.push(category);
      }
    });
    
    // Build chart data for major categories
    major_categories.forEach(category => {
      const values = landuse_data[category];
      const sum = category_sums[category];
      
      // Raw values
      chartData_landuse.push({
        label: category,
        Low: values[0],
        'Low-med': values[1], 
        'High-med': values[2],
        High: values[3]
      });
      
      // Normalized values (percentages within category)
      chartData_landuse_normalized.push({
        label: category,
        Low: sum > 0 ? (values[0] / sum) * 100 : 0,
        'Low-med': sum > 0 ? (values[1] / sum) * 100 : 0,
        'High-med': sum > 0 ? (values[2] / sum) * 100 : 0,
        High: sum > 0 ? (values[3] / sum) * 100 : 0
      });
    });
    
    // Add "Other" category if there are minor categories
    if (minor_categories.length > 0) {
      const other_values = [0, 0, 0, 0];
      let other_sum = 0;
      
      minor_categories.forEach(category => {
        const values = landuse_data[category];
        other_values[0] += values[0];
        other_values[1] += values[1]; 
        other_values[2] += values[2];
        other_values[3] += values[3];
        other_sum += category_sums[category];
      });
      
      // Raw values
      chartData_landuse.push({
        label: 'Other',
        Low: other_values[0],
        'Low-med': other_values[1],
        'High-med': other_values[2], 
        High: other_values[3]
      });
      
      // Normalized values
      chartData_landuse_normalized.push({
        label: 'Other',
        Low: other_sum > 0 ? (other_values[0] / other_sum) * 100 : 0,
        'Low-med': other_sum > 0 ? (other_values[1] / other_sum) * 100 : 0,
        'High-med': other_sum > 0 ? (other_values[2] / other_sum) * 100 : 0,
        High: other_sum > 0 ? (other_values[3] / other_sum) * 100 : 0
      });
    }
  }

  // Custom colors for the 4 suitability levels (bottom to top of stack)
  const customColors = ['#472d7b', '#2c728e', '#28ae80', '#addc30'];

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
      
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Your Selection Path:</h3>
        <ul className="space-y-1">
          {/*allParams.startingFilter && (
            <li><strong>Starting Filter:</strong> {allParams.startingFilter === 'region' ? 'Region First' : 'SuperSpecies First'}</li>
          )*/}
          {allParams.superspecies && (
            <li><strong>Taxon:</strong> {allParams.superspecies}</li>
          )}
          {allParams.region && (
            <li><strong>Region:</strong> {allParams.region}</li>
          )}
          {allParams.subregion && (
            <li><strong>Sub-region:</strong> {allParams.subregion}</li>
          )}
          {/*datasetKey && (
            <li><strong>Dataset:</strong> {getDisplayValue(datasetKey, 'dataset')}</li>
          )*/}
          {datasetKey && (
            <li><strong>Dataset:</strong> {(dataset?.source_text || 'Unknown') + ' - ' + (dataset?.common_name || 'Unknown species')}</li>
          )}
          {adm0Key && (
            <li><strong>Country:</strong> {getDisplayValue(adm0Key, 'adm0')} (out of {dataset?.adm0_list?.length ?? 0} options)</li>
          )}
          {adm1Key && (
            <li><strong>Region:</strong> {getDisplayValue(adm1Key, 'adm1')} (out of {adm1_list_filtered?.length ?? 0} options)</li>
          )}
        </ul>
      </div>
      
      <BarChart 
        data={chartData_areas_transposed}
        title='Level of protection by suitability category'
        xLabel='Land type'
        yLabel='Proportion this land category (%)'
        colors={customColors}
      />
      <BarChart 
        data={chartData_landuse}
        title='Area by land class and suitability category'
        xLabel='Land class'
        yLabel='Area (km²)'
        colors={customColors}
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
