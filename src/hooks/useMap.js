import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import useMapPanOnDatasetChange from '../hooks/useMapPanOnDatasetChange.js';
import maplibregl from 'maplibre-gl';

//export default function useMap(containerRef, datasetKey, datasetSubFolder, datasetZoomStr) {
export default function useMap(containerRef) {
  const mapRef = useRef(null);
  const { data, datasetKey, adm0Key, adm1Key } = useAppContext();

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      //center: [114.5, 1.2], // Borneo
      //zoom: 5.5, // Borneo
      center: [102, -0.5], //
      zoom: 4,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ showZoom: true, showCompass: false }), 'bottom-right');

    //mapRef.current.on('load', () => {
    //  mapRef.current.addSource('source--country-borders', {
    //    type: 'vector',
    //    tiles: [
    //      "https://habitat-web-map.s3.eu-west-2.amazonaws.com/geoBoundaries_CGAZ_ADM0_tiles/{z}/{x}/{y}.pbf"
    //    ],
    //    minzoom: 0,
    //    maxzoom: 14
    //  });

    //  mapRef.current.addLayer({
    //    id: 'country-borders',
    //    type: 'line',
    //    source: 'source--country-borders',
    //    'source-layer': 'geoBoundaries_CGAZ_ADM0',
    //    paint: {
    //      'line-color': '#ff6600',
    //      'line-width': 1.2
    //    }
    //  });
    //});

  }, [containerRef]);
  
  // Add/change dataset raster layer.
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
  
    const map = mapRef.current;
    const sourceId = 'source--datasetRaster';
    const layerId = 'layer--datasetRaster';
	//
  	//const { data, datasetKey} = useAppContext();
  	const datasetSubFolder = data?.[datasetKey]?.folder;
  	const datasetMaxZoom = 6;
  	const datasetMaxZoomStr = datasetMaxZoom.toString().padStart(2, '0');
  	const datasetBounds = data?.[datasetKey]?.raster_summary?.bounds ?? [];
  	const [datasetMinLng, datasetMinLat, datasetMaxLng, datasetMaxLat] =
  	        datasetBounds;

    // Remove existing raster source/layer
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  
    // If datasetKey is set, add the new raster tile layer
    if (datasetKey && datasetSubFolder && datasetMaxZoomStr) {
      const urlTemplate = `https://habitat-web-map.s3.eu-west-2.amazonaws.com/code_output/raster_tiles/SDM/${datasetSubFolder}/${datasetKey}_zoom_${datasetMaxZoomStr}/{z}/{x}/{y}.png`;
      
      // Behaviour of minzoom and maxzoom:
      // When zoomed out beyond minzoom, no tiles will be requested.
      // When zoomed in beyond maxzoom, the highest-resolution tiles available
      // will be requested (which can result in blurry tiles).
      // If the desired behaviour is to hide the tiles when zoomed in beyond
      // maxzoom, then you need to set maxzoom in the *layer* not the *source*.
      map.addSource(sourceId, {
        type: 'raster',
        tiles: [urlTemplate],
        tileSize: 256,
        bounds: [datasetMinLng, datasetMinLat, datasetMaxLng, datasetMaxLat],
        minzoom: 0,                   
        maxzoom: datasetMaxZoom,                  
      });
  
      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': 0.7
          },
      });
    }
  }, [data, datasetKey]);

  useMapPanOnDatasetChange(mapRef, data, datasetKey, adm0Key, adm1Key);

  return mapRef;
}
