import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState, useCallback } from 'react';

import { useAppContext } from '../context/AppContext';
import { useFilterState } from '../hooks/useFilterState';
import useUpdateMapOnDatasetChange from '../hooks/useUpdateMapOnDatasetChange.js';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Helper function to compute sidebar widths in pixels
const computeSidebarWidths = () => {
  const vw = window.innerWidth;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  
  return {
    left: Math.min(0.5 * vw, 35 * rem), // min(50vw, 35rem)
    right: Math.min(0.3 * vw, 21 * rem) // min(30vw, 21rem)
  };
};

const useMap = (layers, containerRef, setLayers, showLeft = true, showRight = false) => {
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

  // Handle map controls and custom elements positioning based on sidebar state
  useEffect(() => {
    if (!map || !isLoaded) return;

    const adjustMapElements = () => {
      const mapContainer = containerRef.current;
      if (!mapContainer) return;

      const sidebarWidths = computeSidebarWidths();
      console.log('Computed sidebar widths (px):', sidebarWidths);

      let translate = 'translateX(0)';
      //let backgroundColor = 'transparent';
      //let backgroundColor = 'rgba(255, 255, 255, 0.8)';

      if (showLeft && showRight) {
        translate = `translateX(-${(sidebarWidths.right)}px)`;
      } else if (showLeft && !showRight) {
        translate = `translateX(-${sidebarWidths.left / 2}px)`;
      } else if (!showLeft && showRight) {
        translate = `translateX(-${sidebarWidths.right / 2}px)`;
      }

      let translateLeft = 'translateX(0)';

      if (showLeft && showRight) {
        translateLeft = `translateX(${(sidebarWidths.left)}px)`;
      } else if (showLeft && !showRight) {
        translateLeft = `translateX(${sidebarWidths.left / 2}px)`;
      } else if (!showLeft && showRight) {
        translateLeft = `translateX(${sidebarWidths.right / 2}px)`;
      }

      // Adjust MapLibre controls
      const controls = mapContainer.querySelector('.maplibregl-ctrl-bottom-right');
      if (controls) {
        [...controls.children].forEach((child) => {
          child.style.transition = 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out';
          child.style.transform = translate;
          //child.style.backgroundColor = backgroundColor;
        });
      }

      // Adjust custom bottom-right image
      const customImage = mapContainer.querySelector('.map-bottom-right-image');
      if (customImage) {
        customImage.style.transition = 'transform 0.3s ease-in-out';
        customImage.style.transform = translateLeft;
      }
    };

    // Debounce the adjustment to prevent excessive calls
    const debouncedAdjustElements = debounce(adjustMapElements, 100);
    
    // Adjust elements immediately
    adjustMapElements();

    // Listen for window resize to recalculate
    window.addEventListener('resize', debouncedAdjustElements);

    return () => {
      window.removeEventListener('resize', debouncedAdjustElements);
    };
  }, [map, isLoaded, showLeft, showRight, containerRef]);

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

  useEffect(() => {
    const handlePanToLocation = async (event) => {
      if (!map) return;
  
      try {
        if (event.detail.bounds) {
          await new Promise((resolve) => {
            let completed = false;
            const timeout = setTimeout(() => {
              if (!completed) {
                completed = true;
                resolve();
              }
            }, 5000); // 5 second timeout
  
            map.fitBounds(event.detail.bounds, {
              padding: 40,
              duration: 2000
            });
  
            const onMoveEnd = () => {
              if (!completed) {
                completed = true;
                clearTimeout(timeout);
                map.off('moveend', onMoveEnd);
                resolve();
              }
            };
  
            map.on('moveend', onMoveEnd);
  
            const onError = (error) => {
              console.warn('Map move error (non-fatal):', error);
            };
  
            map.on('error', onError);
            setTimeout(() => map.off('error', onError), 3000);
          });
  
        } else if (event.detail.center && event.detail.zoom != null) {
          await new Promise((resolve) => {
            let completed = false;
            const timeout = setTimeout(() => {
              if (!completed) {
                completed = true;
                resolve();
              }
            }, 3000);
  
            map.flyTo({
              center: event.detail.center,
              zoom: event.detail.zoom,
              duration: 1500
            });
  
            const onMoveEnd = () => {
              if (!completed) {
                completed = true;
                clearTimeout(timeout);
                map.off('moveend', onMoveEnd);
                resolve();
              }
            };
  
            map.on('moveend', onMoveEnd);
  
            const onError = (error) => {
              console.warn('Map flyTo error (non-fatal):', error);
            };
  
            map.on('error', onError);
            setTimeout(() => map.off('error', onError), 2000);
          });
  
        } else {
          console.warn('Unknown event format:', event.detail);
        }
  
      } catch (error) {
        console.error('Panning operation failed:', error);
      }
    };
  
    // Debounced version to prevent rapid-fire events
    const debouncedPanHandler = debounce(handlePanToLocation, 100);
    
    // Listen for all panning events
    window.addEventListener('panToRegion', debouncedPanHandler);
    window.addEventListener('panToSubregion', debouncedPanHandler);
    window.addEventListener('panToCountry', debouncedPanHandler);
    window.addEventListener('panToAdm1', debouncedPanHandler);
    window.addEventListener('panToDefault', debouncedPanHandler);
    window.addEventListener('panToDataset', debouncedPanHandler);  // ADD THIS
    
    return () => {
      window.removeEventListener('panToRegion', debouncedPanHandler);
      window.removeEventListener('panToSubregion', debouncedPanHandler);
      window.removeEventListener('panToCountry', debouncedPanHandler);
      window.removeEventListener('panToAdm1', debouncedPanHandler);
      window.removeEventListener('panToDefault', debouncedPanHandler);
      window.removeEventListener('panToDataset', debouncedPanHandler);  // ADD THIS
    }; 
  }, [map]);

  useEffect(() => {
    if (!map) return;
  
    const handleMapError = (error) => {
      console.warn('Map error (continuing operation):', error);
    };
  
    const handleSourceError = (error) => {
      console.warn('Source error (continuing operation):', error);
    };
  
    map.on('error', handleMapError);
    map.on('sourceerror', handleSourceError);
  
    return () => {
      map.off('error', handleMapError);
      map.off('sourceerror', handleSourceError);
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
