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
    
    // Create options with emoji and description, then sort by description
    return uniqueSuperSpecies
      .map(superspecies => {
        const info = superSpeciesData[superspecies];
        const emoji = info?.emoji || '';
        console.log(info);
        //const description = info?.description || 'No description available';
        const scientific_name = info?.scientific_name || '-';
        const common_name = info?.common_name || '-';
        return {
          superspecies,
          //emoji,
          //description,
          scientific_name,
          displayText: `${scientific_name} (${common_name})`.trim()
        };
      })
      //.sort((a, b) => a.description.localeCompare(b.description))
      .sort((a, b) => a.scientific_name.localeCompare(b.scientific_name))
      .map(item => ({
        value: item.superspecies,
        cells: [item.displayText]
      }));
  };

  return (
    <GeneralSelectComponent
      route="/superspecies"
      paramKey="superspecies"
      title="taxon"
      description="Click on a row to select a taxon:"
      getOptions={getSuperSpeciesOptions}
      //getContextDisplay={getContextDisplay}
      tableHeaders={[]} // Empty array = no headers
    />
  );
};

export default SelectSuperSpecies;
