import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const FinalScreen = () => {
  const { datasetKey, adm0Key, adm1Key } = useParams();
  const navigate = useNavigate();
  const { data, setDatasetKey, setAdm0Key, setAdm1Key } = useAppContext();
  const dataset = data.raw?.[datasetKey];
  const adm1_list_filtered = adm0Key === 'all_adm0'
    ? dataset?.adm1_list || []
    : dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];

  const handleReset = () => {
    setDatasetKey(null);
    setAdm0Key(null);
    setAdm1Key(null);
    navigate('/');
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Summary</h2>
      <ul className="mb-4">
        <li><strong>Dataset:</strong> {datasetKey}</li>
        <li><strong>Adm0:</strong>{adm0Key} (out of {dataset?.adm0_list?.length ?? 0} options)</li>
        <li><strong>Adm1:</strong>{adm1Key} (out of {adm1_list_filtered?.length ?? 0} options)</li>
      </ul>
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
