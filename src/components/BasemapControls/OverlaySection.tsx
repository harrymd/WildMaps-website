import { OVERLAYS } from './config';
import SourceAttribution from '../SourceAttribution';

interface OverlaySectionProps {
  currentBaselayer: string | null;
  handleOverlayChange: (value: string | null) => void;
}

/** Radio-group for selecting an optional overlay layer (e.g. Protected Areas). */
export default function OverlaySection({ currentBaselayer, handleOverlayChange }: OverlaySectionProps) {
  return (
    <fieldset className="border-b border-gray-200 pb-4">
      <legend className="font-medium mb-2">Select an overlay layer</legend>
      <div className="flex flex-col space-y-2">
        {Object.values(OVERLAYS).map(({ label, value, legend, source }) => {
          const isSelected = currentBaselayer === value;
          const LegendComponent = legend;

          return (
            <div key={value ?? 'none'} className="space-y-0">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="overlay"
                  value={value ?? ''}
                  checked={isSelected}
                  onChange={() => handleOverlayChange(value)}
                />
                <span>{label}</span>
              </label>

              <SourceAttribution isVisible={isSelected} source={source} />

              {isSelected && LegendComponent && (
                <div className="ml-0">
                  <LegendComponent />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
