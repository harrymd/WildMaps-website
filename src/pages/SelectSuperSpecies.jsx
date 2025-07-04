// SelectSuperSpecies.jsx
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';

const SelectSuperSpecies = () => {
  const { superSpeciesData } = useAppContext();

  const getSuperSpeciesOptions = (allParams, data) => {
    let filteredData = data || {};
    
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
    
    // Get unique superspecies from filtered data
    const uniqueSuperSpecies = [...new Set(
      Object.values(filteredData)
        .map(entry => entry.superspecies)
        .filter(superspecies => superspecies && superspecies !== 'Unknown taxon')
    )];
    
    // Create options with separate columns for scientific and common names
    return uniqueSuperSpecies                                                   
      .map(superspecies => {                                                    
        const info = superSpeciesData[superspecies];                            
        const emoji = info?.emoji || '';                                        
        console.log(info);                                                      
        const scientific_name = info?.scientific_name || '-';                   
        const common_name = info?.common_name || '-';                           
        
        // Capitalize the first letter of both names
        const capitalizedScientificName = scientific_name !== '-' ? 
          scientific_name.charAt(0).toUpperCase() + scientific_name.slice(1) : '-';
        const capitalizedCommonName = common_name !== '-' ? 
          common_name.charAt(0).toUpperCase() + common_name.slice(1) : '-';
        
        return {                                                                
          superspecies,                                                         
          scientific_name: capitalizedScientificName,                           
          common_name: capitalizedCommonName                                     
        };                                                                      
      })                                                                        
      .sort((a, b) => a.scientific_name.localeCompare(b.scientific_name))       
      .map(item => ({                                                           
        value: item.superspecies,                                               
        cells: [item.scientific_name, item.common_name]                         
      }));                                                                      
  };
  return (
    <GeneralSelectComponent
      route="/superspecies"
      paramKey="superspecies"
      title="taxon"
      description="Click on a row to select a taxon:"
      getOptions={getSuperSpeciesOptions}
      tableHeaders={['Scientific name', 'Common name']}
    />
  );
};

export default SelectSuperSpecies;
