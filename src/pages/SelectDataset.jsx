import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SelectDataset = () => {
  const { data, setDatasetKey, datasetKey, setAdm0Key, setAdm1Key } = useAppContext();
  const navigate = useNavigate();

  const handleSelect = (key) => {
    setDatasetKey(key);
    setAdm0Key(null);
    setAdm1Key(null);
  };

  const handleNext = () => {
    if (datasetKey) navigate(`/${datasetKey}`);
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Select dataset</h2>
      <p className = "mb-4">Click on a row to select a study (it will show on the map):</p>
      <table className="w-full mb-4 border">
        <thead>
          <tr>
            {/*<th className="border px-2">Key</th>*/}
            <th className="border px-2 text-left">Species</th>
            <th className="border px-2 text-left">Study Area</th>
            <th className="border px-2 text-left">Source</th>
          </tr>
        </thead>
        <tbody>
          {/*Object.entries(data.summary || {}).map(([key, { species, study_area, source_text }]) => (*/}
          {Object.entries(data || {}).map(([key, { species, study_area, source_text }]) => (
            <tr key={key} onClick={() => handleSelect(key)} className={`cursor-pointer ${key === datasetKey ? 'bg-blue-100' : ''}`}>
              {/*<td className="border px-2">{key}</td>*/}
              <td className="border px-2">{species}</td>
              <td className="border px-2">{study_area}</td>
              <td className="border px-2">{source_text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleNext}
        disabled={!datasetKey}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default SelectDataset;
