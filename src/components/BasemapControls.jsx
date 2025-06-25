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
  //ALTITUDE: {
  //  label: 'Altitude',
  //  value: 'style/amazon_elevation.json'
  //}
  ALTITUDE: {
    label: 'Altitude',
    //value: 'style/mapzen_elevation.json'
    value: 'style/mapzen_elevation_and_hillshade.json'
  }
  //HILLSHADE: {
  //  label: 'Hillshade',
  //  value: 'style/amazon_hillshade.json'
  //}
};

export default function BasemapControls({
  isOpen,
  onClose,
  layers,
  setLayers
}) {
  return (
    <Sidebar
      title="Basemap controls"
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width="300px"
    >
      <div className="p-4 space-y-4">
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
      </div>
    </Sidebar>
  );
}
