import { useEffect } from 'react';
import { useFilterState } from '../hooks/useFilterState';

export default function useUpdateMapOnDatasetChange(mapRef, data, setLayers) {

  const { getParam } = useFilterState();
  const datasetKey = getParam('datasetKey');
  
  useEffect(() => {
    // First, update the layers
    updateDatasetLayer(data, datasetKey, setLayers);
    
    // Then, pan the map using the same event system as other panning operations
    if (datasetKey) {
      // Small delay to ensure layer updates are processed
      const timeoutId = setTimeout(() => {
        panToDataset(data, datasetKey);
      }, 250); // Slightly longer delay to ensure layers are ready
      
      return () => clearTimeout(timeoutId);
    }
  }, [data, datasetKey, setLayers]);
}

function updateDatasetLayer(data, datasetKey, setLayers) {
  // If no datasetKey is selected, remove the data layer
  if (!datasetKey) {
    setLayers(prevLayers => {
      const { data: dataLayer, ...restLayers } = prevLayers;
      return restLayers;
    });
    return;
  }

  // Load the dataset configuration
  const datasetSubFolder = data?.[datasetKey]?.folder;
  const datasetMaxZoom = data?.[datasetKey]?.max_zoom;
  const datasetMaxZoomStr = 'auto';
  const datasetBounds = data?.[datasetKey]?.raster_summary?.bounds ?? [];
  const [datasetMinLng, datasetMinLat, datasetMaxLng, datasetMaxLat] = datasetBounds;

  // Only add the layer if we have the required data
  if (datasetSubFolder && datasetMaxZoomStr) {
    const urlTemplate = `https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com/data_outputs/raster_tiles/SDM/${datasetSubFolder}/${datasetKey}_zoom_${datasetMaxZoomStr}/{z}/{x}/{y}.png`;
    
    // Create the data layer configuration
    const dataLayerConfig = {
      info: {
        sources: {
          'datasetRaster': {
            type: 'raster',
            tiles: [urlTemplate],
            tileSize: 256,
            bounds: [datasetMinLng, datasetMinLat, datasetMaxLng, datasetMaxLat],
            minzoom: 0,
            maxzoom: datasetMaxZoom,
          }
        },
        layers: [
          {
            id: 'datasetRaster',
            type: 'raster',
            source: 'datasetRaster',
            // Uncomment if you want to add opacity
            // paint: {
            //   'raster-opacity': 0.7
            // }
          }
        ]
      }
    };

    // Update the layers object to include the data layer
    setLayers(prevLayers => ({
      ...prevLayers,
      data: dataLayerConfig
    }));
  } else {
    // Remove data layer if configuration is incomplete
    setLayers(prevLayers => {
      const { data: dataLayer, ...restLayers } = prevLayers;
      return restLayers;
    });
  }
}

function panToDataset(data, datasetKey) {
  // Load the dataset bounds from the data.
  const dataset = data?.[datasetKey];
  if (!dataset) return;
  const bounds = dataset.raster_summary?.bounds;
  if (!Array.isArray(bounds) || bounds.length !== 4) return;
  const [minLng, minLat, maxLng, maxLat] = bounds;
  if ([minLng, minLat, maxLng, maxLat].some((v) => v == null)) return;

  // Use the same event system as other panning operations
  const event = new CustomEvent('panToDataset', {
    detail: {
      bounds: [
        [minLng, minLat],
        [maxLng, maxLat],
      ]
    }
  });
  
  window.dispatchEvent(event);
}
