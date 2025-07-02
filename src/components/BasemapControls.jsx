// BasemapControls.js

import React from 'react';
import Sidebar from './Sidebar';

// Define basemap
const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
const PATH_STYLES = `${BUCKET_URL}/data_inputs/styles`
const UNDERLAYS = {
  STREET: {
    label: 'Street map',
    //value: 'style/liberty_underlay.json'
    //value: 'style/positron_underlay.json'
    //value: 'style/positron_english_underlay.json'
    value: `${PATH_STYLES}/positron_english_underlay.json`
  },
  SATELLITE: {
    label: 'Satellite imagery',
    //value: 'style/esri_world_imagery.json'
    value: `${PATH_STYLES}/esri_world_imagery.json`
  },
  ALTITUDE: {
    label: 'Altitude',
    //value: 'style/mapzen_elevation_and_hillshade.json'
    value: `${PATH_STYLES}/mapzen_elevation_and_hillshade.json`
  },
  POPULATION: {
    label: 'Population density',
    //value: 'style/worldpop.json'
    value: `${PATH_STYLES}/worldpop.json`
  },
  LAND_use: {
    label: 'Land use',
    //value: 'style/landcover.json'
    value: `${PATH_STYLES}/landcover.json`
  },
  ECOREGIONS: {
    label: 'Ecoregions',
    //value: 'style/ecoregions.json'
    value: `${PATH_STYLES}/ecoregions.json`
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
    >
      <div className="p-4 space-y-6">
        <fieldset>
          <legend className="font-medium mb-2">Select a base map</legend>
          <div className="flex flex-col space-y-2">
            {Object.values(UNDERLAYS).map(({ label, value }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="underlay"
                  value={value}
                  checked={layers.underlay?.url === value}
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
            ))}
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
