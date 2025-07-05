import { useRef } from 'react';
import useMap from '../hooks/useMap';

export default function MapContainer({ transformStyle, layers, setLayers, showLeft, showRight }) {
  const mapContainerRef = useRef(null);
  
  const { map, isLoaded } = useMap(layers, mapContainerRef, setLayers, showLeft, showRight);

  return (
    <div 
      className="absolute inset-0 transition-transform duration-300 ease-in-out"
      style={{ transform: transformStyle }}
    >
      <div 
        ref={mapContainerRef}
        className="w-full h-full"
      />
    </div>
  );
}
