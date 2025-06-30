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
        const description = info?.description || 'No description available';
        return {
          superspecies,
          emoji,
          description,
          displayText: `${emoji} ${description}`.trim()
        };
      })
      .sort((a, b) => a.description.localeCompare(b.description))
      .map(item => ({
        value: item.superspecies,
        cells: [item.displayText]
      }));
  };

  const getContextDisplay = (allParams) => {
    const context = [];
    if (allParams.region) {
      context.push(`Region: **${allParams.region}**`);
    }
    if (allParams.subregion) {
      context.push(`Sub-region: **${allParams.subregion}**`);
    }
    
    if (context.length > 0) {
      return (
        <div className="mb-4">
          {context.map((item, index) => (
            <p key={index} className="mb-1">
              {item.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <GeneralSelectComponent
      route="/superspecies"
      paramKey="superspecies"
      title="taxon"
      description="Click on a row to select a taxon:"
      getOptions={getSuperSpeciesOptions}
      getContextDisplay={getContextDisplay}
      tableHeaders={[]} // Empty array = no headers
    />
  );
};

export default SelectSuperSpecies;
