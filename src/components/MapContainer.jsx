import { useRef } from 'react';
import useMap from '../hooks/useMap';

export default function MapContainer({ transformStyle, layers, setLayers, showLeft, showRight }) {
  const mapContainerRef = useRef(null);
  
  const { map, isLoaded } = useMap(layers, mapContainerRef, setLayers, showLeft, showRight);

  const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
  const PATH_LOGO = `${BUCKET_URL}/data_inputs/website_assets/wildmaps_logo.png`;

  return (
    <div 
      className="absolute inset-0 transition-transform duration-300 ease-in-out"
      style={{ transform: transformStyle }}
    >
      <div 
        ref={mapContainerRef}
        className="w-full h-full relative"
      >
        {/* Custom image in bottom right corner */}
        <img 
          src={PATH_LOGO}
          alt="Map logo"
          className="map-bottom-right-image absolute bottom-4 left-4 aspect-[1522/342] h-12 z-10 pointer-events-none"

          style={{
            // You can add additional styling here
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        />
      </div>
    </div>
  );
}
