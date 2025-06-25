import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import maplibregl from 'maplibre-gl';

export default function useMap(containerRef, layers) {
  const { data, datasetKey, adm0Key, adm1Key } = useAppContext();

  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  
  // Store the view state in a ref that persists across renders
  const viewStateRef = useRef(null);

  const layersRef = useRef(layers);

  // Keep layersRef in sync with prop
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  const defaultBounds = [90.0, -10.0, 125.0, 10.0];

  // Utility to remove a layer
  const removeLayerIfExists = (layerName) => {
    const map = mapRef.current;
    const layerStyle = layersRef.current[layerName + '_style'];
    if (!map || !layerStyle) return;

    for (const layer of layerStyle.layers || []) {
      const id = `${layerName}-${layer.id}`;
      if (map.getLayer(id)) map.removeLayer(id);
    }

    for (const sourceId of Object.keys(layerStyle.sources || {})) {
      const id = `${layerName}-${sourceId}`;
      if (map.getSource(id)) map.removeSource(id);
    }

    layersRef.current[layerName + '_style'] = null;
  };

  // Utility to set layer style
  const setLayerStyle = async (layerName, styleUrlOrObject) => {
    const map = mapRef.current;

    if (!mapLoaded || !map || !styleUrlOrObject) return;

    // Skip if this style is already applied
    if (layersRef.current[layerName] === styleUrlOrObject) return;

    // Fetch style if string
    let style = styleUrlOrObject;
    if (typeof styleUrlOrObject === 'string') {
      const response = await fetch(styleUrlOrObject);
      style = await response.json();
    }

    removeLayerIfExists(layerName);

    // Add sources
    for (const [sourceId, source] of Object.entries(style.sources || {})) {
      map.addSource(`${layerName}-${sourceId}`, source);
    }

    // Add layers
    for (const layer of style.layers || []) {
      const layerCopy = {
        ...layer,
        id: `${layerName}-${layer.id}`,
        source: `${layerName}-${layer.source}`,
      };
      map.addLayer(layerCopy);
    }

    // Store applied style and url for reference
    layersRef.current[layerName + '_style'] = style;
    layersRef.current[layerName] = styleUrlOrObject;
  };

  // Initialize the map
  useEffect(() => {
    if (!containerRef.current || !layers.underlay) return;

    // Capture current view state before initializing new map
    const oldMap = mapRef.current;
    if (oldMap) {
      try {
        viewStateRef.current = {
          center: oldMap.getCenter(),
          zoom: oldMap.getZoom(),
          bearing: oldMap.getBearing(),
          pitch: oldMap.getPitch(),
        };
        console.log('Captured view state:', viewStateRef.current);
      } catch (error) {
        console.warn('Failed to capture view state:', error);
        viewStateRef.current = null;
      }
    }

    const initializeMap = async () => {
      setMapLoaded(false);
      // Keep mapVisible true to maintain current display
      
      // Create a temporary container for the new map
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '0';
      tempContainer.style.left = '0';  
      tempContainer.style.width = '100%';
      tempContainer.style.height = '100%';
      tempContainer.style.visibility = 'hidden'; // Hidden until ready
      containerRef.current.appendChild(tempContainer);

      let underlayStyle = layers.underlay;

      if (typeof underlayStyle === 'string') {
        const response = await fetch(underlayStyle);
        underlayStyle = await response.json();
      }

      const map = new maplibregl.Map({
        container: tempContainer,
        style: underlayStyle,
      });

      map.addControl(new maplibregl.NavigationControl({
        showZoom: true, showCompass: false,
      }), 'bottom-right');

      map.on('load', async () => {
        setMapLoaded(true);

        // Restore previous view if there was one
        if (viewStateRef.current) {
          console.log('Restoring view state:', viewStateRef.current);
          map.jumpTo({
            center: viewStateRef.current.center,
            zoom: viewStateRef.current.zoom,
            bearing: viewStateRef.current.bearing,
            pitch: viewStateRef.current.pitch,
          });
        } else {
          console.log('No previous view, fitting to default bounds');
          map.fitBounds(
            [[defaultBounds[0], defaultBounds[1]], [defaultBounds[2], defaultBounds[3]]],
            { padding: 40, duration: 0, essential: true }
          );
        }

        // Re-add overlays
        for (const [name, styleUrlOrObject] of Object.entries(layersRef.current || {})) {
          if (name === 'underlay' || name.endsWith('_style') || !styleUrlOrObject) continue;
          console.log('Re-adding overlay:', name, styleUrlOrObject);

          let style = styleUrlOrObject;
          if (typeof style === 'string') {
            const response = await fetch(style);
            style = await response.json();
          }

          for (const [sourceId, source] of Object.entries(style.sources || {})) {
            map.addSource(`${name}-${sourceId}`, source);
          }

          for (const layer of style.layers || []) {
            const layerCopy = {
              ...layer,
              id: `${name}-${layer.id}`,
              source: `${name}-${layer.source}`,
            };
            map.addLayer(layerCopy);
          }

          // Store applied style
          layersRef.current[name + '_style'] = style;
        }

        // Everything is loaded and ready - now swap the maps
        setMapLoaded(true);
        
        // Clean up old map if it exists
        if (oldMap) {
          oldMap.remove();
        }
        
        // Make new map visible and update ref
        tempContainer.style.visibility = 'visible';
        mapRef.current = map;
        
        setMapVisible(true);
      });

      // Don't update mapRef.current here - wait until everything is ready
    };

    initializeMap();

    return () => {
      // Don't remove the map in cleanup - let the next effect handle it
      // This ensures we can capture the view state before removal
    };
  }, [containerRef, layers.underlay]);

  // Separate cleanup effect that runs when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return { mapRef, mapVisible };
}
