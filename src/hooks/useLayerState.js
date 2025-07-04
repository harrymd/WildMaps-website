import { useState } from 'react';
import { PATH_STYLES } from '../constants/mapConfig';

export function useLayerState(layers, setLayers) {
  const [hiddenDataLayer, setHiddenDataLayer] = useState(null);
  const [hiddenOverlayLayer, setHiddenOverlayLayer] = useState(null);

  const currentBaselayer = layers.baselayer?.url || null;
  const isDataLayerVisible = !!layers.data;
  const isOverlayLayerVisible = !!layers.overlay;

  const handleOverlayChange = (overlayValue) => {
    setLayers((prev) => {
      const newLayers = { ...prev };
      
      if (overlayValue === null) {
        delete newLayers.baselayer;
      } else {
        newLayers.baselayer = { url: overlayValue };
      }
      
      return newLayers;
    });
  };

  const handleDataLayerToggle = () => {
    if (isDataLayerVisible) {
      setHiddenDataLayer(layers.data);
      setLayers((prev) => {
        const newLayers = { ...prev };
        delete newLayers.data;
        return newLayers;
      });
    } else if (hiddenDataLayer) {
      setLayers((prev) => ({
        ...prev,
        data: hiddenDataLayer
      }));
    }
  };

  const handleOverlayLayerToggle = () => {
    if (isOverlayLayerVisible) {
      setHiddenOverlayLayer(layers.overlay);
      setLayers((prev) => {
        const newLayers = { ...prev };
        delete newLayers.overlay;
        return newLayers;
      });
    } else {
      const overlayToRestore = hiddenOverlayLayer || {
        url: `${PATH_STYLES}/positron_overlay.json`
      };
      setLayers((prev) => ({
        ...prev,
        overlay: overlayToRestore
      }));
    }
  };

  return {
    currentBaselayer,
    isDataLayerVisible,
    isOverlayLayerVisible,
    handleOverlayChange,
    handleDataLayerToggle,
    handleOverlayLayerToggle
  };
}
