import React from 'react';
import SDMLegend from '../SDMLegend';
import ToggleSwitch from './ToggleSwitch';

export default function DataLayerSection({ 
  datasetKey, 
  maxVal, 
  isDataLayerVisible, 
  handleDataLayerToggle 
}) {
  if (!datasetKey || maxVal === null) {
    return (
      <fieldset className="border-b border-gray-200 pb-4">
        <legend className="font-medium mb-2">Data layer: Controls and colour scale</legend>
        <div className="ml-0 text-gray-600 text-sm">
          Choose a dataset to view the dataset legend and controls
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className="border-b border-gray-200 pb-4">
      <legend className="font-medium mb-2">Data layer: Colour scale and toggle</legend>
      
      <ToggleSwitch
        label="Show data layer"
        isChecked={isDataLayerVisible}
        onChange={handleDataLayerToggle}
        srOnlyText="Toggle data layer visibility"
      />
      
      <SDMLegend maxVal={maxVal} />
    </fieldset>
  );
}
