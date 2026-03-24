import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useMapPanning } from '../hooks/useMapPanning';
import type { DatasetMap } from '../types';

/** Subregion selection — filters by both superspecies and region if already selected. */
const SelectSubRegion = () => {
  const { subregionData } = useAppContext();
  const { handleLocationSelection } = useMapPanning('subregion', subregionData, 'panToSubregion');

  const getSubRegionOptions = (allParams: Record<string, string>, data: DatasetMap) => {
    let filtered = data;

    if (allParams.superspecies) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([, entry]) => entry.superspecies === allParams.superspecies)
      );
    }

    if (allParams.region) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(
          ([, entry]) => entry.regions?.includes(allParams.region)
        )
      );
    }

    const uniqueSubregions = [
      ...new Set(
        Object.values(filtered)
          .flatMap((entry) => entry.subregions ?? [])
          .filter((s) => s.trim() !== '')
      ),
    ];

    return uniqueSubregions
      .sort((a, b) => a.localeCompare(b))
      .map((subregion) => ({
        value: subregion,
        // Display 'Entire region' as a friendlier label for the 'none' sentinel
        cells: [subregion === 'none' ? 'Entire region' : subregion],
      }));
  };

  return (
    <GeneralSelectComponent
      route="/subregion"
      paramKey="subregion"
      title="sub-region"
      description="Click on a row to select a sub-region:"
      getOptions={getSubRegionOptions}
      tableHeaders={[]}
      onSelect={handleLocationSelection}
    />
  );
};

export default SelectSubRegion;
