import { useRef } from 'react';
import useMap from '../hooks/useMap';

export default function MapContainer({ transformStyle}) {
  const mapContainer = useRef(null);
  useMap(mapContainer);

  return (
    <div
      style={{ transform: transformStyle }}
      className="transition-all duration-300 ease-in-out h-full"
      ref={mapContainer}
    />
  );
}
