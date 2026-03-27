import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
// BUG FIX: was '../Components/BarChart' (capital C) — now correctly lowercase
import BarChart, { ColorSwatchBarChart } from '../components/BarChart';
import { useDetailedData } from '../hooks/useDetailedData';
import { useLocationSelection } from '../hooks/useLocationSelection';
import { processChartData } from '../utils/chartDataUtils';
import FinalSummary from '../components/FinalSummary';
import FinalDatasetInfo from '../components/FinalDatasetInfo';
import StudyDesignSection from '../components/StudyDesignSection';
import LocationSelector from '../components/LocationSelector';
import NavigationButtons from '../components/NavigationButtons';
import DataRangeInfo from '../components/DataRangeInfo';

/** Suitability-level colours used for both bar charts (violet → blue → green → lime). */
const CUSTOM_COLORS = ['#472d7b', '#2c728e', '#28ae80', '#addc30'];

/**
 * Final page of the selection workflow. Shows:
 * - Location selectors (ADM0 / ADM1) for sub-setting the charts
 * - Stacked bar chart: suitability by PA / non-PA land
 * - Stacked bar chart: area by land-use class
 * - Dataset metadata and attributions
 */
const FinalScreen = () => {
  const navigate = useNavigate();
  const { data, admData, setData, landUseColorSchemeData } = useAppContext();
  const { getParam, getAllParams, setParam } = useFilterState();

  const datasetKey = getParam('datasetKey');
  const dataset    = datasetKey ? data[datasetKey] : undefined;
  // getAllParams is kept for future use (e.g. ParameterSummary)
  const _allParams = getAllParams();

  const { loading, error } = useDetailedData(datasetKey, dataset, setData);

  const {
    adm0Key,
    adm1Key,
    adm0Options,
    adm1Options,
    handleAdm0Change,
    handleAdm1Change,
  } = useLocationSelection(getParam, setParam, dataset, admData);

  const handlePrevious = () => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete('adm0Key');
    currentParams.delete('adm1Key');
    navigate(`/dataset?${currentParams.toString()}`);
  };

  const handleReset = () => navigate('/');

  // Select the relevant data sub-set based on the current ADM selection
  const sub_data =
    adm0Key === 'all_adm0'
      ? dataset?.whole?.whole
      : adm1Key === 'all_adm1'
        ? dataset?.country?.[adm0Key ?? '']
        : dataset?.['adm1-zone']?.[adm1Key ?? ''];

  const { chartData_areas_transposed, chartData_landuse } = processChartData(sub_data);

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

        <FinalSummary />

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
          title="Suitability levels in protected and unprotected land"
          xLabel="Land type"
          yLabel="Proportion of land (%)"
          colors={CUSTOM_COLORS}
          yMax={100}
          xTickFontSize={18}
        />

        <ColorSwatchBarChart
          data={chartData_landuse}
          title="Area by land class and suitability category"
          xLabel="Land class (hover for description)"
          yLabel="Area (1,000 km²)"
          colors={CUSTOM_COLORS}
          landUseColorSchemeData={landUseColorSchemeData}
          yLabelOffset={60}
        />

        <DataRangeInfo />

        <div className="mb-4 text-sm">
          <p>
            Protected areas come from the{' '}
            <a
              href="http://protectedplanet.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
            >
              World Database on Protected Areas
            </a>{' '}
            (WDPA). The database is incomplete, so calculations of protected areas might be
            inaccurate; they are most likely to be underestimates. Land use categories come from
            the{' '}
            <a
              href="https://doi.org/10.2909/c6377c6e-76cc-4d03-8330-628a03693042"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
            >
              Copernicus Global Dynamic Land Cover
            </a>{' '}
            dataset.
          </p>
        </div>

        <FinalDatasetInfo />

        <StudyDesignSection />
      </div>

      <NavigationButtons onPrevious={handlePrevious} onReset={handleReset} />
    </div>
  );
};

export default FinalScreen;
