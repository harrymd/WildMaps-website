import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useFilterState } from './useFilterState';
import useUpdateMapOnDatasetChange from './useUpdateMapOnDatasetChange';
import type { LayersMap, MapLayer, StyleLayer } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UseMapReturn {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

/** Custom event detail sent by the window-event panning system. */
interface PanEventDetail {
  bounds?: [[number, number], [number, number]];
  center?: [number, number];
  zoom?: number;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

/** Returns a debounced version of `func` that fires after `wait` ms of silence. */
const debounce = <T extends (...args: unknown[]) => void>(func: T, wait: number): T => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: unknown[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as T;
};

/**
 * Computes the current sidebar widths in pixels, mirroring the CSS expressions
 * `min(50vw, 35rem)` (left) and `min(30vw, 21rem)` (right).
 */
const computeSidebarWidths = () => {
  const vw = window.innerWidth;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return {
    left: Math.min(0.5 * vw, 35 * rem),
    right: Math.min(0.3 * vw, 21 * rem),
  };
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Core MapLibre hook — initialises the map, manages named layer slots, handles
 * projection switching (globe ↔ Mercator), and listens for window pan events.
 */
const useMap = (
  layers: LayersMap,
  containerRef: React.RefObject<HTMLDivElement | null>,
  setLayers: React.Dispatch<React.SetStateAction<LayersMap>>,
  showLeft = true,
  showRight = false
): UseMapReturn => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /** Mirrors the current layers so async callbacks always see the latest state. */
  const layersRef = useRef<LayersMap>({});

  /** Tracks the active projection so we only call setProjection when needed. */
  const currentProjection = useRef<'globe' | 'mercator'>('mercator');

  const { data } = useAppContext();

  // ── Layer info fetcher ─────────────────────────────────────────────────────

  /**
   * Fetches style JSON for a layer that only has a URL (not yet resolved info).
   * Memoised so it's stable across renders.
   */
  const fetchLayerInfo = useCallback(async (layerKey: string, layerData: MapLayer): Promise<MapLayer> => {
    if (!layerData.info && layerData.url) {
      try {
        const response = await fetch(layerData.url);
        const info = await response.json();
        return { ...layerData, info };
      } catch (error) {
        console.error(`Failed to fetch layer info for ${layerKey}:`, error);
      }
    }
    return layerData;
  }, []);

  // ── Map initialisation ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef?.current) return;

    // Cast to `any` to allow `projection` which exists at runtime in MapLibre 5.6
    // but is absent from the TS type definitions in this version.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstance = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#C3C7C9' }, // positron sea grey
          },
        ],
      },
      center: [105.0, 13],
      zoom: 2.5,
      maxZoom: 11,
      projection: 'globe',
    } as any);

    mapInstance.on('load', () => setIsLoaded(true));

    // ── Projection switching: globe below zoom 4, Mercator above ────────────
    const handleProjectionSwitch = () => {
      if (!mapInstance.isStyleLoaded()) return;
      const zoom = mapInstance.getZoom();
      const target: 'globe' | 'mercator' = zoom < 4 ? 'globe' : 'mercator';
      if (currentProjection.current !== target) {
        try {
          mapInstance.setProjection({ type: target } as maplibregl.ProjectionSpecification);
          currentProjection.current = target;
        } catch (error) {
          console.error('Failed to set projection:', error);
        }
      }
    };

    mapInstance.on('zoom', handleProjectionSwitch);
    mapInstance.on('zoomend', handleProjectionSwitch);
    mapInstance.on('styledata', handleProjectionSwitch);

    mapRef.current = mapInstance;
    setMap(mapInstance);

    return () => {
      mapInstance.remove();
      mapRef.current = null;
      setMap(null);
      setIsLoaded(false);
    };
  }, [containerRef]);

  // ── Sidebar-aware element positioning ─────────────────────────────────────

  useEffect(() => {
    if (!map || !isLoaded) return;

    const adjustMapElements = () => {
      const mapContainer = containerRef.current;
      if (!mapContainer) return;

      const { left: leftW, right: rightW } = computeSidebarWidths();

      // Shift the bottom-right controls inward to avoid overlap with sidebars
      let translateControls = 'translateX(0)';
      if (showLeft && showRight) {
        translateControls = `translateX(-${rightW}px)`;
      } else if (showLeft) {
        translateControls = `translateX(-${leftW / 2}px)`;
      } else if (showRight) {
        translateControls = `translateX(-${rightW / 2}px)`;
      }

      // Shift the bottom-left logo to the right to avoid overlap with the left sidebar
      let translateLogo = 'translateX(0)';
      if (showLeft && showRight) {
        translateLogo = `translateX(${leftW}px)`;
      } else if (showLeft) {
        translateLogo = `translateX(${leftW / 2}px)`;
      } else if (showRight) {
        translateLogo = `translateX(${rightW / 2}px)`;
      }

      const controls = mapContainer.querySelector('.maplibregl-ctrl-bottom-right');
      if (controls) {
        [...controls.children].forEach((child) => {
          (child as HTMLElement).style.transition = 'transform 0.3s ease-in-out';
          (child as HTMLElement).style.transform = translateControls;
        });
      }

      const logo = mapContainer.querySelector('.map-bottom-right-image');
      if (logo) {
        (logo as HTMLElement).style.transition = 'transform 0.3s ease-in-out';
        (logo as HTMLElement).style.transform = translateLogo;
      }
    };

    const debouncedAdjust = debounce(adjustMapElements, 100);
    adjustMapElements();
    window.addEventListener('resize', debouncedAdjust);
    return () => window.removeEventListener('resize', debouncedAdjust);
  }, [map, isLoaded, showLeft, showRight, containerRef]);

  // ── Layer management ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!map || !isLoaded || !layers) return;

    const updateLayers = async () => {
      // Preserve current viewport so layer updates don't reset the view
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      const currentBearing = map.getBearing();
      const currentPitch = map.getPitch();

      // Resolve any layers that only have a URL (fetch their style JSON)
      const layerKeys = (['underlay', 'data', 'baselayer', 'overlay'] as const).filter(
        (k) => !!layers[k]
      );
      const processedLayers: LayersMap = {};
      for (const key of layerKeys) {
        processedLayers[key] = await fetchLayerInfo(key, layers[key]!);
      }

      // Remove layers that are no longer in the target state
      for (const key of Object.keys(layersRef.current) as (keyof LayersMap)[]) {
        if (!processedLayers[key]) {
          removeLayerGroup(map, key, layersRef.current[key]);
          delete layersRef.current[key];
        }
      }

      // Add or update layers in render order
      for (const key of layerKeys) {
        const layerData = processedLayers[key]!;
        const existing = layersRef.current[key];
        const needsUpdate = !existing || JSON.stringify(existing) !== JSON.stringify(layerData);

        if (!needsUpdate) continue;

        // Remove the existing version before re-adding
        if (existing) removeLayerGroup(map, key, existing);

        if (!layerData.info) continue;

        try {
          // Merge top-level style properties (glyphs, sprite) if missing
          const currentStyle = map.getStyle();
          const styleUpdates: Record<string, string> = {};
          if (layerData.info.glyphs && !currentStyle.glyphs) styleUpdates.glyphs = layerData.info.glyphs;
          if (layerData.info.sprite && !currentStyle.sprite) styleUpdates.sprite = layerData.info.sprite as string;

          if (Object.keys(styleUpdates).length > 0) {
            map.setStyle({ ...currentStyle, ...styleUpdates });
            // setStyle removes all layers/sources — reset our tracking ref
            layersRef.current = {};
            await new Promise<void>((resolve) => {
              if (map.isStyleLoaded()) resolve();
              else map.once('styledata', () => resolve());
            });
          }

          // Add sources first
          for (const [sourceId, sourceConfig] of Object.entries(layerData.info.sources ?? {})) {
            const fullId = `${key}-${sourceId}`;
            if (!map.getSource(fullId)) {
              try { map.addSource(fullId, sourceConfig as maplibregl.SourceSpecification); }
              catch (e) { console.error(`Failed to add source ${fullId}:`, e); }
            }
          }

          // Add layers in the correct stack order
          for (const layer of layerData.info.layers ?? []) {
            const layerId = `${key}-${layer.id}`;
            if (map.getLayer(layerId)) {
              console.warn(`Layer ${layerId} already exists, skipping`);
              continue;
            }

            const layerConfig: StyleLayer = {
              ...layer,
              id: layerId,
              // Prefix source references so they don't collide with other groups
              source: layer.source && layerData.info.sources?.[layer.source]
                ? `${key}-${layer.source}`
                : layer.source,
            };

            const beforeId = findInsertionPoint(map, key, layerKeys, layersRef.current);
            try { map.addLayer(layerConfig as maplibregl.AddLayerObject, beforeId ?? undefined); }
            catch (e) { console.error(`Failed to add layer ${layerId}:`, e, layerConfig); }
          }

          layersRef.current[key] = layerData;
        } catch (error) {
          console.error(`Failed to update layer group "${key}":`, error);
        }
      }

      // Restore the viewport after all layer changes
      map.jumpTo({ center: currentCenter, zoom: currentZoom, bearing: currentBearing, pitch: currentPitch });
    };

    updateLayers();
  }, [layers, map, isLoaded, fetchLayerInfo]);

  // ── Window event panning ───────────────────────────────────────────────────

  useEffect(() => {
    if (!map) return;

    const handlePanEvent = async (event: Event) => {
      const detail = (event as CustomEvent<PanEventDetail>).detail;
      try {
        if (detail.bounds) {
          await new Promise<void>((resolve) => {
            let done = false;
            const timeout = setTimeout(() => { if (!done) { done = true; resolve(); } }, 5000);
            map.fitBounds(detail.bounds!, { padding: 40, duration: 2000 });
            map.once('moveend', () => { if (!done) { done = true; clearTimeout(timeout); resolve(); } });
          });
        } else if (detail.center && detail.zoom != null) {
          await new Promise<void>((resolve) => {
            let done = false;
            const timeout = setTimeout(() => { if (!done) { done = true; resolve(); } }, 3000);
            map.flyTo({ center: detail.center!, zoom: detail.zoom!, duration: 1500 });
            map.once('moveend', () => { if (!done) { done = true; clearTimeout(timeout); resolve(); } });
          });
        }
      } catch (error) {
        console.error('Panning operation failed:', error);
      }
    };

    // Debounce prevents rapid-fire events from stacking up
    const debouncedHandler = debounce(handlePanEvent as (...args: unknown[]) => void, 100);

    const PAN_EVENTS = ['panToRegion', 'panToSubregion', 'panToCountry', 'panToAdm1', 'panToDefault', 'panToDataset'];
    PAN_EVENTS.forEach((e) => window.addEventListener(e, debouncedHandler));
    return () => PAN_EVENTS.forEach((e) => window.removeEventListener(e, debouncedHandler));
  }, [map]);

  // ── Map error suppression (non-fatal tile errors etc.) ─────────────────────

  useEffect(() => {
    if (!map) return;
    const warn = (e: unknown) => console.warn('Map error (non-fatal):', e);
    map.on('error', warn);
    map.on('sourceerror', warn);
    return () => { map.off('error', warn); map.off('sourceerror', warn); };
  }, [map]);

  // ── Dataset layer sync ─────────────────────────────────────────────────────

  useUpdateMapOnDatasetChange(mapRef, data, setLayers);

  return { map, isLoaded };
};

