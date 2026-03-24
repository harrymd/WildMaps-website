import { useEffect } from 'react';
import { useFilterState } from './useFilterState';
import { panToBoundingBox, getBoundingBoxFromLocation } from '../utils/mapPanningUtils';
import type { RegionInfo, SubregionInfo } from '../types';
import type { BoundingBox } from '../utils/mapPanningUtils';

type BboxData = Record<string, RegionInfo | SubregionInfo | { bbox: BoundingBox }>;

export interface MapPanningControls {
  /** Call when the user explicitly selects a location to pan the map to it. */
  handleLocationSelection: (locationName: string) => void;
  /** Imperatively pan to a named location. */
  panToLocation: (locationName: string) => void;
}

/**
 * Pans the map to a named location using the event-based dispatch system
 * (because the Map ref lives in a sibling component).
 *
 * On mount, also pans to the currently-selected location (if any) so that
 * navigating back/forward always shows the right region.
 */
export const useMapPanning = (
  paramKey: string,
  boundingBoxData: BboxData,
  eventName = 'panToLocation'
): MapPanningControls => {
  const { getParam } = useFilterState();

  const panToLocation = (locationName: string) => {
    const bbox = getBoundingBoxFromLocation(boundingBoxData, locationName);
    if (bbox) {
      panToBoundingBox(null, bbox, { method: 'event', eventName });
    }
  };

  const handleLocationSelection = (locationName: string) => {
    panToLocation(locationName);
  };

  // Pan to the pre-selected location on initial mount
  // Empty dependency array: intentionally runs only once
  useEffect(() => {
    const currentLocation = getParam(paramKey);
    if (currentLocation && Object.keys(boundingBoxData).length > 0) {
      // requestAnimationFrame ensures the DOM (and map canvas) are ready
      requestAnimationFrame(() => {
        setTimeout(() => panToLocation(currentLocation), 250);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { handleLocationSelection, panToLocation };
};
