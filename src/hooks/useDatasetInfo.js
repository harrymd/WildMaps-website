import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function useDatasetInfo() {
  const [searchParams] = useSearchParams();
  const datasetKey = searchParams.get('datasetKey');
  const { data } = useAppContext();
  
  const maxVal = datasetKey && data[datasetKey] ? (() => {
    const dataset = data[datasetKey];
    const scaleFactor = dataset['scale_factor'];
    
    return scaleFactor ?
      (dataset['raster_summary']['99pc'] / scaleFactor) :
      dataset['raster_summary']['99pc'];
  })() : null;
  
  return { datasetKey, maxVal };
}
