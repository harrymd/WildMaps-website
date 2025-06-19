import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BarChart from '../Components/BarChart';

const FinalScreen = () => {
  const { datasetKey, adm0Key, adm1Key } = useParams();
  const navigate = useNavigate();
  const { data, setDatasetKey, setAdm0Key, setAdm1Key } = useAppContext();
  //const dataset = data.raw?.[datasetKey];
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

  return (
    <div>
      <h2 className="text-2xl mb-4">Summary</h2>
      <ul className="mb-4">
        <li><strong>Dataset:</strong> {datasetKey}</li>
        <li><strong>Adm0:</strong>{adm0Key} (out of {dataset?.adm0_list?.length ?? 0} options)</li>
        <li><strong>Adm1:</strong>{adm1Key} (out of {adm1_list_filtered?.length ?? 0} options)</li>
      </ul>
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
        <button onClick={() =>
          navigate(adm0Key === 'all_adm0' ? `/${datasetKey}` : `/${datasetKey}/${adm0Key}`)}
          className="bg-gray-500 text-white px-4 py-2 rounded">Previous</button>
        <button onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded">Reset Parameters</button>
      </div>
    </div>
  );
};

export default FinalScreen;
