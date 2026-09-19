import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import MethodStandardMedal from '../components/MethodStandardMedal';
import StandardsGuidanceModal from '../components/StandardsGuidanceModal';
import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';
import { calculateChecklistResultFromPayload } from '../constants/methodologicalStandards';
import type { DatasetMap } from '../types';

/** Dataset selection — filters by all previously-chosen criteria, then navigates to FinalScreen. */
const SelectDataset = () => {
  const { setParamAndNavigate, getAllParams } = useFilterState();
  const { data, speciesData, approvedMetadata, ensureApprovedMetadata } = useAppContext();
  const navigate = useNavigate();
  const [showStandardInfo, setShowStandardInfo] = useState(false);

  void setParamAndNavigate; // used via GeneralSelectComponent internally

  // Fetch approved metadata for every dataset currently visible in this filtered list,
  // so a medal can be shown for each row without waiting for FinalScreen.
  useEffect(() => {
    const allParams = getAllParams();
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
        Object.entries(filtered).filter(([, entry]) => entry.subregions?.includes(allParams.subregion))
      );
    }
    for (const [key, entry] of Object.entries(filtered)) {
      ensureApprovedMetadata(key, entry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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

      const tier = calculateChecklistResultFromPayload(approvedMetadata[key]?.payload)?.tier ?? null;

      return {
        value: key,
        cells: [speciesDisplay, entry.source_text ?? 'No source', <MethodStandardMedal tier={tier} />],
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

  const standardHeader = (
    <span className="flex items-center gap-1">
      Standard
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowStandardInfo(true);
        }}
        aria-label="What do Gold/Silver/Bronze mean?"
        className="text-gray-400 hover:text-blue-600"
      >
        <Info size={14} />
      </button>
    </span>
  );

  return (
    <>
      <GeneralSelectComponent
        route="/dataset"
        paramKey="datasetKey"
        title="Dataset"
        description="Click on a row to select a study (it will show on the map):"
        getOptions={getDatasetOptions}
        tableHeaders={['Species', 'Source', standardHeader]}
        customNextHandler={handleDatasetNext}
      />
      {showStandardInfo && <StandardsGuidanceModal onClose={() => setShowStandardInfo(false)} />}
    </>
  );
};

export default SelectDataset;
