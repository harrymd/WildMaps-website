import { useEffect } from 'react';

export default function useUpdateMapOnDatasetChange(mapRef, data, datasetKey, setLayers) {
  
  useEffect(() => {
    const map = mapRef.current;
    
    // First, update the layers
    updateDatasetLayer(data, datasetKey, setLayers);
    
    // Then, pan the map after a short delay to ensure layers are processed
    if (map && datasetKey) {
      // Small delay to ensure layer updates are processed
      const timeoutId = setTimeout(() => {
        zoomToDataset(map, data, datasetKey);
      }, 100);
      
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
  const datasetMaxZoom = 6;
  const datasetMaxZoomStr = datasetMaxZoom.toString().padStart(2, '0');
  const datasetBounds = data?.[datasetKey]?.raster_summary?.bounds ?? [];
  const [datasetMinLng, datasetMinLat, datasetMaxLng, datasetMaxLat] = datasetBounds;

  // Only add the layer if we have the required data
  if (datasetSubFolder && datasetMaxZoomStr) {
    const urlTemplate = `https://habitat-web-map.s3.eu-west-2.amazonaws.com/code_output/raster_tiles/SDM/${datasetSubFolder}/${datasetKey}_zoom_${datasetMaxZoomStr}/{z}/{x}/{y}.png`;
    
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
      duration: 2000,   // animation duration in ms
    }
  );
}