export default useMap;

// ─── Private helpers ───────────────────────────────────────────────────────────

/** Removes all MapLibre layers and sources that belong to `layerGroup`. */
function removeLayerGroup(
  map: maplibregl.Map,
  key: string,
  layerData: MapLayer | undefined
): void {
  if (!layerData?.info) return;

  // Remove layers in reverse order (top → bottom)
  for (const layer of [...(layerData.info.layers ?? [])].reverse()) {
    const id = `${key}-${layer.id}`;
    if (map.getLayer(id)) {
      try { map.removeLayer(id); }
      catch (e) { console.warn(`Failed to remove layer ${id}:`, e); }
    }
  }

  for (const sourceId of Object.keys(layerData.info.sources ?? {})) {
    const id = `${key}-${sourceId}`;
    if (map.getSource(id)) {
      try { map.removeSource(id); }
      catch (e) { console.warn(`Failed to remove source ${id}:`, e); }
    }
  }
}

/**
 * Returns the MapLibre layer ID before which a new layer should be inserted,
 * so the render order underlay → data → baselayer → overlay is maintained.
 * Returns null to append at the top.
 */
function findInsertionPoint(
  map: maplibregl.Map,
  key: string,
  layerKeys: readonly string[],
  layersSnapshot: LayersMap
): string | null {
  if (key === 'overlay') return null; // Always on top

  if (key === 'baselayer') {
    // Insert below any existing overlay layers
    const overlayLayers = map.getStyle().layers.filter((l) => l.id.startsWith('overlay-'));
    return overlayLayers.length > 0 ? overlayLayers[0].id : null;
  }

  // For underlay/data: insert before the first layer of the next group
  const currentIndex = layerKeys.indexOf(key);
  for (let i = currentIndex + 1; i < layerKeys.length; i++) {
    const nextKey = layerKeys[i] as keyof LayersMap;
    const nextLayers = layersSnapshot[nextKey]?.info?.layers;
    if (nextLayers?.length) {
      const candidateId = `${nextKey}-${nextLayers[0].id}`;
      if (map.getLayer(candidateId)) return candidateId;
    }
  }

  return null;
}
