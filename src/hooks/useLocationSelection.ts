import { useState, useEffect } from 'react';
import { panToBoundingBox, getBoundingBoxFromLocation } from '../utils/mapPanningUtils';
import type { Dataset, AdmData } from '../types';
import type { BoundingBox } from '../utils/mapPanningUtils';

export interface LocationSelectionState {
  adm0Key: string;
  adm1Key: string;
  adm0Options: { value: string; label: string }[];
  adm1Options: { value: string; label: string }[];
  handleAdm0Change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAdm1Change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Manages country (ADM0) and first-level subdivision (ADM1) selection on the
 * FinalScreen. Updates URL params and fires map-pan events when the selection
 * changes.
 */
export const useLocationSelection = (
  getParam: (key: string) => string | null,
  setParam: (key: string, value: string) => void,
  dataset: Dataset | undefined,
  admData: AdmData | Record<string, never>
): LocationSelectionState => {
  const [adm0Key, setAdm0Key] = useState(getParam('adm0Key') ?? 'all_adm0');
  const [adm1Key, setAdm1Key] = useState(getParam('adm1Key') ?? 'all_adm1');

  // Set default URL params on first render if they are missing
  useEffect(() => {
    if (!getParam('adm0Key')) setParam('adm0Key', 'all_adm0');
    if (!getParam('adm1Key')) setParam('adm1Key', 'all_adm1');
  }, [getParam, setParam]);

  // ── Option builders ──────────────────────────────────────────────────────

  const getAdm0Options = () => {
    if (!dataset) return [];

    const adm0 = (admData as AdmData).adm0;
    return ['all_adm0', ...(dataset.adm0_list ?? [])]
      .filter((key) => {
        if (key === 'all_adm0') return true;
        // Exclude disputed territories from the dropdown
        return adm0?.[key]?.is_disputed !== 'yes';
      })
      .map((key) => ({
        value: key,
        label:
          key === 'all_adm0'
            ? 'All countries (entire extent of dataset)'
            : adm0?.[key]?.name ?? key,
      }));
  };

  const getAdm1Options = () => {
    if (!dataset || !adm0Key) return [];

    const adm1 = (admData as AdmData).adm1;

    if (adm0Key === 'all_adm0') {
      return [{ value: 'all_adm1', label: 'All regions (entire extent of dataset)' }];
    }

    // Filter ADM1 zones that belong to the selected country (first 3 chars match)
    const filtered = dataset.adm1_list?.filter((a) => a.slice(0, 3) === adm0Key.slice(0, 3)) ?? [];
    return ['all_adm1', ...filtered].map((key) => ({
      value: key,
      label:
        key === 'all_adm1'
          ? 'All regions (entire extent of country)'
          : adm1?.[key]?.name ?? key,
    }));
  };

  // ── Event handlers ───────────────────────────────────────────────────────

  const handleAdm0Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAdm0Key = e.target.value;
    setAdm0Key(newAdm0Key);
    setParam('adm0Key', newAdm0Key);

    const adm0 = (admData as AdmData).adm0;

    // Pan to the selected country's bbox
    if (newAdm0Key !== 'all_adm0' && adm0?.[newAdm0Key]?.bbox) {
      const bbox = getBoundingBoxFromLocation(
        { [newAdm0Key]: { bbox: adm0[newAdm0Key].bbox as BoundingBox } },
        newAdm0Key
      );
      if (bbox) panToBoundingBox(null, bbox, { method: 'event', eventName: 'panToCountry', duration: 2000, padding: 40 });
    } else if (newAdm0Key === 'all_adm0' && dataset?.raster_summary?.bounds) {
      panToBoundingBox(null, dataset.raster_summary.bounds, {
        method: 'event', eventName: 'panToCountry', duration: 2000, padding: 40,
      });
    }

    // Reset ADM1 selection when the country changes
    if (newAdm0Key === 'all_adm0') {
      setAdm1Key('all_adm1');
      setParam('adm1Key', 'all_adm1');
    } else {
      const newAdm1Options = dataset?.adm1_list?.filter(
        (a) => a.slice(0, 3) === newAdm0Key.slice(0, 3)
      ) ?? [];
      const allAdm1 = ['all_adm1', ...newAdm1Options];
      if (!allAdm1.includes(adm1Key)) {
        setAdm1Key('all_adm1');
        setParam('adm1Key', 'all_adm1');
      }
    }
  };

  const handleAdm1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAdm1Key = e.target.value;
    setAdm1Key(newAdm1Key);
    setParam('adm1Key', newAdm1Key);

    const adm0 = (admData as AdmData).adm0;
    const adm1 = (admData as AdmData).adm1;

    if (newAdm1Key !== 'all_adm1' && adm1?.[newAdm1Key]?.bbox) {
      const bbox = getBoundingBoxFromLocation(
        { [newAdm1Key]: { bbox: adm1[newAdm1Key].bbox as BoundingBox } },
        newAdm1Key
      );
      if (bbox) panToBoundingBox(null, bbox, { method: 'event', eventName: 'panToAdm1', duration: 2000, padding: 40 });
    } else if (newAdm1Key === 'all_adm1') {
      // Zoom back out to the parent country or dataset extent
      if (adm0Key !== 'all_adm0' && adm0?.[adm0Key]?.bbox) {
        const bbox = getBoundingBoxFromLocation(
          { [adm0Key]: { bbox: adm0[adm0Key].bbox as BoundingBox } },
          adm0Key
        );
        if (bbox) panToBoundingBox(null, bbox, { method: 'event', eventName: 'panToCountry', duration: 2000, padding: 40 });
      } else if (dataset?.raster_summary?.bounds) {
        panToBoundingBox(null, dataset.raster_summary.bounds, {
          method: 'event', eventName: 'panToCountry', duration: 2000, padding: 40,
        });
      }
    }
  };

  return {
    adm0Key,
    adm1Key,
    adm0Options: getAdm0Options(),
    adm1Options: getAdm1Options(),
    handleAdm0Change,
    handleAdm1Change,
  };
};
