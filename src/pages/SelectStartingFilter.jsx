import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDefaultMapPanning } from '../hooks/useDefaultMapPanning';
import GeneralSelectComponent from '../components/GeneralSelectComponent';

const SelectStartingFilter = () => {
  const navigate = useNavigate();
  
  // Pan to default view when component mounts
  const defaultView = {
    center: [105.0, 13],
    zoom: 2.5
  };
  
  useDefaultMapPanning(defaultView, {
    eventName: 'panToDefault',
    duration: 1500
  });

  const getFilterOptions = () => {
    return [
      {
        value: 'region',
        cells: ['🗺️ Start with geographical region']
      },
      {
        value: 'superspecies',
        cells: ['🐆 Start with animal type (taxon)']
      }
    ];
  };

  const getContextDisplay = () => {
    return (
      <div className="mb-4">
        <p className="mb-4">Select how you'd like to begin filtering your data:</p>
      </div>
    );
  };

  const handleNext = (selectedValue) => {
    if (selectedValue === 'region') {
      navigate(`/region?startingFilter=region`);
    } else {
      navigate(`/superspecies?startingFilter=superspecies`);
    }
  };

  // Custom back handler that does nothing (hides the back button)
  const handleBack = () => {
    // Do nothing - this is the first page
  };

  return (
    <GeneralSelectComponent
      route="/starting-filter"
      paramKey="startingFilter"
      title="starting theme"
      description=""
      getOptions={getFilterOptions}
      getContextDisplay={getContextDisplay}
      tableHeaders={[]}
      customNextHandler={handleNext}
      customBackHandler={null} // This will hide the back button
    />
  );
};

export default SelectStartingFilter;
