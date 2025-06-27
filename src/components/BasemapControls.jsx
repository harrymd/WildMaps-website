// BasemapControls.js

import React from 'react';
import Sidebar from './Sidebar';

// Define your basemap options once
const UNDERLAYS = {
  STREET: {
    label: 'Street map',
    value: 'style/liberty_underlay.json'
  },
  SATELLITE: {
    label: 'Satellite imagery',
    value: 'style/esri_world_imagery.json'
  },
  ALTITUDE: {
    label: 'Altitude',
    value: 'style/mapzen_elevation_and_hillshade.json'
  },
  POPULATION: {
    label: 'Population density',
    value: 'style/worldpop.json'
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
    value: 'style/wdpa.json'
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
