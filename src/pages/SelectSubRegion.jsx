// SelectSubRegion.jsx
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useMapPanning } from '../hooks/useMapPanning';

const SelectSubRegion = () => {
  const { subregionData } = useAppContext();
  const { handleLocationSelection } = useMapPanning('subregion', subregionData, 'panToSubregion');

  const getSubRegionOptions = (allParams, data) => {
    let filteredData = data || {};
    
    // Filter by superspecies if selected
    if (allParams.superspecies) {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([key, entry]) => 
          entry.superspecies === allParams.superspecies
        )
      );
    }
    
    // Filter by region if selected
    if (allParams.region) {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([key, entry]) => 
          entry.regions && entry.regions.includes(allParams.region)
        )
      );
    }
    
    // Get all subregions from filtered data (flattening the subregions arrays)
    const allSubregions = Object.values(filteredData)
      .flatMap(entry => entry.subregions || [])
      .filter(subregion => subregion && subregion.trim() !== '');
    
    // Get unique subregions
    const uniqueSubregions = [...new Set(allSubregions)];
    
    // Sort alphabetically and return as options
    //return uniqueSubregions
    //  .sort((a, b) => a.localeCompare(b))
    //  .map(subregion => ({
    //    value: subregion,
    //    cells: [subregion]
    //  }));
    return uniqueSubregions
      .sort((a, b) => a.localeCompare(b))
      .map(subregion => ({
        value: subregion,
        cells: [subregion === 'none' ? 'Entire region' : subregion]
      }));
  };

  return (
    <GeneralSelectComponent
      route="/subregion"
      paramKey="subregion"
      title="sub-region"
      description="Click on a row to select a sub-region:"
      getOptions={getSubRegionOptions}
      //getContextDisplay={getContextDisplay}
      tableHeaders={[]} // No headers
      onSelect={handleLocationSelection}
    />
  );
};

export default SelectSubRegion;
