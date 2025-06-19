import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SelectAdm1 = () => {
  const { datasetKey, adm0Key } = useParams();
  const { data, setAdm1Key, adm1Key } = useAppContext();
  const navigate = useNavigate();
  //const dataset = data.raw?.[datasetKey];
  const dataset = data?.[datasetKey];
  const filtered = dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];
  const options = ['all_adm1', ...filtered];
  
  // Redirect immediately to the next step if there is only one option.
  useEffect(() => {
    if (options.length === 2) {
    //if (1 === 1) {
      // Select the first (and only) adm0Key.
      // Note: this is element 1, not element 0 (see definition of
      // options above).
      setAdm1Key(options[1]);

      //setAdm1Key(null);
      navigate(`/${datasetKey}/${adm0Key}/${adm1Key}`);
    }
  }, [options, datasetKey, navigate, setAdm1Key]);

  const handleSelect = (key) => {
    setAdm1Key(key);
  };

  const handleNext = () => {
    if (adm1Key) navigate(`/${datasetKey}/${adm0Key}/${adm1Key}`);
  };

  const handlePrevious= () => {
    if (dataset?.adm0_list.length === 1) {
      navigate(`/`);
    } else {
      if (datasetKey) navigate(`/${datasetKey}`);
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Select Region (Adm1)</h2>
      <ul className="mb-4">
        {options.map((key) => (
          <li key={key} onClick={() => handleSelect(key)} className={`cursor-pointer px-2 py-1 ${key === adm1Key ? 'bg-blue-100' : ''}`}>
            {key}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button onClick={handlePrevious} className="bg-gray-500 text-white px-4 py-2 rounded">Previous</button>
        <button onClick={handleNext} disabled={!adm1Key} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default SelectAdm1;
