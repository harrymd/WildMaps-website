// hooks/useMapMoveListener.js
import { useEffect } from 'react';

export default function useMapMoveListener(mapRef, onMove) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      onMove({ center, zoom, bounds });
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [mapRef, onMove]);
}
