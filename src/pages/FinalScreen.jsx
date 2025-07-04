import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import BarChart from '../Components/BarChart';
import { useDetailedData } from '../hooks/useDetailedData';
import { useLocationSelection } from '../hooks/useLocationSelection';
import { processChartData } from '../utils/chartDataUtils';
import SelectionPath from '../components/SelectionPath';
import LocationSelector from '../components/LocationSelector';
import NavigationButtons from '../components/NavigationButtons';

const FinalScreen = () => {
  const navigate = useNavigate();
  const { data, admData, setData } = useAppContext();
  const { getParam, getAllParams } = useFilterState();
  
  const datasetKey = getParam('datasetKey');
  const dataset = data?.[datasetKey];
  const allParams = getAllParams();
  
  const { loading, error } = useDetailedData(datasetKey, dataset, setData);
  
  const {
    adm0Key,
    adm1Key,
    adm0Options,
    adm1Options,
    handleAdm0Change,
    handleAdm1Change
  } = useLocationSelection(getParam, useFilterState().setParam, dataset, admData);

  const handlePrevious = () => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete('adm0Key');
    currentParams.delete('adm1Key');
    navigate(`/dataset?${currentParams.toString()}`);
  };

  const handleReset = () => {
    navigate('/');
  };

  // Get chart data
  let sub_data;
  if (adm0Key === 'all_adm0') {
    sub_data = dataset?.whole?.whole;
  } else if (adm1Key === 'all_adm1') {
    sub_data = dataset?.country?.[adm0Key];
  } else {
    sub_data = dataset?.['adm1-zone']?.[adm1Key];
  }

  const { chartData_areas_transposed, chartData_landuse } = processChartData(sub_data);
  const customColors = ['#472d7b', '#2c728e', '#28ae80', '#addc30'];

  if (loading) {
    return (
      <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading detailed data...</div>
          </div>
        </div>
        <NavigationButtons onPrevious={handlePrevious} onReset={handleReset} disabled />
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
        <NavigationButtons onPrevious={handlePrevious} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
      <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
        <h2 className="text-2xl mb-4">Summary</h2>
        
        <SelectionPath allParams={allParams} dataset={dataset} />
        
        <LocationSelector
          adm0Key={adm0Key}
          adm1Key={adm1Key}
          adm0Options={adm0Options}
          adm1Options={adm1Options}
          onAdm0Change={handleAdm0Change}
          onAdm1Change={handleAdm1Change}
        />
        
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
      
      <NavigationButtons onPrevious={handlePrevious} onReset={handleReset} />
    </div>
  );
};

export default FinalScreen;
