// BasemapControls.js

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import ElevationColorBar from './ElevationColorBar';
import ColorBar from './ColorBar';
import LandUseLegend from './LandUseLegend';
import EcoregionLegend from './EcoregionLegend';
import SDMLegend from './SDMLegend';

// Import your legend components
// import ElevationColorBar from './ElevationColorBar';
// import PopulationLegend from './PopulationLegend';
// import LandUseLegend from './LandUseLegend';
// import EcoregionsLegend from './EcoregionsLegend';

// Define basemap
const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
const PATH_STYLES = `${BUCKET_URL}/data_inputs/styles`
const UNDERLAYS = {
  STREET: {
    label: 'Street map',
    value: `${PATH_STYLES}/positron_english_underlay.json`,
    legend: null // No legend for street map
  },
  SATELLITE: {
    label: 'Satellite imagery',
    value: `${PATH_STYLES}/esri_world_imagery.json`,
    legend: null // No legend for satellite imagery
  },
  ALTITUDE: {
    label: 'Elevation',
    value: `${PATH_STYLES}/mapzen_elevation_and_hillshade.json`,
    legend: ElevationColorBar
  },
  POPULATION: {
    label: 'Population density',
    value: `${PATH_STYLES}/worldpop.json`,
    legend: ColorBar
  },
  LAND_USE: {
    label: 'Land cover',
    value: `${PATH_STYLES}/landcover.json`,
    legend: LandUseLegend
  },
  ECOREGIONS: {
    label: 'Ecoregions',
    value: `${PATH_STYLES}/ecoregions.json`,
    legend: EcoregionLegend
  }
};

// Define overlay options
const OVERLAYS = {
  NONE: {
    label: 'No overlay',
    value: null
  },
  PROTECTED_AREAS: {
    label: 'Protected areas',
    value: `${PATH_STYLES}/wdpa.json`
  }
};

export default function BasemapControls({
  isOpen,
  onClose,
  layers,
  setLayers
}) {
  const [searchParams] = useSearchParams();
  const datasetKey = searchParams.get('datasetKey');
  const { data } = useAppContext();
  
  // Extract maxVal from the dataset
  const maxVal = datasetKey && data[datasetKey] ? (() => {
    const dataset = data[datasetKey];
    const scaleFactor = dataset['scale_factor'];
    console.log('Scale factor:', scaleFactor);

    return scaleFactor ?
      (dataset['raster_summary']['99pc'] / scaleFactor) :
      dataset['raster_summary']['99pc'];
  })() : null;
  
  // Get current baselayer value (null if no baselayer)
  const currentBaselayer = layers.baselayer?.url || null;

  // Check if data layer is currently visible (exists in layers)
  const isDataLayerVisible = !!layers.data;

  // Store the data layer when it's hidden so we can restore it
  const [hiddenDataLayer, setHiddenDataLayer] = React.useState(null);

  // Check if overlay layer (positron_overlay) is currently visible
  const isOverlayLayerVisible = !!layers.overlay;

  // Store the overlay layer when it's hidden so we can restore it
  const [hiddenOverlayLayer, setHiddenOverlayLayer] = React.useState(null);

  const handleOverlayChange = (overlayValue) => {
    setLayers((prev) => {
      const newLayers = { ...prev };
      
      if (overlayValue === null) {
        // Remove baselayer
        delete newLayers.baselayer;
      } else {
        // Add or replace baselayer
        newLayers.baselayer = {
          url: overlayValue
        };
      }
      
      return newLayers;
    });
  };

  const handleDataLayerToggle = () => {
    if (isDataLayerVisible) {
      // Store the current data layer before removing it
      setHiddenDataLayer(layers.data);
      setLayers((prev) => {
        const newLayers = { ...prev };
        delete newLayers.data;
        return newLayers;
      });
    } else {
      // Restore the hidden data layer
      if (hiddenDataLayer) {
        setLayers((prev) => ({
          ...prev,
          data: hiddenDataLayer
        }));
      }
    }
  };

  const handleOverlayLayerToggle = () => {
    if (isOverlayLayerVisible) {
      // Store the current overlay layer before removing it
      setHiddenOverlayLayer(layers.overlay);
      setLayers((prev) => {
        const newLayers = { ...prev };
        delete newLayers.overlay;
        return newLayers;
      });
    } else {
      // Restore the hidden overlay layer or add default positron overlay
      const overlayToRestore = hiddenOverlayLayer || {
        url: `${PATH_STYLES}/positron_overlay.json`
      };
      setLayers((prev) => ({
        ...prev,
        overlay: overlayToRestore
      }));
    }
  };

  return (
    <Sidebar
      title="Basemap controls"
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width="300px"
      //scrollOnOverflow={true}
    >
      {/*<div className="p-4 space-y-6 overflow-y-auto">*/}
      {/*<div className="p-2 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">*/}
      <div className="p-2 pr-4 space-y-6 overflow-y-auto h-[calc(100vh-100px)]">
        <fieldset className="border-b border-gray-200 pb-4">
          <legend className="font-medium mb-2">Select a base map</legend>
          <div className="flex flex-col space-y-2">
            {Object.values(UNDERLAYS).map(({ label, value, legend }) => {
              const isSelected = layers.underlay?.url === value;
              const LegendComponent = legend;
              
              return (
                <div key={value} className="space-y-0">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="underlay"
                      value={value}
                      checked={isSelected}
                      onChange={(e) =>
                        setLayers((prev) => ({
                          ...prev,
                          underlay: {
                            url: e.target.value
                          },
                        }))
                      }
                    />
                    <span>{label}</span>
                  </label>
                  
                  {/* Render legend if this option is selected and has a legend */}
                  {isSelected && LegendComponent && (
                    <div className="ml-0">
                      <LegendComponent />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="border-b border-gray-200 pb-4">
          <legend className="font-medium mb-2">Select an overlay layer</legend>
          <div className="flex flex-col space-y-2">
            {Object.values(OVERLAYS).map(({ label, value }) => (
              <label key={value || 'none'} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="overlay"
                  value={value || ''}
                  checked={currentBaselayer === value}
                  onChange={() => handleOverlayChange(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
    
        {/* Conditionally render SDMLegend or placeholder message */}
        {datasetKey && maxVal !== null ? (
          <fieldset className="border-b border-gray-200 pb-4">
            <legend className="font-medium mb-2">Data layer: Colour scale and toggle</legend>
            
            {/* iPhone-style toggle for data layer visibility */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Show data layer</span>
              <button
                onClick={handleDataLayerToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isDataLayerVisible ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={isDataLayerVisible}
              >
                <span className="sr-only">Toggle data layer visibility</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDataLayerVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <SDMLegend maxVal={maxVal} />
          </fieldset>
        ) : (
          <fieldset className="border-b border-gray-200 pb-4">
            <legend className="font-medium mb-2">Data layer: Controls and colour scale</legend>
            <div className="ml-0 text-gray-600 text-sm">
              Choose a dataset to view the dataset legend and controls
            </div>
          </fieldset>
        )}

        {/* Toggle labels and roads */}
        <fieldset>
          <legend className="font-medium mb-2">Toggle labels and roads</legend>
          
          {/* iPhone-style toggle for overlay layer visibility */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Show labels and roads</span>
            <button
              onClick={handleOverlayLayerToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isOverlayLayerVisible ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={isOverlayLayerVisible}
            >
              <span className="sr-only">Toggle labels and roads visibility</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isOverlayLayerVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </fieldset>

      </div>
    </Sidebar>
  );
}
