import { useState, useEffect } from 'react';

export const useDetailedData = (datasetKey, dataset, setData) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!datasetKey || !dataset) return;
    
    // Check if detailed data is already loaded
    if (dataset.whole || dataset.country || dataset['adm1-zone']) {
      return;
    }
    
    const loadDetailedData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
        const PATH_RESULTS = `${BUCKET_URL}/data_outputs/raster_analysis`;
        
        const response = await fetch(`${PATH_RESULTS}/results_${datasetKey}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load detailed data: ${response.statusText}`);
        }
        
        const detailedData = await response.json();
        
        // Update the data in context
        setData(prevData => ({
          ...prevData,
          [datasetKey]: {
            ...prevData[datasetKey],
            ...detailedData
          }
        }));
        
      } catch (err) {
        console.error('Error loading detailed data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadDetailedData();
  }, [datasetKey, dataset, setData]);

  return { loading, error };
};
