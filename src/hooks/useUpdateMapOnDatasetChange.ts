import { useEffect } from 'react';
import { useFilterState } from './useFilterState';
import type { DatasetMap, LayersMap } from '../types';

const TILE_BASE_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com/data_outputs/raster_tiles/SDM';

/**
 * Keeps the raster data layer in sync with the selected dataset key.
 * Also pans the map to the dataset's extent whenever the selection changes.
 *
 * This hook is called from within useMap so that layer updates happen
 * alongside the map lifecycle, not inside page components.
 */
export default function useUpdateMapOnDatasetChange(
  mapRef: React.RefObject<maplibregl.Map | null>,
  data: DatasetMap,
  setLayers: React.Dispatch<React.SetStateAction<LayersMap>>
): void {
  const { getParam } = useFilterState();
  const datasetKey = getParam('datasetKey');

  useEffect(() => {
    updateDatasetLayer(data, datasetKey, setLayers);

    if (datasetKey) {
      // Small delay ensures layer updates are processed before panning
      const timeoutId = setTimeout(() => panToDataset(data, datasetKey), 250);
      return () => clearTimeout(timeoutId);
    }
  }, [data, datasetKey, setLayers]);
}

// ─── Private helpers ───────────────────────────────────────────────────────────

/** Builds or removes the raster data layer based on the selected dataset. */
function updateDatasetLayer(
  data: DatasetMap,
  datasetKey: string | null,
  setLayers: React.Dispatch<React.SetStateAction<LayersMap>>
): void {
  if (!datasetKey) {
    // No dataset selected — remove the data layer
    setLayers((prev) => {
      const { data: _removed, ...rest } = prev;
      return rest;
    });
    return;
  }

  const dataset = data?.[datasetKey];
  const subFolder = dataset?.folder;
  const maxZoom = dataset?.max_zoom;
  const bounds = dataset?.raster_summary?.bounds ?? ([] as unknown as [number, number, number, number]);
  const [minLng, minLat, maxLng, maxLat] = bounds;

  if (!subFolder) {
    // Config incomplete — remove stale layer
    setLayers((prev) => {
      const { data: _removed, ...rest } = prev;
      return rest;
    });
    return;
  }

  const urlTemplate = `${TILE_BASE_URL}/${subFolder}/${datasetKey}_zoom_auto/{z}/{x}/{y}.png`;

  setLayers((prev) => ({
    ...prev,
    data: {
      info: {
        sources: {
          datasetRaster: {
            type: 'raster',
            tiles: [urlTemplate],
            tileSize: 256,
            bounds: [minLng, minLat, maxLng, maxLat],
            minzoom: 0,
            maxzoom: maxZoom,
          },
        },
        layers: [
          {
            id: 'datasetRaster',
            type: 'raster',
            source: 'datasetRaster',
          },
        ],
      },
    },
  }));
}

/** Fires a window event to pan the map to the dataset's geographic extent. */
function panToDataset(data: DatasetMap, datasetKey: string): void {
  const bounds = data?.[datasetKey]?.raster_summary?.bounds;
  if (!Array.isArray(bounds) || bounds.length !== 4) return;
  const [minLng, minLat, maxLng, maxLat] = bounds;
  if ([minLng, minLat, maxLng, maxLat].some((v) => v == null)) return;

  window.dispatchEvent(
    new CustomEvent('panToDataset', {
      detail: { bounds: [[minLng, minLat], [maxLng, maxLat]] },
    })
  );
}
