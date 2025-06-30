// SelectRegion.jsx
import { useEffect } from 'react';
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import { useMapPanning } from '../hooks/useMapPanning';

const SelectRegion = () => {
  const { regionData } = useAppContext();
  const { getParam } = useFilterState();


  const getRegionOptions = (allParams, data) => {
    let filteredData = data || {};
    
    // Filter by superspecies if selected
    if (allParams.superspecies) {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([key, entry]) => 
          entry.superspecies === allParams.superspecies
        )
      );
    }
    
    // Get all regions from filtered data
    const allRegions = Object.values(filteredData)
      .flatMap(entry => entry.regions || [])
      .filter(region => region && region.trim() !== '');
    
    const uniqueRegions = [...new Set(allRegions)];
    
    return uniqueRegions
      .sort((a, b) => a.localeCompare(b))
      .map(region => ({
        value: region,
        cells: [region]
      }));
  };

  const getContextDisplay = (allParams) => {
    if (allParams.superspecies) {
      return (
        <div className="mb-4">
          <p className="mb-1">SuperSpecies: <strong>{allParams.superspecies}</strong></p>
        </div>
      );
    }
    return null;
  };


  const { handleLocationSelection } = useMapPanning('region', regionData, 'panToRegion');

  return (
    <GeneralSelectComponent
      route="/region"
      paramKey="region"
      title="Region"
      description="Click on a row to select a region:"
      getOptions={getRegionOptions}
      getContextDisplay={getContextDisplay}
      tableHeaders={[]}
      onSelect={handleLocationSelection}
    />
  );
};

export default SelectRegion;
