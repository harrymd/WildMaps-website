import { useEffect } from 'react';
import { useFilterState } from './useFilterState';

export const useMapPanning = (paramKey, boundingBoxData, eventName = 'panToLocation') => {
  const { getParam } = useFilterState();
  
  // Helper function to pan to location
  const panToLocation = (locationName) => {
    const locationInfo = boundingBoxData[locationName];
    if (locationInfo && locationInfo.bbox) {
      const [minLng, minLat, maxLng, maxLat] = locationInfo.bbox;
      
      // Dispatch custom event with bounding box data
      const event = new CustomEvent(eventName, {
        detail: { bounds: [[minLng, minLat], [maxLng, maxLat]] }
      });
      window.dispatchEvent(event);
    }
  };

  // Custom handler for when location is clicked
  const handleLocationSelection = (locationName) => {
    panToLocation(locationName);
  };

  // Pan to location on page load/navigation if already selected
  useEffect(() => {
    const currentLocation = getParam(paramKey);
    if (currentLocation && Object.keys(boundingBoxData).length > 0) {
      // Small delay to ensure map is ready
      setTimeout(() => {
        panToLocation(currentLocation);
      }, 100);
    }
  }, [boundingBoxData, getParam, paramKey]);

  return { handleLocationSelection, panToLocation };
};
