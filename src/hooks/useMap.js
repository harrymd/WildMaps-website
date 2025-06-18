import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

export default function useMap(containerRef) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [114.5, 1.2],
      zoom: 5.5,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ showZoom: true, showCompass: false }), 'bottom-right');

    mapRef.current.on('load', () => {
      mapRef.current.addSource('source--country-borders', {
        type: 'vector',
        tiles: [
          "https://habitat-web-map.s3.eu-west-2.amazonaws.com/geoBoundaries_CGAZ_ADM0_tiles/{z}/{x}/{y}.pbf"
        ],
        minzoom: 0,
        maxzoom: 14
      });

      mapRef.current.addLayer({
        id: 'country-borders',
        type: 'line',
        source: 'source--country-borders',
        'source-layer': 'geoBoundaries_CGAZ_ADM0',
        paint: {
          'line-color': '#ff6600',
          'line-width': 1.2
        }
      });
    });

  }, [containerRef]);

  return mapRef;
}
