import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import CategoricalLegend from './CategoricalLegend';

/** Renders a CategoricalLegend for the land-cover colour scheme loaded in AppContext. */
const LandUseLegend = () => {
  const { landUseColorSchemeData } = useAppContext();

  // Enrich each entry with a combined tooltip string for the expand panel
  const transformedData = useMemo(() => {
    if (!landUseColorSchemeData || Object.keys(landUseColorSchemeData).length === 0) return {};

    return Object.fromEntries(
      Object.entries(landUseColorSchemeData).map(([key, item]) => [
        key,
        {
          ...item,
          combinedDefinition: `UN LCC code ${key}. Description: ${item.definition || 'No description available'}`,
        },
      ])
    );
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
