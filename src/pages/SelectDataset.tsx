import { useNavigate } from 'react-router-dom';
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';
import type { DatasetMap } from '../types';

/** Dataset selection — filters by all previously-chosen criteria, then navigates to FinalScreen. */
const SelectDataset = () => {
  const { setParamAndNavigate } = useFilterState();
  const { speciesData } = useAppContext();
  const navigate = useNavigate();

  void setParamAndNavigate; // used via GeneralSelectComponent internally

  const getDatasetOptions = (allParams: Record<string, string>, data: DatasetMap) => {
    let filtered = data;

    if (allParams.superspecies) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([, entry]) => entry.superspecies === allParams.superspecies)
      );
    }

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

    return Object.entries(filtered).map(([key, entry]) => {
      const commonName = entry.common_name ?? 'Unknown species';
      const scientificName = entry.scientific_name ?? speciesData[commonName]?.scientific_name;
      const capitalized = commonName.charAt(0).toUpperCase() + commonName.slice(1);

      const speciesDisplay = scientificName ? (
        <span>
          {capitalized} <em>({scientificName})</em>
        </span>
      ) : (
        capitalized
      );

      return {
        value: key,
        cells: [speciesDisplay, entry.source_text ?? 'No source'],
      };
    });
  };

  /** Navigate directly to FinalScreen and set default ADM selection in the URL. */
  const handleDatasetNext = (selectedValue: string) => {
    if (!selectedValue) return;
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
