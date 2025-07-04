import React from 'react';
import { useDatasetInfo } from '../hooks/useDatasetInfo';
import { useAppContext } from '../context/AppContext';

const DataRangeInfo = () => {
  const { datasetKey } = useDatasetInfo();
  const { data } = useAppContext();
  
  if (!datasetKey || !data[datasetKey]) {
    return null;
  }
  
  const dataset = data[datasetKey];
  const scaleFactor = dataset['scale_factor'];
  const maxValue = dataset['raster_summary']['max'];
  
  const displayMaxValue = scaleFactor ? 
    (maxValue / scaleFactor) : 
    maxValue;
  
  const percentile99 = dataset['raster_summary']['99pc'];
  const display99thPercentile = scaleFactor ? 
    (percentile99 / scaleFactor) : 
    percentile99;
  
  const threshold25 = display99thPercentile * 0.25;
  const threshold50 = display99thPercentile * 0.5;
  const threshold75 = display99thPercentile * 0.75;
  
  const customColors = ['#472d7b', '#2c728e', '#28ae80', '#addc30'];
  const classes = ['Low', 'Low-medium', 'Medium-high', 'High'];
  
  return (
    <div className="mb-4">
      <p>
        The data ranges from 0 to {displayMaxValue.toFixed(3)} and the 99<sup>th</sup> percentile of the data is {display99thPercentile.toFixed(2)}. 
        The habitat suitability is divided into four classes:
      </p>
      <ul className="my-2 ml-4">
        {classes.slice().reverse().map((className, index) => (
          <li key={index} className="flex items-center mb-1">
            <div 
              className="w-4 h-4 mr-2 rounded-sm"
              style={{ backgroundColor: customColors.slice().reverse()[index] }}
            ></div>
            {className}
          </li>
        ))}
      </ul>
      <p>
        The thresholds between these classes are set as 25%, 50% and 75% of the 99<sup>th</sup> percentile value, 
        in this case {threshold25.toFixed(3)}, {threshold50.toFixed(3)} and {threshold75.toFixed(3)}.
      </p>
    </div>
  );
};

export default DataRangeInfo;
