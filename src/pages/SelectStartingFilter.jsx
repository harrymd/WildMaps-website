import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectStartingFilter = () => {
  const [selectedFilter, setSelectedFilter] = useState('');
  const navigate = useNavigate();
  
  const handleNext = () => {
    if (!selectedFilter) return;
    
    if (selectedFilter === 'region') {
      navigate(`/region?startingFilter=region`);
    } else {
      navigate(`/superspecies?startingFilter=superspecies`);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl mb-4">Choose starting theme</h2>
      <p className="mb-4">Select how you'd like to begin filtering your data:</p>
      
      <div className="mb-4">
        <div className="mb-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="startingFilter"
              value="region"
              checked={selectedFilter === 'region'}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="mr-2"
            />
            🗺️ Start with geographical region 
          </label>
        </div>
        
        <div className="mb-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="startingFilter"
              value="superspecies"
              checked={selectedFilter === 'superspecies'}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="mr-2"
            />
            🐆 Start with animal type (taxon)
          </label>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleNext}
          disabled={!selectedFilter}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectStartingFilter;
