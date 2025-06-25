import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import maplibregl from 'maplibre-gl';
//import useMapPanOnDatasetChange from '../hooks/useMapPanOnDatasetChange.js';

export default function useMap(containerRef, layers) {
  //
  const { data, datasetKey, adm0Key, adm1Key } = useAppContext();
  //
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const overlayStyleRef = useRef(null);
  const [mapVisible, setMapVisible] = useState(false);
  //
  const defaultBounds = [90.0, -10.0, 125.0, 10.0];
  //const underlayStyle = 'style/liberty_underlay.json';
  
  const layersRef = useRef(layers);

  // Utility to clear and add a layer.
  const setLayerStyle = async (layerName, styleUrlOrObject) => {
    const map = mapRef.current;

    if (layerName === 'underlay') {
      if (typeof styleUrlOrObject === 'string') {
        const response = await fetch(styleUrlOrObject);
        styleUrlOrObject = await response.json();
      }

      // Save style for future reuse
      layers.current.underlay = { style: styleUrlOrObject };

      // Re-initialize map with new style
      const newMap = initializeMap(containerRef.current, styleUrlOrObject,
        setMapLoaded, layers.current);
      mapRef.current = newMap;

      return;
    }

    if (!mapLoaded || !map) return;

    // Remove old layers and sources
    removeLayerIfExists(layerName);

    // Load new style
    if (typeof styleUrlOrObject === 'string') {
      const response = await fetch(styleUrlOrObject);
      styleUrlOrObject = await response.json();
    }

    // Add sources
    for (const [sourceId, source] of Object.entries(styleUrlOrObject.sources || {})) {
      map.addSource(`${layerName}-${sourceId}`, source);
    }

    // Add layers
    for (const layer of styleUrlOrObject.layers || []) {
      const layerCopy = {
        ...layer,
        id: `${layerName}-${layer.id}`,
        source: `${layerName}-${layer.source}`,
      };
      map.addLayer(layerCopy);
    }

    layers.current[layerName] = { style: styleUrlOrObject };
  };

  // Utility to remove a layer.
  const removeLayerIfExists = (layerName) => {
    const map = mapRef.current;
    const prev = layers.current[layerName];
    if (!prev || !prev.style) return;

    for (const layer of (prev.style.layers || [])) {
      const id = `${layerName}-${layer.id}`;
      if (map.getLayer(id)) map.removeLayer(id);
    }

    for (const sourceId of Object.keys(prev.style.sources || {})) {
      const id = `${layerName}-${sourceId}`;
      if (map.getSource(id)) map.removeSource(id);
    }

    layers.current[layerName] = null;
  };
  
  // The main map hook. Creates map object.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    layersRef.current = layers;  
    mapRef.current = initializeMap(containerRef.current,
                      setMapLoaded, layersRef.current)

    // Do cleanup.
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
   
  // The map object will be recreated if the container changes or the
  // underlay style changes.
  }, [containerRef]);
  
  // Hook that sets the map view after the map loads.
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    // Set the bounds.
    mapRef.current.fitBounds(
      [[defaultBounds[0], defaultBounds[1]],
	  	[defaultBounds[2], defaultBounds[3]]],
      { 	padding: 40,
	  	duration: 0,
	  	essential: true}
    );

    // Toggle the visibility.
    setMapVisible(true);

  }, [mapLoaded]);

  return { mapRef, mapVisible, setLayerStyle, removeLayerIfExists} ;
}

// Creates the map object to be rendered.
function initializeMap(container, setLoaded, layers) {
  // Create the underlay map in the container.
  const map = new maplibregl.Map({
    container: container,
    style: layers.underlay,
  });
  
  // Add navigation controls.
  map.addControl(new maplibregl.NavigationControl(
    { showZoom: true, showCompass: false }), 'bottom-right');
  
  // Store when the map has loaded.
  map.on('load', async () => {
    setLoaded(true);
    
    // Re-add overlays after map reload
    for (const [name, info] of Object.entries(layers || {})) {
      console.log(name, info);
      //if (name !== 'underlay' && info?.style) {
      if (name !== 'underlay' && info) {

        // !!! This is inefficient.
        let style;
        if (typeof info === 'string') {
          const response = await fetch(info);
          style = await response.json();
        } else {
          style = info;
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
      }
    }
  });

  return map
}
