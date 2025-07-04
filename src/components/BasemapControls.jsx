// BasemapControls.js

import React from 'react';
import Sidebar from './Sidebar';
import ElevationColorBar from './ElevationColorBar';
import ColorBar from './ColorBar';
import LandUseLegend from './LandUseLegend';
import EcoregionLegend from './EcoregionLegend';

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
    label: 'Altitude',
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
  // Get current baselayer value (null if no baselayer)
  const currentBaselayer = layers.baselayer?.url || null;

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
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
        <fieldset>
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

        <fieldset>
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
      </div>
    </Sidebar>
  );
}
