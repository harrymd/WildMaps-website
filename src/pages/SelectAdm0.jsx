import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SelectAdm0 = () => {
  const { datasetKey } = useParams();
  const { data, setAdm0Key, adm0Key, setDatasetKey, setAdm1Key } = useAppContext();
  const navigate = useNavigate();
  //const dataset = data.raw?.[datasetKey];
  const dataset = data?.[datasetKey];
  const options = ['all_adm0', ...(dataset?.adm0_list || [])];
  console.log(options);

  // Redirect immediately to the next step if there is only one option.
  useEffect(() => {
    if (options.length === 2) {
    //if (1 === 1) {
      setAdm0Key(options[1]);
      //setAdm1Key(null);
      navigate(`/${datasetKey}/${adm0Key}`);
    }
  }, [options, datasetKey, navigate, setAdm0Key]);

  const handleSelect = (key) => {
    setAdm0Key(key);
    setAdm1Key(null);
  };

  const handleNext = () => {
    if (adm0Key === 'all_adm0') {
      navigate(`/${datasetKey}/${adm0Key}/all_adm1`);
    } else {
      navigate(`/${datasetKey}/${adm0Key}`);
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Select Country (Adm0)</h2>
      <ul className="mb-4">
        {options.map((key) => (
          <li key={key} onClick={() => handleSelect(key)} className={`cursor-pointer px-2 py-1 ${key === adm0Key ? 'bg-blue-100' : ''}`}>
            {key}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button onClick={() => navigate('/')} className="bg-gray-500 text-white px-4 py-2 rounded">Previous</button>
        <button onClick={handleNext} disabled={!adm0Key} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default SelectAdm0;
