import React from 'react';
import { UNDERLAYS } from './config';

export default function UnderlaySection({ layers, setLayers }) {
  return (
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
                      underlay: { url: e.target.value }
                    }))
                  }
                />
                <span>{label}</span>
              </label>
              
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
  );
}
