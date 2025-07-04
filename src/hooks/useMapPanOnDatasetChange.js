import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { panToBoundingBox, getBoundingBoxFromDataset } from '../utils/mapPanningUtils';

export default function useMapPanOnDatasetChange(mapRef, data, datasetKey, adm0Key, adm1Key) {
  const previousDatasetKey = useRef(datasetKey);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Only zoom if the dataset key actually changed
    if (previousDatasetKey.current !== datasetKey) {
      // Clear any pending zoom
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce the zoom to prevent rapid successive calls
      timeoutRef.current = setTimeout(() => {
        zoomToDataset(map, data, datasetKey);
        previousDatasetKey.current = datasetKey;
      }, 100);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (map && map.stop) {
        map.stop(); // Stop any ongoing animations
      }
    };
  }, [data, datasetKey]); // Remove mapRef from dependencies
}

function zoomToDataset(map, data, datasetKey) {
  const bbox = getBoundingBoxFromDataset(data, datasetKey);
  if (bbox) {
    panToBoundingBox(map, bbox, {
      method: 'fitBounds',
      padding: 40,
      duration: 2000
    });
  }
}
