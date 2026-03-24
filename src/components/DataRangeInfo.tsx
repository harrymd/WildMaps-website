import { useDatasetInfo } from '../hooks/useDatasetInfo';
import { useAppContext } from '../context/AppContext';

const SUITABILITY_COLORS = ['#472d7b', '#2c728e', '#28ae80', '#addc30'];
const SUITABILITY_CLASSES = ['Low', 'Low-medium', 'Medium-high', 'High'];

/**
 * Displays the value range and suitability-class thresholds for the active
 * dataset. Renders nothing when no dataset is selected.
 */
const DataRangeInfo = () => {
  const { datasetKey } = useDatasetInfo();
  const { data } = useAppContext();

  if (!datasetKey || !data[datasetKey]) return null;

  const dataset = data[datasetKey];
  const scaleFactor = dataset.scale_factor;
  const maxValue = dataset.raster_summary.max;
  const percentile99 = dataset.raster_summary['99pc'];

  // Apply the scale factor (if present) to convert raw integer values to floats
  const displayMax = scaleFactor ? maxValue / scaleFactor : maxValue;
  const display99 = scaleFactor ? percentile99 / scaleFactor : percentile99;

  const threshold25 = display99 * 0.25;
  const threshold50 = display99 * 0.5;
  const threshold75 = display99 * 0.75;

  return (
    <div className="mb-4">
      <p>
        The data ranges from 0 to {displayMax.toFixed(3)} and the 99<sup>th</sup> percentile of
        the data is {display99.toFixed(3)}. The habitat suitability is divided into four classes:
      </p>
      <ul className="my-2 ml-4">
        {SUITABILITY_CLASSES.slice().reverse().map((cls, index) => (
          <li key={index} className="flex items-center mb-1">
            <div
              className="w-4 h-4 mr-2 rounded-sm"
              style={{ backgroundColor: SUITABILITY_COLORS.slice().reverse()[index] }}
            />
            {cls}
          </li>
        ))}
      </ul>
      <p>
        The thresholds between these classes are set as 25%, 50% and 75% of the 99<sup>th</sup>{' '}
        percentile value, in this case {threshold25.toFixed(3)}, {threshold50.toFixed(3)} and{' '}
        {threshold75.toFixed(3)}.
      </p>
    </div>
  );
};

export default DataRangeInfo;
