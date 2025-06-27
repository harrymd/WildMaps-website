import { useRef } from 'react';
import useMap from '../hooks/useMap';

export default function MapContainer({ transformStyle, layers, setLayers}) {
  const mapContainer = useRef(null);
  const { mapRef, isLoaded} = useMap(layers, mapContainer, setLayers);
  const mapVisible = true;

  return (
    <div
      style={{ transform: transformStyle }}
      className={`transition-all duration-300 ease-in-out h-full ${
        mapVisible ? 'opacity-100' : 'opacity-0'}`}
      ref={mapContainer}
    />
  );
}
