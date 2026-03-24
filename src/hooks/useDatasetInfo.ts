import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export interface DatasetInfo {
  datasetKey: string | null;
  /**
   * The 99th-percentile value divided by the scale factor, used as the
   * colour-scale ceiling. Null when no dataset is selected.
   */
  maxVal: number | null;
}

/** Derives the current dataset key and its colour-scale maximum from the URL. */
export function useDatasetInfo(): DatasetInfo {
  const [searchParams] = useSearchParams();
  const datasetKey = searchParams.get('datasetKey');
  const { data } = useAppContext();

  const maxVal = (() => {
    if (!datasetKey || !data[datasetKey]) return null;
    const dataset = data[datasetKey];
    const scaleFactor = dataset['scale_factor'];
    const raw99pc = dataset.raster_summary['99pc'];
    return scaleFactor ? raw99pc / scaleFactor : raw99pc;
  })();

  return { datasetKey, maxVal };
}
