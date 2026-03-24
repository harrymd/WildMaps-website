import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useMapPanning } from '../hooks/useMapPanning';
import type { DatasetMap } from '../types';

/** Second step (region-first) or fourth step (superspecies-first): pick a region. */
const SelectRegion = () => {
  const { regionData } = useAppContext();
  const { handleLocationSelection } = useMapPanning('region', regionData, 'panToRegion');

  const getRegionOptions = (allParams: Record<string, string>, data: DatasetMap) => {
    let filtered = data;

    // Narrow to datasets that match the pre-selected superspecies (if any)
    if (allParams.superspecies) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([, entry]) => entry.superspecies === allParams.superspecies)
      );
    }

    const uniqueRegions = [
      ...new Set(
        Object.values(filtered)
          .flatMap((entry) => entry.regions ?? [])
          .filter((r) => r.trim() !== '')
      ),
    ];

    return uniqueRegions
      .sort((a, b) => a.localeCompare(b))
      .map((region) => ({ value: region, cells: [region] }));
  };

  return (
    <GeneralSelectComponent
      route="/region"
      paramKey="region"
      title="region"
      description="Click on a row to select a region:"
      getOptions={getRegionOptions}
      tableHeaders={[]}
      onSelect={handleLocationSelection}
    />
  );
};

export default SelectRegion;
