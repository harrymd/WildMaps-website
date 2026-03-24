import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralSelectComponent from '../components/GeneralSelectComponent';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute, getPreviousRoute } from '../utils/navigationUtils';
import { useMapPanning } from '../hooks/useMapPanning';
import type { DatasetMap, AdmData } from '../types';
import type { BoundingBox } from '../utils/mapPanningUtils';

/**
 * Sub-region (ADM1) selection page — exists but is currently skipped in the
 * navigation workflow. ADM1 selection happens inline on the FinalScreen instead.
 */
const SelectAdm1 = () => {
  const { data, admData } = useAppContext();
  const { getParam, setParamAndNavigate } = useFilterState();
  const navigate = useNavigate();

  // Build bbox lookup for map panning
  const adm1BboxData: Record<string, { bbox: BoundingBox }> = {};
  if ((admData as AdmData).adm1) {
    for (const [code, info] of Object.entries((admData as AdmData).adm1)) {
      if (info.bbox) adm1BboxData[code] = { bbox: info.bbox };
    }
  }

  const { handleLocationSelection } = useMapPanning('adm1Key', adm1BboxData, 'panToAdm1');

  const datasetKey    = getParam('datasetKey');
  const adm0Key       = getParam('adm0Key');
  const dataset       = datasetKey ? data[datasetKey] : undefined;
  const startingFilter = getParam('startingFilter');

  const getAdm1Options = (allParams: Record<string, string>, data: DatasetMap) => {
    const ds      = allParams.datasetKey ? data[allParams.datasetKey] : undefined;
    const adm0Key = allParams.adm0Key;

    if (!ds || !adm0Key) return [];

    if (adm0Key === 'all_adm0') {
      return [{ value: 'all_adm1', cells: ['All regions (entire extent of dataset)'] }];
    }

    const countryPrefix = adm0Key.slice(0, 3);
    const filtered      = ds.adm1_list?.filter((a) => a.slice(0, 3) === countryPrefix) ?? [];
    return ['all_adm1', ...filtered].map((key) => ({
      value: key,
      cells: [
        key === 'all_adm1'
          ? 'All regions (entire extent of country)'
          : (admData as AdmData).adm1?.[key]?.name ?? key,
      ],
    }));
  };

  /** Renders the current selections above the table as bolded labels. */
  const getContextDisplay = (allParams: Record<string, string>) => {
    const context: string[] = [];
    if (allParams.superspecies) context.push(`SuperSpecies: **${allParams.superspecies}**`);
    if (allParams.region)       context.push(`Region: **${allParams.region}**`);
    if (allParams.subregion)    context.push(`SubRegion: **${allParams.subregion}**`);
    if (allParams.datasetKey && data[allParams.datasetKey]) {
      context.push(`Dataset: **${data[allParams.datasetKey].common_name ?? 'Unknown'}**`);
    }
    if (allParams.adm0Key) {
      const adm0Name =
        allParams.adm0Key === 'all_adm0'
          ? 'All countries'
          : ((admData as AdmData).adm0?.[allParams.adm0Key]?.name ?? allParams.adm0Key);
      context.push(`Country: **${adm0Name}**`);
    }

    if (context.length === 0) return null;
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
  };

  /**
   * Custom back handler: if SelectAdm0 would have auto-redirected (only one
   * real country option), skip past it so the user doesn't land on a blank page.
   */
  const handleBack = () => {
    const ds = datasetKey ? data[datasetKey] : undefined;
    const currentParams = new URLSearchParams(window.location.search);

    if (ds?.adm0_list && ['all_adm0', ...ds.adm0_list].length === 2) {
      // ADM0 page would auto-redirect → go back one step further
      currentParams.delete('adm0Key');
      currentParams.delete('adm1Key');
      navigate(`${getPreviousRoute('/adm0', startingFilter)}?${currentParams.toString()}`);
    } else {
      currentParams.delete('adm1Key');
      navigate(`${getPreviousRoute('/adm1', startingFilter)}?${currentParams.toString()}`);
    }
  };

  // Auto-redirect when there is only one real region option
  useEffect(() => {
    if (getParam('adm1Key')) return;
    if (!dataset || !adm0Key) return;

    const nextRoute = getNextRoute('/adm1', startingFilter);

    if (adm0Key === 'all_adm0') {
      setParamAndNavigate('adm1Key', 'all_adm1', nextRoute);
      return;
    }

    const countryPrefix = adm0Key.slice(0, 3);
    const filtered = dataset.adm1_list?.filter((a) => a.slice(0, 3) === countryPrefix) ?? [];
    if (['all_adm1', ...filtered].length === 2) {
      setParamAndNavigate('adm1Key', filtered[0], nextRoute);
    }
  }, [dataset, adm0Key, startingFilter, setParamAndNavigate, getParam]);

  // Don't render the list while auto-redirect is pending
  const currentAdm1Key = getParam('adm1Key');
  if (!currentAdm1Key && dataset && adm0Key) {
    if (adm0Key === 'all_adm0') return <div>Redirecting...</div>;

    const countryPrefix = adm0Key.slice(0, 3);
    const filtered = dataset.adm1_list?.filter((a) => a.slice(0, 3) === countryPrefix) ?? [];
    if (['all_adm1', ...filtered].length === 2) return <div>Redirecting...</div>;
  }

  const getTitle = () => {
    if (adm0Key && adm0Key !== 'all_adm0') {
      const countryName = (admData as AdmData).adm0?.[adm0Key]?.name ?? adm0Key;
      return `Select region of ${countryName}`;
    }
    return 'Select Region';
  };

  return (
    <GeneralSelectComponent
      route="/adm1"
      paramKey="adm1Key"
      title={getTitle()}
      description="Click on a row to select a region:"
      getOptions={getAdm1Options}
      getContextDisplay={getContextDisplay}
      tableHeaders={[]}
      customBackHandler={handleBack}
      onSelect={handleLocationSelection}
    />
  );
};

export default SelectAdm1;
