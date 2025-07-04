import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function LabelsRoadsSection({ 
  isOverlayLayerVisible, 
  handleOverlayLayerToggle 
}) {
  return (
    <fieldset>
      <legend className="font-medium mb-2">Toggle labels and roads</legend>
      
      <ToggleSwitch
        label="Show labels and roads"
        isChecked={isOverlayLayerVisible}
        onChange={handleOverlayLayerToggle}
        srOnlyText="Toggle labels and roads visibility"
      />
    </fieldset>
  );
}
