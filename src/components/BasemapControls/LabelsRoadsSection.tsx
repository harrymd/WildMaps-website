import ToggleSwitch from './ToggleSwitch';

interface LabelsRoadsSectionProps {
  isOverlayLayerVisible: boolean;
  handleOverlayLayerToggle: () => void;
}

/** Toggle for the labels/roads overlay layer. */
export default function LabelsRoadsSection({
  isOverlayLayerVisible,
  handleOverlayLayerToggle,
}: LabelsRoadsSectionProps) {
  return (
    <fieldset>
      <legend className="font-medium mb-2">Toggle labels and roads</legend>
      <ToggleSwitch
        label="Show labels and roads"
        isChecked={isOverlayLayerVisible}
        onChange={handleOverlayLayerToggle}
        srOnlyText="Toggle labels and roads visibility"
      />
    </fieldset>
  );
}
