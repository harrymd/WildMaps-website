import { useRef } from 'react';
import useMap from '../hooks/useMap';

export default function MapContainer({ transformStyle}) {
  const mapContainer = useRef(null);
  const { mapRef, mapVisible } = useMap(mapContainer);
  console.log(mapVisible);

  return (
    <div
      style={{ transform: transformStyle }}
      className={`transition-all duration-300 ease-in-out h-full ${
        mapVisible ? 'opacity-100' : 'opacity-0'}`}
      //className="transition-all duration-300 ease-in-out h-full opacity-50"
      ref={mapContainer}
    />
  );
}
