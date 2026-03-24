import { useEffect } from 'react';
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute } from '../utils/navigationUtils';
import { useMapPanning } from '../hooks/useMapPanning';
import type { DatasetMap, AdmData } from '../types';
import type { BoundingBox } from '../utils/mapPanningUtils';

/**
 * Country selection page — exists but is currently skipped in the navigation
 * workflow. ADM0 selection happens inline on the FinalScreen instead.
 */
const SelectAdm0 = () => {
  const { data, admData } = useAppContext();
  const { getParam, setParamAndNavigate } = useFilterState();

  // Build bbox lookup for map panning
  const countryBboxData: Record<string, { bbox: BoundingBox }> = {};
  if ((admData as AdmData).adm0) {
    for (const [code, info] of Object.entries((admData as AdmData).adm0)) {
      if (info.bbox) countryBboxData[code] = { bbox: info.bbox };
    }
  }

  const { handleLocationSelection } = useMapPanning('adm0Key', countryBboxData, 'panToCountry');

  const datasetKey  = getParam('datasetKey');
  const dataset     = datasetKey ? data[datasetKey] : undefined;
  const startingFilter = getParam('startingFilter');

  const getAdm0Options = (allParams: Record<string, string>, data: DatasetMap) => {
    const ds = allParams.datasetKey ? data[allParams.datasetKey] : undefined;
    if (!ds) return [];
    return ['all_adm0', ...(ds.adm0_list ?? [])].map((key) => ({
      value: key,
      cells: [
        key === 'all_adm0'
          ? 'All countries (entire extent of dataset)'
          : (admData as AdmData).adm0?.[key]?.name ?? key,
      ],
    }));
  };

  // Auto-redirect when only one real country option exists
  useEffect(() => {
    if (getParam('adm0Key')) return;
    if (dataset?.adm0_list && ['all_adm0', ...dataset.adm0_list].length === 2) {
      setParamAndNavigate('adm0Key', dataset.adm0_list[0], getNextRoute('/adm0', startingFilter));
    }
  }, [dataset, startingFilter, setParamAndNavigate, getParam]);

  const currentAdm0Key = getParam('adm0Key');
  if (!currentAdm0Key && dataset?.adm0_list && ['all_adm0', ...dataset.adm0_list].length === 2) {
    return <div>Redirecting...</div>;
  }

  return (
    <GeneralSelectComponent
      route="/adm0"
      paramKey="adm0Key"
      title="Country"
      description="Click on a row to select a country:"
      getOptions={getAdm0Options}
      tableHeaders={[]}
      onSelect={handleLocationSelection}
    />
  );
};

export default SelectAdm0;
