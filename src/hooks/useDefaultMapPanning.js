// useDefaultMapPanning.js
import { useEffect } from 'react';
import { panToBoundingBox, panToCenter } from '../utils/mapPanningUtils';

/**
 * Hook to pan to a default location when component mounts
 * @param {Object} defaultView - Default view configuration
 * @param {Array} defaultView.bbox - Default bounding box [minLng, minLat, maxLng, maxLat] (optional)
 * @param {Array} defaultView.center - Default center [lng, lat] (optional)
 * @param {number} defaultView.zoom - Default zoom level (optional)
 * @param {Object} options - Panning options
 */
export const useDefaultMapPanning = (defaultView, options = {}) => {
  const {
    eventName = 'panToDefault',
    duration = 1500,
    padding = 20,
    delay = 250
  } = options;

  useEffect(() => {
    if (!defaultView) return;

    // Small delay to ensure map is ready
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (defaultView.center && defaultView.zoom != null) {
          // Use center/zoom
          panToCenter(null, defaultView.center, defaultView.zoom, {
            method: 'event',
            eventName,
            duration
          });
        } else if (defaultView.bbox) {
          // Use bounding box
          panToBoundingBox(null, defaultView.bbox, {
            method: 'event',
            eventName,
            duration,
            padding
          });
        }
      }, delay);
    });
  }, []); // Only run once on mount
};
