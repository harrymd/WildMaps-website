import Sidebar from '../Sidebar';
import UnderlaySection from './UnderlaySection';
import OverlaySection from './OverlaySection';
import DataLayerSection from './DataLayerSection';
import LabelsRoadsSection from './LabelsRoadsSection';
import { useDatasetInfo } from '../../hooks/useDatasetInfo';
import { useLayerState } from '../../hooks/useLayerState';
import type { LayersMap } from '../../types';

interface BasemapControlsProps {
  isOpen: boolean;
  onClose: () => void;
  layers: LayersMap;
  setLayers: React.Dispatch<React.SetStateAction<LayersMap>>;
  width: string;
  className?: string;
}

/** Right-hand sidebar containing all basemap and data-layer controls. */
export default function BasemapControls({
  isOpen,
  onClose,
  layers,
  setLayers,
  width,
  className = '',
}: BasemapControlsProps) {
  const { datasetKey, maxVal } = useDatasetInfo();
  const {
    currentBaselayer,
    isDataLayerVisible,
    isOverlayLayerVisible,
    handleOverlayChange,
    handleDataLayerToggle,
    handleOverlayLayerToggle,
  } = useLayerState(layers, setLayers);

  return (
    <Sidebar
      title="Basemap controls"
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width={width}
      className={className}
    >
      <div className="p-2 pr-4 space-y-6 overflow-y-auto h-[calc(100vh-100px)]">
        <UnderlaySection layers={layers} setLayers={setLayers} />
        <OverlaySection currentBaselayer={currentBaselayer} handleOverlayChange={handleOverlayChange} />
        <DataLayerSection
          datasetKey={datasetKey}
          maxVal={maxVal}
          isDataLayerVisible={isDataLayerVisible}
          handleDataLayerToggle={handleDataLayerToggle}
        />
        <LabelsRoadsSection
          isOverlayLayerVisible={isOverlayLayerVisible}
          handleOverlayLayerToggle={handleOverlayLayerToggle}
        />
      </div>
    </Sidebar>
  );
}
