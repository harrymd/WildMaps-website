import { useState, useEffect } from 'react';
import { panToBoundingBox, getBoundingBoxFromLocation } from '../utils/mapPanningUtils';

export const useLocationSelection = (getParam, setParam, dataset, admData) => {
  const [adm0Key, setAdm0Key] = useState(getParam('adm0Key') || 'all_adm0');
  const [adm1Key, setAdm1Key] = useState(getParam('adm1Key') || 'all_adm1');

  // Set default values in URL if not present
  useEffect(() => {
    const currentAdm0 = getParam('adm0Key');
    const currentAdm1 = getParam('adm1Key');
    
    if (!currentAdm0) {
      setParam('adm0Key', 'all_adm0');
    }
    if (!currentAdm1) {
      setParam('adm1Key', 'all_adm1');
    }
  }, [getParam, setParam]);

  const getAdm0Options = () => {
    if (!dataset) return [];
  
    const options = ['all_adm0', ...(dataset?.adm0_list || [])];
    return options
      .filter(key => {
        // Always include 'all_adm0' option
        if (key === 'all_adm0') return true;
        
        // Filter out disputed territories
        return admData.adm0?.[key]?.is_disputed !== 'yes';
      })
      .map(key => ({
        value: key,
        label: key === 'all_adm0'
          ? 'All countries (entire extent of dataset)'
          : admData.adm0?.[key]?.name || key
      }));
  };

  const getAdm1Options = () => {
    if (!dataset || !adm0Key) return [];

    if (adm0Key === 'all_adm0') {
      return [{
        value: 'all_adm1',
        label: 'All regions (entire extent of dataset)'
      }];
    }

    const filtered = dataset?.adm1_list?.filter(a => a.slice(0, 3) === adm0Key.slice(0, 3)) || [];
    const options = ['all_adm1', ...filtered];
    
    return options.map(key => ({
      value: key,
      label: key === 'all_adm1'
        ? 'All regions (entire extent of country)'
        : admData.adm1?.[key]?.name || key
    }));
  };

  const handleAdm0Change = (e) => {
    const newAdm0Key = e.target.value;
    setAdm0Key(newAdm0Key);
    setParam('adm0Key', newAdm0Key);
    
    // Add map panning for countries
    if (newAdm0Key !== 'all_adm0' && admData.adm0?.[newAdm0Key]?.bbox) {
      const bbox = getBoundingBoxFromLocation(
        { [newAdm0Key]: { bbox: admData.adm0[newAdm0Key].bbox } }, 
        newAdm0Key
      );
      if (bbox) {
        panToBoundingBox(null, bbox, {
          method: 'event',
          eventName: 'panToCountry',
          duration: 2000,
          padding: 40
        });
      }
    } else if (newAdm0Key === 'all_adm0' && dataset?.raster_summary?.bounds) {
      panToBoundingBox(null, dataset.raster_summary.bounds, {
        method: 'event',
        eventName: 'panToCountry',
        duration: 2000,
        padding: 40
      });
    }
    
    // Reset adm1 when adm0 changes
    if (newAdm0Key === 'all_adm0') {
      setAdm1Key('all_adm1');
      setParam('adm1Key', 'all_adm1');
    } else {
      const newAdm1Options = dataset?.adm1_list?.filter(a => a.slice(0, 3) === newAdm0Key.slice(0, 3)) || [];
      const allAdm1Options = ['all_adm1', ...newAdm1Options];
      
      if (!allAdm1Options.includes(adm1Key)) {
        setAdm1Key('all_adm1');
        setParam('adm1Key', 'all_adm1');
      }
    }
  };

  const handleAdm1Change = (e) => {
    const newAdm1Key = e.target.value;
    setAdm1Key(newAdm1Key);
    setParam('adm1Key', newAdm1Key);
    
    // Add map panning for regions
    if (newAdm1Key !== 'all_adm1' && admData.adm1?.[newAdm1Key]?.bbox) {
      const bbox = getBoundingBoxFromLocation(
        { [newAdm1Key]: { bbox: admData.adm1[newAdm1Key].bbox } }, 
        newAdm1Key
      );
      if (bbox) {
        panToBoundingBox(null, bbox, {
          method: 'event',
          eventName: 'panToAdm1',
          duration: 2000,
          padding: 40
        });
      }
    } else if (newAdm1Key === 'all_adm1') {
      if (adm0Key !== 'all_adm0' && admData.adm0?.[adm0Key]?.bbox) {
        const bbox = getBoundingBoxFromLocation(
          { [adm0Key]: { bbox: admData.adm0[adm0Key].bbox } }, 
          adm0Key
        );
        if (bbox) {
          panToBoundingBox(null, bbox, {
            method: 'event',
            eventName: 'panToCountry',
            duration: 2000,
            padding: 40
          });
        }
      } else if (dataset?.raster_summary?.bounds) {
        panToBoundingBox(null, dataset.raster_summary.bounds, {
          method: 'event',
          eventName: 'panToCountry',
          duration: 2000,
          padding: 40
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
    handleAdm1Change
  };
};
