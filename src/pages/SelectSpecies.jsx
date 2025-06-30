import { useState } from 'react';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute, getPreviousRoute } from '../utils/navigationUtils';
import { useAppContext } from '../context/AppContext';

const SelectSpecies = () => {
  const { data } = useAppContext();
  const { getParam, getAllParams, setParamAndNavigate } = useFilterState();
  const [selectedSpecies, setSelectedSpecies] = useState(getParam('species') || '');
  const startingFilter = getParam('startingFilter');
  const selectedSuperSpecies = getParam('superspecies');
  
  const handleSelect = (species) => {
    setSelectedSpecies(species);
  };
  
  const handleNext = () => {
    if (!selectedSpecies) return;
    const nextRoute = getNextRoute('/species', startingFilter);
    setParamAndNavigate('species', selectedSpecies, nextRoute);
  };
  
  const handleBack = () => {
    const prevRoute = getPreviousRoute('/species', startingFilter);
    setParamAndNavigate('species', selectedSpecies, prevRoute);
  };
  
  // Mock species data - replace with actual data source based on selectedSuperSpecies
  const speciesList = selectedSuperSpecies === 'Pinus' 
    ? ['radiata', 'sylvestris', 'nigra', 'strobus', 'taeda']
    : ['alba', 'nigra', 'rubra', 'pendula', 'tremula'];
  
  return (
    <div>
      <h2 className="text-2xl mb-4">Select Species</h2>
      <p className="mb-4">SuperSpecies: <strong>{selectedSuperSpecies}</strong></p>
      <p className="mb-4">Click on a row to select a species:</p>
      
      <table className="w-full mb-4 border">
        <thead>
          <tr>
            <th className="border px-2 text-left">Species</th>
          </tr>
        </thead>
        <tbody>
          {speciesList.map((species) => (
            <tr 
              key={species} 
              onClick={() => handleSelect(species)} 
              className={`cursor-pointer ${species === selectedSpecies ? 'bg-blue-100' : ''}`}
            >
              <td className="border px-2">{species}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex gap-2">
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedSpecies}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectSpecies;
