import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function useMapPanOnDatasetChange(mapRef, data, datasetKey, adm0Key, adm1Key) {
  //const { data } = useAppContext();

  useEffect(() => {
    const map = mapRef.current;
    //if (!map || !map.isStyleLoaded()) return;
    if (!map) return;
    const dataset = data?.[datasetKey];
    if (!dataset) return;

    // Example: use a predefined lat/lng based on current selection
    // You can replace this with logic that uses adm0Key/adm1Key too
    //const [minLng, minLat, maxLng, maxLat] = dataset.raster_summary?.bounds ?? [];

    //if ([minLng, minLat, maxLng, maxLat].some((v) => v == null)) return;

    //const centerLng = (minLng + maxLng) / 2;
    //const centerLat = (minLat + maxLat) / 2;

    //map.easeTo({
    //  center: [centerLng, centerLat],
    //  zoom: 6, // Optional: zoom level can be adjusted or dynamic
    //  duration: 800,
    //});

    const bounds = dataset.raster_summary?.bounds;
    if (!Array.isArray(bounds) || bounds.length !== 4) return;
    const [minLng, minLat, maxLng, maxLat] = bounds;
    if ([minLng, minLat, maxLng, maxLat].some((v) => v == null)) return;
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 40,      // pixels of padding on all sides
        duration: 2000,    // animation duration in ms
        // maxZoom: 7,       // optional: prevent zooming in too far
      }
    );

  }, [mapRef, data, datasetKey, adm0Key, adm1Key]);
}
