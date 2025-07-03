import { useAppContext } from '../context/AppContext';
import CategoricalLegend from './CategoricalLegend';
import { useMemo } from 'react';

const LandUseLegend = () => {
  const { landUseColorSchemeData } = useAppContext();
  
  // Transform the data to combine code and definition
  const transformedData = useMemo(() => {
    if (!landUseColorSchemeData || Object.keys(landUseColorSchemeData).length === 0) {
      return {};
    }
    
    const transformed = {};
    
    Object.entries(landUseColorSchemeData).forEach(([key, item]) => {
      transformed[key] = {
        ...item,
        // Combine code and definition
        combinedDefinition: `UN LCC code ${key}. Description: ${item.definition || 'No description available'}`
      };
    });
    
    return transformed;
  }, [landUseColorSchemeData]);
  
  if (!landUseColorSchemeData || Object.keys(landUseColorSchemeData).length === 0) {
    return <div>Loading legend...</div>;
  }
  
  return (
    <div className="p-0">
      <CategoricalLegend
        data={transformedData}
        labelKey="lc_class"
        colorKeys={{ r: 'r', g: 'g', b: 'b' }}
        detailKey="combinedDefinition"
        title="Land cover"
        className="max-w-sm"
      />
    </div>
  );
};

export default LandUseLegend;
