import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Layers, X } from 'lucide-react';
import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const mapControlsContainer = useRef(null);

  const sidebarWidth = 'min(50vw, 35rem)';
  const calculateMapWidth = () => {
    if (showLeftSidebar && showRightSidebar) return `calc(100vw - 2 * ${sidebarWidth})`;
    if (showLeftSidebar || showRightSidebar) return `calc(100vw - ${sidebarWidth})`;
    return '100vw';
  };

  const computeSidebarWidth = () => {
    const vw = window.innerWidth;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Math.min(0.5 * vw, 35 * rem); // returns pixel value
  };


  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [114.5, 1.2], // Borneo.
      zoom: 5.5, // Borneo.
    });

	map.current.addControl(new maplibregl.NavigationControl({ showZoom: true, showCompass: false }), 'bottom-right');
  }, []);

  useEffect(() => {
    if (!map.current) return;
  
    const controls = mapContainer.current?.querySelector('.maplibregl-ctrl-bottom-right');
    if (!controls) return;
  
    const sidebarPx = computeSidebarWidth();

	let translate = 'translateX(0)';
	if (showLeftSidebar && showRightSidebar) {
	  translate = `translateX(-${sidebarPx}px)`;
	} else if (showLeftSidebar || showRightSidebar) {
	  translate = `translateX(-${sidebarPx / 2}px)`;
	}

    [...controls.children].forEach((child) => {
      child.style.transition = 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out';
      child.style.transform = translate;
    });
  }, [showLeftSidebar, showRightSidebar]);

  return (
    <div className="relative w-screen h-screen font-sans overflow-hidden">
      {/* Left sidebar toggle button */}
      {!showLeftSidebar && (
        <button
          onClick={() => setShowLeftSidebar(true)}
          className="absolute top-4 left-4 z-30 p-2 bg-white shadow rounded-full hover:bg-gray-100"
          title="Control habitat layers"
        >
          <Layers className="w-5 h-5" />
        </button>
      )}

      {/* Right sidebar toggle button */}
      {!showRightSidebar && (
        <button
          onClick={() => setShowRightSidebar(true)}
          className="absolute top-4 right-4 z-30 p-2 bg-white shadow rounded-full hover:bg-gray-100"
          title="Control basemap layers"
        >
          <Layers className="w-5 h-5" />
        </button>
      )}

      {/* Left sidebar */}
      <div
        style={{ width: showLeftSidebar ? sidebarWidth : '0' }}
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-20 transition-all duration-300 ease-in-out overflow-hidden ${
          showLeftSidebar ? 'p-6' : 'p-0'
        }`}
      >
        <div
          className={`transition-opacity duration-300 ${
            showLeftSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Habitat Layers</h2>
            <button onClick={() => setShowLeftSidebar(false)} className="hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-700">Left sidebar content placeholder.</p>
        </div>
      </div>

      {/* Right sidebar */}
      <div
        style={{ width: showRightSidebar ? sidebarWidth : '0' }}
        className={`fixed top-0 right-0 h-full bg-white shadow-lg z-20 transition-all duration-300 ease-in-out overflow-hidden ${
          showRightSidebar ? 'p-6' : 'p-0'
        }`}
      >
        <div
          className={`transition-opacity duration-300 ${
            showRightSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Basemap Layers</h2>
            <button onClick={() => setShowRightSidebar(false)} className="hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-700">Right sidebar content placeholder.</p>
        </div>
      </div>

      {/* Map container */}
      <div
        style={{
          transform: `translateX(${
            showLeftSidebar && showRightSidebar
              ? '0'
              : showLeftSidebar
              ? `calc(${sidebarWidth} / 2)`
              : showRightSidebar
              ? `calc(-1 * ${sidebarWidth} / 2)`
              : '0'
          })`,
        }}
        className="transition-all duration-300 ease-in-out h-full"
        ref={mapContainer}
      />
    </div>
  );
}

