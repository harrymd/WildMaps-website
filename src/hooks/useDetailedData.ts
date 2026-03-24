import { useState, useEffect } from 'react';
import type { Dataset, DatasetMap } from '../types';

const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
const PATH_RESULTS = `${BUCKET_URL}/data_outputs/raster_analysis`;

export interface DetailedDataState {
  loading: boolean;
  error: string | null;
}

/**
 * Lazy-loads per-dataset detail JSON from S3 and merges it into the global
 * data context. Does nothing if the detail has already been fetched
 * (detected by the presence of the `whole`, `country`, or `adm1-zone` fields).
 */
export const useDetailedData = (
  datasetKey: string | null,
  dataset: Dataset | undefined,
  setData: React.Dispatch<React.SetStateAction<DatasetMap>>
): DetailedDataState => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!datasetKey || !dataset) return;

    // Skip if detail data is already present
    if (dataset.whole || dataset.country || dataset['adm1-zone']) return;

    const loadDetailedData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${PATH_RESULTS}/results_${datasetKey}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load detailed data: ${response.statusText}`);
        }

        const detailedData: Partial<Dataset> = await response.json();

        // Merge detail fields into the existing dataset entry
        setData((prevData) => ({
          ...prevData,
          [datasetKey]: { ...prevData[datasetKey], ...detailedData },
        }));
      } catch (err) {
        console.error('Error loading detailed data:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadDetailedData();
  }, [datasetKey, dataset, setData]);

  return { loading, error };
};
