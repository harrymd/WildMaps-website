import type { LocationOption } from '../types';

interface LocationSelectorProps {
  adm0Key: string;
  adm1Key: string;
  adm0Options: LocationOption[];
  adm1Options: LocationOption[];
  onAdm0Change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAdm1Change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/** Dropdowns for selecting country (ADM0) and subdivision (ADM1) on the FinalScreen. */
const LocationSelector = ({
  adm0Key,
  adm1Key,
  adm0Options,
  adm1Options,
  onAdm0Change,
  onAdm1Change,
}: LocationSelectorProps) => (
  <div className="mb-6 p-4 bg-blue-50 rounded">
    <h3 className="text-lg font-semibold mb-3">Location selection</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="adm0-select" className="block text-sm font-medium mb-1">
          Country:
        </label>
        <select
          id="adm0-select"
          value={adm0Key}
          onChange={onAdm0Change}
          className="w-full p-2 border rounded-md"
        >
          {adm0Options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="adm1-select" className="block text-sm font-medium mb-1">
          Region:
        </label>
        <select
          id="adm1-select"
          value={adm1Key}
          onChange={onAdm1Change}
          disabled={adm0Key === 'all_adm0'}
          className="w-full p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {adm1Options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {adm0Key === 'all_adm0' && (
          <p className="text-sm text-gray-500 mt-1">Select a specific country to choose regions</p>
        )}
      </div>
    </div>
  </div>
);

export default LocationSelector;
