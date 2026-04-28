import { useRef } from 'react';
import useMap from '../hooks/useMap';
import type { LayersMap } from '../types';
import { BUCKET_URL } from '../constants/mapConfig';

const PATH_LOGO = `${BUCKET_URL}/data_inputs/website_assets/wildmaps_logo.png`;

interface MapContainerProps {
  transformStyle: string;
  layers: LayersMap;
  setLayers: React.Dispatch<React.SetStateAction<LayersMap>>;
  showLeft: boolean;
  showRight: boolean;
  className?: string;
}

/** Renders the MapLibre GL canvas and positions it relative to the open sidebars. */
export default function MapContainer({
  transformStyle,
  layers,
  setLayers,
  showLeft,
  showRight,
  className = '',
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // useMap handles all MapLibre initialisation, layer management, and event listening
  useMap(layers, mapContainerRef, setLayers, showLeft, showRight);

  return (
    <div
      className={`absolute inset-0 transition-transform duration-300 ease-in-out ${className}`}
      style={{ transform: transformStyle }}
    >
      <div ref={mapContainerRef} className="w-full h-full relative">
        {/* WildMaps logo — queried by useMap as .map-bottom-right-image for sidebar-aware translation */}
        <a
          href="https://www.wildcru.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="map-bottom-right-image absolute bottom-4 left-4 z-10 pointer-events-auto"
        >
          <img
            src={PATH_LOGO}
            alt="The WildMaps project logo."
            className="aspect-[1522/342] h-12 hover:opacity-80 transition-opacity"
          />
        </a>


      </div>
    </div>
  );
}
