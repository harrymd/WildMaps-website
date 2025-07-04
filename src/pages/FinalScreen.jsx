import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import { useState, useEffect } from 'react';
import BarChart from '../Components/BarChart';
import { panToBoundingBox, getBoundingBoxFromLocation } from '../utils/mapPanningUtils';

const FinalScreen = () => {
  const navigate = useNavigate();
  const { data, admData, setData } = useAppContext();
  const { getParam, getAllParams, setParam } = useFilterState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const datasetKey = getParam('datasetKey');
  
  // Initialize with default values if not present
  const [adm0Key, setAdm0Key] = useState(getParam('adm0Key') || 'all_adm0');
  const [adm1Key, setAdm1Key] = useState(getParam('adm1Key') || 'all_adm1');
  
  const allParams = getAllParams();
  
  const dataset = data?.[datasetKey];
  const adm1_list_filtered = adm0Key === 'all_adm0'
    ? dataset?.adm1_list || []
    : dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];

  // Set default values in URL if not present
  useEffect(() => {
    const currentAdm0 = getParam('adm0Key');
    const currentAdm1 = getParam('adm1Key');
    
    if (!currentAdm0) {
      setParam('adm0Key', 'all_adm0');
    }
    if (!currentAdm1) {
      setParam('adm1Key', 'all_adm1');
    }
  }, [getParam, setParam]);

  const handleReset = () => {
    navigate('/');
  };

  const handlePrevious = () => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete('adm0Key');
    currentParams.delete('adm1Key');
    navigate(`/dataset?${currentParams.toString()}`);
  };

  // Get ADM0 options using the same logic as SelectAdm0
  const getAdm0Options = () => {
    if (!dataset) return [];
    
    const options = ['all_adm0', ...(dataset?.adm0_list || [])];
    return options.map(key => ({
      value: key,
      label: key === 'all_adm0'
        ? 'All countries (entire extent of dataset)'
        : admData.adm0?.[key]?.name || key
    }));
  };

  // Get ADM1 options using the same logic as SelectAdm1
  const getAdm1Options = () => {
    if (!dataset || !adm0Key) return [];

    if (adm0Key === 'all_adm0') {
      return [{
        value: 'all_adm1',
        label: 'All regions (entire extent of dataset)'
      }];
    }

    const filtered = dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];
    const options = ['all_adm1', ...filtered];
    
    return options.map(key => ({
      value: key,
      label: key === 'all_adm1'
        ? 'All regions (entire extent of country)'
        : admData.adm1?.[key]?.name || key
    }));
  };

  const handleAdm0Change = (e) => {
    const newAdm0Key = e.target.value;
    setAdm0Key(newAdm0Key);
    setParam('adm0Key', newAdm0Key);
    
    // Add map panning for countries
    if (newAdm0Key !== 'all_adm0' && admData.adm0?.[newAdm0Key]?.bbox) {
      const bbox = getBoundingBoxFromLocation(
        { [newAdm0Key]: { bbox: admData.adm0[newAdm0Key].bbox } }, 
        newAdm0Key
      );
      if (bbox) {
        panToBoundingBox(null, bbox, {
          method: 'event',
          eventName: 'panToCountry',
          duration: 2000,
          padding: 40
        });
      }
    } else if (newAdm0Key === 'all_adm0' && dataset?.raster_summary?.bounds) {
      // Pan to dataset bounds when "all_adm0" is selected
      panToBoundingBox(null, dataset.raster_summary.bounds, {
        method: 'event',
        eventName: 'panToCountry',
        duration: 2000,
        padding: 40
      });
    }
    
    // Reset adm1 when adm0 changes
    if (newAdm0Key === 'all_adm0') {
      setAdm1Key('all_adm1');
      setParam('adm1Key', 'all_adm1');
    } else {
      // Check if current adm1 is still valid for new adm0
      const newAdm1Options = dataset?.adm1_list?.filter(a => a.slice(0, 3) === newAdm0Key.slice(0, 3)) || [];
      const allAdm1Options = ['all_adm1', ...newAdm1Options];
      
      if (!allAdm1Options.includes(adm1Key)) {
        setAdm1Key('all_adm1');
        setParam('adm1Key', 'all_adm1');
      }
    }
  };

  const handleAdm1Change = (e) => {
    const newAdm1Key = e.target.value;
    setAdm1Key(newAdm1Key);
    setParam('adm1Key', newAdm1Key);
    
    // Add map panning for regions
    if (newAdm1Key !== 'all_adm1' && admData.adm1?.[newAdm1Key]?.bbox) {
      const bbox = getBoundingBoxFromLocation(
        { [newAdm1Key]: { bbox: admData.adm1[newAdm1Key].bbox } }, 
        newAdm1Key
      );
      if (bbox) {
        panToBoundingBox(null, bbox, {
          method: 'event',
          eventName: 'panToAdm1',
          duration: 2000,
          padding: 40
        });
      }
    } else if (newAdm1Key === 'all_adm1') {
      // Pan back to country or dataset level when "all_adm1" is selected
      if (adm0Key !== 'all_adm0' && admData.adm0?.[adm0Key]?.bbox) {
        // Pan to country bounds
        const bbox = getBoundingBoxFromLocation(
          { [adm0Key]: { bbox: admData.adm0[adm0Key].bbox } }, 
          adm0Key
        );
        if (bbox) {
          panToBoundingBox(null, bbox, {
            method: 'event',
            eventName: 'panToCountry',
            duration: 2000,
            padding: 40
          });
        }
      } else if (dataset?.raster_summary?.bounds) {
        // Pan to dataset bounds
        panToBoundingBox(null, dataset.raster_summary.bounds, {
          method: 'event',
          eventName: 'panToCountry',
          duration: 2000,
          padding: 40
        });
      }
    }
  };

  const labels = ['Low', 'Low-med', 'High-med', 'High'];

  useEffect(() => {
    if (!datasetKey || !dataset) return;
    
    // Check if detailed data is already loaded
    if (dataset.whole || dataset.country || dataset['adm1-zone']) {
      return;
    }
    
    const loadDetailedData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
        const PATH_RESULTS = `${BUCKET_URL}/data_outputs/raster_analysis`;
        
        const response = await fetch(`${PATH_RESULTS}/results_${datasetKey}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load detailed data: ${response.statusText}`);
        }
        
        const detailedData = await response.json();
        
        // Update the data in context
        setData(prevData => ({
          ...prevData,
          [datasetKey]: {
            ...prevData[datasetKey],
            ...detailedData
          }
        }));
        
      } catch (err) {
        console.error('Error loading detailed data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadDetailedData();
  }, [datasetKey, dataset, setData]);
  
  let sub_data;
  if (adm0Key === 'all_adm0') {
    sub_data = dataset?.whole?.whole;
  } else if (adm1Key === 'all_adm1') {
    sub_data = dataset?.country?.[adm0Key];
  } else {
    sub_data = dataset?.['adm1-zone']?.[adm1Key];
  }

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

  const adm0Options = getAdm0Options();
  const adm1Options = getAdm1Options();

  if (loading) {
    return (
      <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading detailed data...</div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t pt-4 bg-white h-15">
          <div className="flex justify-between gap-2">
            <button
              onClick={handlePrevious}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handleReset}
              disabled
              className="bg-red-500 text-white px-4 py-2 rounded opacity-50"
            >
              Reset Parameters
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
          <div className="text-red-600 p-4 bg-red-50 rounded">
            <h3 className="font-semibold">Error loading data</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t pt-4 bg-white h-15">
          <div className="flex justify-between gap-2">
            <button
              onClick={handlePrevious}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reset Parameters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
      {/* Content area with scrolling */}
      <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
        <h2 className="text-2xl mb-4">Summary</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Your Selection Path:</h3>
          <ul className="space-y-1">
            {allParams.superspecies && (
              <li><strong>Taxon:</strong> {allParams.superspecies}</li>
            )}
            {allParams.region && (
              <li><strong>Region:</strong> {allParams.region}</li>
            )}
            {allParams.subregion && (
              <li><strong>Sub-region:</strong> {allParams.subregion}</li>
            )}
            {datasetKey && (
              <li><strong>Dataset:</strong> {(dataset?.source_text || 'Unknown') + ' - ' + (dataset?.common_name || 'Unknown species')}</li>
            )}
          </ul>
        </div>

        {/* Location Selection Dropdowns */}
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="text-lg font-semibold mb-3">Location Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adm0-select" className="block text-sm font-medium mb-1">
                Country:
              </label>
              <select
                id="adm0-select"
                value={adm0Key}
                onChange={handleAdm0Change}
                className="w-full p-2 border rounded-md"
              >
                {adm0Options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="adm1-select" className="block text-sm font-medium mb-1">
                Region:
              </label>
              <select
                id="adm1-select"
                value={adm1Key}
                onChange={handleAdm1Change}
                disabled={adm0Key === 'all_adm0'}
                className="w-full p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {adm1Options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {adm0Key === 'all_adm0' && (
                <p className="text-sm text-gray-500 mt-1">
                  Select a specific country to choose regions
                </p>
              )}
            </div>
          </div>
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
      </div>
      
      {/* Fixed navigation buttons at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t pt-4 bg-white h-15">
        <div className="flex justify-between gap-2">
          <button
            onClick={handlePrevious}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={handleReset}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reset Parameters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalScreen;
