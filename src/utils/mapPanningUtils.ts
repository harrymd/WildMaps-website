import type { RegionInfo, SubregionInfo, DatasetMap } from '../types';

// ─── Public types ──────────────────────────────────────────────────────────────

export type BoundingBox = [number, number, number, number];
export type LngLat = [number, number];

/** Subset of the MapLibre Map interface that we actually call. */
interface MapLike {
  fitBounds: (bounds: [LngLat, LngLat], opts?: { padding?: number; duration?: number }) => void;
  flyTo: (opts: { center: LngLat; zoom: number; duration?: number }) => void;
}

export interface PanOptions {
  padding?: number;
  duration?: number;
  /** 'fitBounds' — direct call; 'flyTo' — direct call; 'event' — CustomEvent dispatch. */
  method?: 'fitBounds' | 'flyTo' | 'event';
  eventName?: string;
  center?: LngLat | null;
  zoom?: number | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true when all four bbox values are non-null finite numbers. */
const isValidBbox = (bbox: unknown): bbox is BoundingBox =>
  Array.isArray(bbox) &&
  bbox.length === 4 &&
  (bbox as number[]).every((v) => v != null && isFinite(v));

// ─── Exported functions ────────────────────────────────────────────────────────

/**
 * Pans/zooms the map to a bounding box or centre/zoom.
 *
 * Three dispatch methods are supported:
 * - `'fitBounds'` — calls `map.fitBounds` directly.
 * - `'flyTo'`    — calls `map.flyTo` directly.
 * - `'event'`    — fires a CustomEvent on `window` (used when the Map ref lives
 *                  in a sibling component).
 */
export const panToBoundingBox = (
  map: MapLike | null,
  bbox: BoundingBox | null | undefined,
  options: PanOptions = {}
): void => {
  const {
    padding = 40,
    duration = 2000,
    method = 'fitBounds',
    eventName = 'panToLocation',
    center = null,
    zoom = null,
  } = options;

  if (method === 'fitBounds') {
    if (!map) {
      console.warn('Map instance not available');
      return;
    }
    if (!isValidBbox(bbox)) {
      console.warn('Invalid bounding box:', bbox);
      return;
    }
    const [minLng, minLat, maxLng, maxLat] = bbox;
    map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding, duration });

  } else if (method === 'flyTo') {
    if (!map) {
      console.warn('Map instance not available');
      return;
    }
    if (!center || center.length !== 2) {
      console.warn('Invalid center coordinates:', center);
      return;
    }
    if (zoom == null || !isFinite(zoom)) {
      console.warn('Invalid zoom level:', zoom);
      return;
    }
    map.flyTo({ center, zoom, duration });

  } else if (method === 'event') {
    // Build the event detail from either centre/zoom or bbox
    let detail: Record<string, unknown>;

    if (center && zoom != null) {
      detail = { center, zoom };
    } else if (isValidBbox(bbox)) {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      detail = { bounds: [[minLng, minLat], [maxLng, maxLat]] };
    } else {
      console.warn('Either bbox or center/zoom must be provided for event method');
      return;
    }

    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
};

/**
 * Convenience wrapper: pans to a specific centre + zoom level.
 * Defaults to the 'flyTo' method.
 */
export const panToCenter = (
  map: MapLike | null,
  center: LngLat,
  zoom: number,
  options: PanOptions = {}
): void => {
  panToBoundingBox(map, null, {
    ...options,
    method: options.method ?? 'flyTo',
    center,
    zoom,
  });
};

/**
 * Extracts the bbox for a named location from a dictionary.
 * `locationData` can be any map from string keys to objects with a `bbox` field.
 */
export const getBoundingBoxFromLocation = (
  locationData: Record<string, RegionInfo | SubregionInfo | { bbox: BoundingBox }>,
  locationName: string
): BoundingBox | null => {
  const info = locationData[locationName];
  if (info && isValidBbox(info.bbox)) return info.bbox;
  return null;
};

/**
 * Extracts the bbox from a dataset's `raster_summary.bounds` field.
 */
export const getBoundingBoxFromDataset = (
  data: DatasetMap,
  datasetKey: string
): BoundingBox | null => {
  const bounds = data?.[datasetKey]?.raster_summary?.bounds;
  if (!isValidBbox(bounds)) return null;
  return bounds;
};
