import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState, useCallback } from 'react';

import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import useUpdateMapOnDatasetChange from '../hooks/useUpdateMapOnDatasetChange.js';

const useMap = (layers, containerRef, setLayers) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const layersRef = useRef({});
  const currentProjection = useRef('mercator');
  const { data } = useAppContext(); 

  // Fetch style info for layers that only have URL
  const fetchLayerInfo = useCallback(async (layerKey, layerData) => {
    if (!layerData.info && layerData.url) {
      try {
        const response = await fetch(layerData.url);
        const info = await response.json();
        return { ...layerData, info };
      } catch (error) {
        console.error(`Failed to fetch layer info for ${layerKey}:`, error);
        return layerData;
      }
    }
    return layerData;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef?.current) return;

    const mapInstance = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              //'background-color': '#a4bcfa' // liberty sea blue
              'background-color': '#C3C7C9' // positron sea grey
            }
          }
        ]
      },
      center: [105.0, 13],
      zoom: 2.5,
      maxZoom: 11,
      projection: 'globe'
    });

    mapInstance.on('load', () => {
      setIsLoaded(true);
    });

    // Handle projection switching based on zoom
    const handleProjectionSwitch = () => {
      // Only change projection if style is loaded
      if (!mapInstance.isStyleLoaded()) return;
      
      const zoom = mapInstance.getZoom();
      const shouldUseGlobe = zoom < 4;
      const targetProjection = shouldUseGlobe ? 'globe' : 'mercator';
      
      if (currentProjection.current !== targetProjection) {
        try {
          mapInstance.setProjection({ type: targetProjection });
          currentProjection.current = targetProjection;
        } catch (error) {
          console.error('Failed to set projection:', error);
        }
      }
    };

    mapInstance.on('zoom', handleProjectionSwitch);
    mapInstance.on('zoomend', handleProjectionSwitch);
    
    // Set initial projection after style loads
    mapInstance.on('styledata', handleProjectionSwitch);

    mapRef.current = mapInstance;
    setMap(mapInstance);

    return () => {
      mapInstance.remove();
      mapRef.current = null;
      setMap(null);
      setIsLoaded(false);
    };
  }, [containerRef]);

  // Update layers when layers prop changes.
  useEffect(() => {
    if (!map || !isLoaded || !layers) return;

    const updateLayers = async () => {
      // Store current viewport
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      const currentBearing = map.getBearing();
      const currentPitch = map.getPitch();

      // Process layers and fetch missing info
      const processedLayers = {};
      // Process layers in a specific order: underlay -> baselayer -> overlay
      const layerKeys = ['underlay', 'data', 'baselayer', 'overlay'].filter(
        key => layers[key]);
      
      for (const key of layerKeys) {
        processedLayers[key] = await fetchLayerInfo(key, layers[key]);
      }

      // Remove layers that are no longer in the layers object
      const currentLayerKeys = Object.keys(layersRef.current);
      for (const key of currentLayerKeys) {
        if (!processedLayers[key]) {
          // Remove all layers and sources associated with this layer
          const layerInfo = layersRef.current[key];
          if (layerInfo && layerInfo.info && layerInfo.info.layers) {
            // Remove layers in reverse order
            for (let i = layerInfo.info.layers.length - 1; i >= 0; i--) {
              const layerId = `${key}-${layerInfo.info.layers[i].id}`;
              if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
              }
            }
            // Remove sources
            if (layerInfo.info.sources) {
              Object.keys(layerInfo.info.sources).forEach(sourceId => {
                const fullSourceId = `${key}-${sourceId}`;
                if (map.getSource(fullSourceId)) {
                  map.removeSource(fullSourceId);
                }
              });
            }
          }
          delete layersRef.current[key];
        }
      }

      // Add or update layers in the correct order
      for (const key of layerKeys) {
        const layerData = processedLayers[key];
        const existingLayer = layersRef.current[key];
      
        // Check if layer needs to be updated
        const needsUpdate = !existingLayer || 
          JSON.stringify(existingLayer) !== JSON.stringify(layerData);
      
        if (needsUpdate) {
          // Remove existing layer if it exists
          if (existingLayer && existingLayer.info && existingLayer.info.layers) {
            for (let i = existingLayer.info.layers.length - 1; i >= 0; i--) {
              const layerId = `${key}-${existingLayer.info.layers[i].id}`;
              if (map.getLayer(layerId)) {
                try {
                  map.removeLayer(layerId);
                } catch (error) {
                  console.warn(`Failed to remove layer ${layerId}:`, error);
                }
              }
            }
            if (existingLayer.info.sources) {
              Object.keys(existingLayer.info.sources).forEach(sourceId => {
                const fullSourceId = `${key}-${sourceId}`;
                if (map.getSource(fullSourceId)) {
                  try {
                    map.removeSource(fullSourceId);
                  } catch (error) {
                    console.warn(`Failed to remove source ${fullSourceId}:`, error);
                  }
                }
              });
            }
          }
      
          // Add new layer
          if (layerData.info) {
            try {
              // Merge style-level properties (glyphs, sprite, etc.)
              const currentStyle = map.getStyle();
              const styleUpdates = {};
              
              if (layerData.info.glyphs && !currentStyle.glyphs) {
                styleUpdates.glyphs = layerData.info.glyphs;
              }
              
              if (layerData.info.sprite && !currentStyle.sprite) {
                styleUpdates.sprite = layerData.info.sprite;
              }
              
              // Apply style updates if needed
              if (Object.keys(styleUpdates).length > 0) {
                const updatedStyle = {
                  ...currentStyle,
                  ...styleUpdates
                };
                map.setStyle(updatedStyle);
                
                // IMPORTANT: Clear all layer references since setStyle removes everything
                layersRef.current = {};
                
                // Wait for style to load before continuing
                await new Promise(resolve => {
                  if (map.isStyleLoaded()) {
                    resolve();
                  } else {
                    map.once('styledata', resolve);
                  }
                });
              }
      
              // Add sources first
              if (layerData.info.sources) {
                Object.entries(layerData.info.sources).forEach(([sourceId, sourceConfig]) => {
                  const fullSourceId = `${key}-${sourceId}`;
                  if (!map.getSource(fullSourceId)) {
                    try {
                      map.addSource(fullSourceId, sourceConfig);
                    } catch (error) {
                      console.error(`Failed to add source ${fullSourceId}:`, error);
                    }
                  }
                });
              }
      
              // Add layers
              if (layerData.info.layers) {
                layerData.info.layers.forEach((layer, index) => {
                  const layerId = `${key}-${layer.id}`;
                  const layerConfig = {
                    ...layer,
                    id: layerId
                  };
      
                  // Handle source reference - only prefix if source exists in the style's sources
                  if (layer.source) {
                    if (layerData.info.sources && layerData.info.sources[layer.source]) {
                      layerConfig.source = `${key}-${layer.source}`;
                    } else {
                      // Source might be external or built-in, keep original reference
                      layerConfig.source = layer.source;
                    }
                  }
      
                  // Handle source-layer (for vector tiles)
                  if (layer['source-layer']) {
                    layerConfig['source-layer'] = layer['source-layer'];
                  }
      
                  // Find the correct position to insert the layer
                  let beforeId = null;
                  const allLayers = map.getStyle().layers;
                  const currentKeyIndex = layerKeys.indexOf(key);
      
                  // Special handling for layer positioning
                  if (key === 'baselayer') {
                    // For baselayer, position it below the permanent 'overlay' layer but above underlay
                    // Find the overlay layer (your permanent labels layer)
                    const overlayLayers = allLayers.filter(layer => layer.id.startsWith('overlay-'));
                    if (overlayLayers.length > 0) {
                      // Insert baselayer just before the permanent overlay layer
                      beforeId = overlayLayers[0].id;
                    } else {
                      // If no overlay layer found, put at the top
                      beforeId = null;
                    }
                  } else if (key === 'overlay') {
                    // Permanent overlay layer should always be on top
                    beforeId = null;
                  } else {
                    // For other layers (like underlay), use the existing logic
                    // Look for the first layer of the next layer group
                    for (let i = currentKeyIndex + 1; i < layerKeys.length; i++) {
                      const nextKey = layerKeys[i];
                      const nextLayerData = layersRef.current[nextKey];
                      if (nextLayerData && nextLayerData.info && nextLayerData.info.layers) {
                        beforeId = `${nextKey}-${nextLayerData.info.layers[0].id}`;
                        if (map.getLayer(beforeId)) {
                          break;
                        }
                      }
                    }
                  }
      
                  try {
                    // Check if layer already exists before adding
                    if (!map.getLayer(layerId)) {
                      map.addLayer(layerConfig, beforeId);
                    } else {
                      console.warn(`Layer ${layerId} already exists, skipping add...`);
                    }
                  } catch (error) {
                    console.error(`Failed to add layer ${layerId}:`, error, layerConfig);
                  }
                });
              }
      
              layersRef.current[key] = layerData;
            } catch (error) {
              console.error(`Failed to add layer ${key}:`, error);
            }
          }
        }
      }

      // Restore viewport
      map.jumpTo({
        center: currentCenter,
        zoom: currentZoom,
        bearing: currentBearing,
        pitch: currentPitch
      });
    };

    updateLayers();
  }, [layers, map, isLoaded, fetchLayerInfo]);

  // Listen for custom panning events (region, subregion, etc.)
  useEffect(() => {
    const handlePanToLocation = (event) => {
      if (!map) return;
  
      if (event.detail.bounds) {
        // Handle bounding box events (from regions, countries, etc.)
        map.fitBounds(event.detail.bounds, {
          padding: 40,
          duration: 2000
        });
      } else if (event.detail.center && event.detail.zoom != null) {
        // Handle center/zoom events (from default panning)
        map.flyTo({
          center: event.detail.center,
          zoom: event.detail.zoom,
          duration: 1500
        });
      } else {
        console.warn('Unknown event format:', event.detail);
      }
    };
  
    // Listen for all panning events
    window.addEventListener('panToRegion', handlePanToLocation);
    window.addEventListener('panToSubregion', handlePanToLocation);
    window.addEventListener('panToCountry', handlePanToLocation);
    window.addEventListener('panToAdm1', handlePanToLocation);
    window.addEventListener('panToDefault', handlePanToLocation); // Add this for your starting filter
  
    return () => {
      window.removeEventListener('panToRegion', handlePanToLocation);
      window.removeEventListener('panToSubregion', handlePanToLocation);
      window.removeEventListener('panToCountry', handlePanToLocation);
      window.removeEventListener('panToAdm1', handlePanToLocation);
      window.removeEventListener('panToDefault', handlePanToLocation); // Add this cleanup
    };
  }, [map]);

  // Update the layers when the dataset is changed (no panning)
  useUpdateMapOnDatasetChange(mapRef, data, setLayers); 

  return {
    map,
    isLoaded
  };
};

export default useMap;
