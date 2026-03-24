import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import type { DatasetMap } from '../types';

/** Taxon selection — filters by region and subregion if already selected. */
const SelectSuperSpecies = () => {
  const { superSpeciesData } = useAppContext();

  const getSuperSpeciesOptions = (allParams: Record<string, string>, data: DatasetMap) => {
    let filtered = data;

    if (allParams.region) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([, entry]) => entry.regions?.includes(allParams.region))
      );
    }

    if (allParams.subregion) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(
          ([, entry]) => entry.subregions?.includes(allParams.subregion)
        )
      );
    }

    const uniqueSuperSpecies = [
      ...new Set(
        Object.values(filtered)
          .map((entry) => entry.superspecies)
          .filter((s): s is string => !!s && s !== 'Unknown taxon')
      ),
    ];

    return uniqueSuperSpecies
      .map((superspecies) => {
        const info = superSpeciesData[superspecies];
        const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '-');
        return {
          superspecies,
          scientific_name: capitalize(info?.scientific_name ?? '-'),
          common_name:     capitalize(info?.common_name ?? '-'),
        };
      })
      .sort((a, b) => a.scientific_name.localeCompare(b.scientific_name))
      .map(({ superspecies, scientific_name, common_name }) => ({
        value: superspecies,
        cells: [scientific_name, common_name],
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
