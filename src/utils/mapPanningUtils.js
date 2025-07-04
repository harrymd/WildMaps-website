// mapPanningUtils.js

/**
 * Pans/zooms a map to fit the given bounding box or center/zoom
 * @param {Object} map - The map instance (Mapbox/Leaflet etc.)
 * @param {Array} bbox - Bounding box [minLng, minLat, maxLng, maxLat] (optional if using center/zoom)
 * @param {Object} options - Pan/zoom options
 * @param {number} options.padding - Padding in pixels (default: 40)
 * @param {number} options.duration - Animation duration in ms (default: 2000)
 * @param {string} options.method - 'fitBounds', 'flyTo', or 'event' (default: 'fitBounds')
 * @param {string} options.eventName - Custom event name if using event method
 * @param {Array} options.center - Center coordinates [lng, lat] (for flyTo method)
 * @param {number} options.zoom - Zoom level (for flyTo method)
 */
export const panToBoundingBox = (map, bbox, options = {}) => {
  const {
    padding = 40,
    duration = 2000,
    method = 'fitBounds',
    eventName = 'panToLocation',
    center = null,
    zoom = null
  } = options;

  if (method === 'fitBounds') {
    // Direct map method - for bounding box fitting
    if (!map || !map.fitBounds) {
      console.warn('Map instance not available or does not support fitBounds');
      return;
    }

    // Validate bounding box
    if (!Array.isArray(bbox) || bbox.length !== 4) {
      console.warn('Invalid bounding box format:', bbox);
      return;
    }

    const [minLng, minLat, maxLng, maxLat] = bbox;
    if ([minLng, minLat, maxLng, maxLat].some((v) => v == null)) {
      console.warn('Invalid bounding box values:', bbox);
      return;
    }

    map.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding, duration }
    );
  } else if (method === 'flyTo') {
    // Direct map method - for center/zoom
    if (!map || !map.flyTo) {
      console.warn('Map instance not available or does not support flyTo');
      return;
    }

    if (!center || !Array.isArray(center) || center.length !== 2) {
      console.warn('Invalid center coordinates:', center);
      return;
    }

    if (zoom == null || typeof zoom !== 'number') {
      console.warn('Invalid zoom level:', zoom);
      return;
    }

    map.flyTo({
      center: center,
      zoom: zoom,
      duration: duration
    });
  } else if (method === 'event') {
    // Custom event method - supports both bbox and center/zoom
    let eventDetail = {};

    if (center && zoom != null) {
      // Center/zoom event
      eventDetail = { center, zoom };
    } else if (bbox) {
      // Bounding box event
      if (!Array.isArray(bbox) || bbox.length !== 4) {
        console.warn('Invalid bounding box format:', bbox);
        return;
      }

      const [minLng, minLat, maxLng, maxLat] = bbox;
      if ([minLng, minLat, maxLng, maxLat].some((v) => v == null)) {
        console.warn('Invalid bounding box values:', bbox);
        return;
      }

      eventDetail = { bounds: [[minLng, minLat], [maxLng, maxLat]] };
    } else {
      console.warn('Either bbox or center/zoom must be provided for event method');
      return;
    }

    const event = new CustomEvent(eventName, { detail: eventDetail });
    window.dispatchEvent(event);
  }
};

/**
 * Pans/zooms a map to a specific center and zoom level
 * @param {Object} map - The map instance (Mapbox/Leaflet etc.)
 * @param {Array} center - Center coordinates [lng, lat]
 * @param {number} zoom - Zoom level
 * @param {Object} options - Pan/zoom options
 */
export const panToCenter = (map, center, zoom, options = {}) => {
  return panToBoundingBox(map, null, {
    ...options,
    method: options.method || 'flyTo',
    center,
    zoom
  });
};

/**
 * Extracts bounding box from location data
 * @param {Object} locationData - Location data object
 * @param {string} locationName - Name of the location
 * @returns {Array|null} Bounding box or null if not found
 */
export const getBoundingBoxFromLocation = (locationData, locationName) => {
  const locationInfo = locationData[locationName];
  if (locationInfo && locationInfo.bbox) {
    return locationInfo.bbox;
  }
  return null;
};

/**
 * Extracts bounding box from dataset
 * @param {Object} data - Dataset object
 * @param {string} datasetKey - Dataset key
 * @returns {Array|null} Bounding box or null if not found
 */
export const getBoundingBoxFromDataset = (data, datasetKey) => {
  const dataset = data?.[datasetKey];
  if (!dataset) return null;
  
  const bounds = dataset.raster_summary?.bounds;
  if (!Array.isArray(bounds) || bounds.length !== 4) return null;
  
  return bounds;
};
