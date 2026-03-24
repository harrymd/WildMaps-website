import { useState } from 'react';
import { PATH_STYLES } from '../constants/mapConfig';
import type { LayersMap, MapLayer } from '../types';

export interface LayerState {
  currentBaselayer: string | null;
  isDataLayerVisible: boolean;
  isOverlayLayerVisible: boolean;
  /** Switches the baselayer overlay (e.g. Protected Areas). Pass null to remove it. */
  handleOverlayChange: (overlayValue: string | null) => void;
  /** Toggles the raster data layer on/off (remembers the last layer when hidden). */
  handleDataLayerToggle: () => void;
  /** Toggles the labels/roads overlay on/off. */
  handleOverlayLayerToggle: () => void;
}

/**
 * Manages visibility state for the data layer, overlay layer, and baselayer slot.
 * Hidden layers are stored locally so they can be restored without re-fetching.
 */
export function useLayerState(
  layers: LayersMap,
  setLayers: React.Dispatch<React.SetStateAction<LayersMap>>
): LayerState {
  // Remember the last visible layer so toggling back works without re-fetching
  const [hiddenDataLayer, setHiddenDataLayer] = useState<MapLayer | null>(null);
  const [hiddenOverlayLayer, setHiddenOverlayLayer] = useState<MapLayer | null>(null);

  const currentBaselayer = layers.baselayer?.url ?? null;
  const isDataLayerVisible = !!layers.data;
  const isOverlayLayerVisible = !!layers.overlay;

  const handleOverlayChange = (overlayValue: string | null) => {
    setLayers((prev) => {
      const next = { ...prev };
      if (overlayValue === null) {
        delete next.baselayer;
      } else {
        next.baselayer = { url: overlayValue };
      }
      return next;
    });
  };

  const handleDataLayerToggle = () => {
    if (isDataLayerVisible) {
      setHiddenDataLayer(layers.data ?? null);
      setLayers((prev) => {
        const next = { ...prev };
        delete next.data;
        return next;
      });
    } else if (hiddenDataLayer) {
      setLayers((prev) => ({ ...prev, data: hiddenDataLayer }));
    }
  };

  const handleOverlayLayerToggle = () => {
    if (isOverlayLayerVisible) {
      setHiddenOverlayLayer(layers.overlay ?? null);
      setLayers((prev) => {
        const next = { ...prev };
        delete next.overlay;
        return next;
      });
    } else {
      // Fall back to the default overlay if none was stored
      const overlayToRestore = hiddenOverlayLayer ?? {
        url: `${PATH_STYLES}/positron_overlay.json`,
      };
      setLayers((prev) => ({ ...prev, overlay: overlayToRestore }));
    }
  };

  return {
    currentBaselayer,
    isDataLayerVisible,
    isOverlayLayerVisible,
    handleOverlayChange,
    handleDataLayerToggle,
    handleOverlayLayerToggle,
  };
}
