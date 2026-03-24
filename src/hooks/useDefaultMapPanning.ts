import { useEffect } from 'react';
import { panToBoundingBox, panToCenter } from '../utils/mapPanningUtils';
import type { BoundingBox, LngLat } from '../utils/mapPanningUtils';

export interface DefaultView {
  /** Centre coordinates [lng, lat] — use with `zoom`. */
  center?: LngLat;
  /** Zoom level — required when `center` is set. */
  zoom?: number;
  /** Bounding box to fit — alternative to centre/zoom. */
  bbox?: BoundingBox;
}

export interface DefaultPanOptions {
  eventName?: string;
  duration?: number;
  padding?: number;
  /** Milliseconds to wait before panning (allows the map to finish loading). */
  delay?: number;
}

/**
 * Pans to a default view when the component first mounts.
 * Uses the window-event dispatch system so the Map ref is not needed here.
 * Runs only once (empty dependency array).
 */
export const useDefaultMapPanning = (
  defaultView: DefaultView | null,
  options: DefaultPanOptions = {}
): void => {
  const { eventName = 'panToDefault', duration = 1500, padding = 20, delay = 250 } = options;

  useEffect(() => {
    if (!defaultView) return;

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (defaultView.center && defaultView.zoom != null) {
          panToCenter(null, defaultView.center, defaultView.zoom, {
            method: 'event',
            eventName,
            duration,
          });
        } else if (defaultView.bbox) {
          panToBoundingBox(null, defaultView.bbox, {
            method: 'event',
            eventName,
            duration,
            padding,
          });
        }
      }, delay);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
