import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useFilterState } from '../hooks/useFilterState';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SelectDataset = () => {
  const { setParamAndNavigate } = useFilterState();
  const { speciesData } = useAppContext();
  const navigate = useNavigate();

  const getDatasetOptions = (allParams, data) => {
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
  
    // Filter by subregion if selected
    if (allParams.subregion) {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([key, entry]) =>
          entry.subregions && entry.subregions.includes(allParams.subregion)
        )
      );
    }
  
    // Return filtered datasets as table rows with formatted species names
    return Object.entries(filteredData).map(([key, entry]) => {
      const commonName = entry.common_name || 'Unknown species';
      const scientificName = entry.scientific_name || speciesData[commonName]?.scientific_name;
      
      // Capitalize the common name
      const capitalizedCommonName = commonName.charAt(0).toUpperCase() + commonName.slice(1);
      
      // Format species display with scientific name in italics if available
      const speciesDisplay = scientificName 
        ? (
            <span>
              {capitalizedCommonName} <em>({scientificName})</em>
            </span>
          )
        : capitalizedCommonName;

      return {
        value: key,
        cells: [speciesDisplay, entry.source_text || 'No source']
      };
    });
  };

  // Custom handler for dataset selection that goes directly to final screen
  const handleDatasetNext = (selectedValue) => {
    if (!selectedValue) return;
    
    // Navigate to final screen with default adm0 and adm1 values
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('datasetKey', selectedValue);
    currentParams.set('adm0Key', 'all_adm0');
    currentParams.set('adm1Key', 'all_adm1');
    
    navigate(`/final?${currentParams.toString()}`);
  };

  return (
    <GeneralSelectComponent
      route="/dataset"
      paramKey="datasetKey"
      title="Dataset"
      description="Click on a row to select a study (it will show on the map):"
      getOptions={getDatasetOptions}
      tableHeaders={['Species', 'Source']}
      customNextHandler={handleDatasetNext}
    />
  );
};

export default SelectDataset;
