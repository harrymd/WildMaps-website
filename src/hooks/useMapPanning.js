import { useEffect } from 'react';
import { useFilterState } from './useFilterState';
import { panToBoundingBox, getBoundingBoxFromLocation } from '../utils/mapPanningUtils';

export const useMapPanning = (paramKey, boundingBoxData, eventName = 'panToLocation') => {
  const { getParam } = useFilterState();
  
  // Helper function to pan to location
  const panToLocation = (locationName) => {
    const bbox = getBoundingBoxFromLocation(boundingBoxData, locationName);
    if (bbox) {
      panToBoundingBox(null, bbox, {
        method: 'event',
        eventName: eventName
      });
    }
  };

  // Custom handler for when location is clicked
  const handleLocationSelection = (locationName) => {
    panToLocation(locationName);
  };

  // Pan to location on page load/navigation if already selected
  // Only run once on component mount
  useEffect(() => {
    const currentLocation = getParam(paramKey);
    if (currentLocation && Object.keys(boundingBoxData).length > 0) {
      // Use requestAnimationFrame to ensure DOM is ready, then add delays
      requestAnimationFrame(() => {
        setTimeout(() => {
          panToLocation(currentLocation);
        }, 250); // Slightly longer initial delay
      });
    }
  }, []); // Empty dependency array - only runs once on mount

  return { handleLocationSelection, panToLocation };
};
