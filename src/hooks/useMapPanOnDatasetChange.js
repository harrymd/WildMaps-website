import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function useMapPanOnDatasetChange(mapRef, data, datasetKey, adm0Key, adm1Key) {

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
  
    zoomToDataset(map, data, datasetKey);

  }, [mapRef, data, datasetKey]);
}

function zoomToDataset(map, data, datasetKey) {

    // Load the dataset bounds from the data.
    const dataset = data?.[datasetKey];
    if (!dataset) return;
    const bounds = dataset.raster_summary?.bounds;
    if (!Array.isArray(bounds) || bounds.length !== 4) return;
    const [minLng, minLat, maxLng, maxLat] = bounds;
    if ([minLng, minLat, maxLng, maxLat].some((v) => v == null)) return;

    // Change the map view to match the dataset bounds.
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 40,      // pixels of padding on all sides
        duration: 2000,    // animation duration in ms
      }
    );
  
    // Use point instead of bbox:
    //if ([minLng, minLat, maxLng, maxLat].some((v) => v == null)) return;
    //const centerLng = (minLng + maxLng) / 2;
    //const centerLat = (minLat + maxLat) / 2;
    //map.easeTo({
    //  center: [centerLng, centerLat],
    //  zoom: 6, // Optional: zoom level can be adjusted or dynamic
    //  duration: 800,
    //});
}
