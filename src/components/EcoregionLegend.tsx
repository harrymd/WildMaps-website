import { useMemo } from 'react';
import CategoricalLegend from './CategoricalLegend';

interface EcoregionLegendProps {
  className?: string;
}

/** Static legend for the ecoregions basemap layer. */
const EcoregionLegend = ({ className = '' }: EcoregionLegendProps) => {
  const ecoregionData = useMemo(() => {
    // Hex colours sourced from the Dinerstein et al. (2017) biome palette
    const rawData: Record<string, string> = {
      'Boreal Forests/Taiga':                                   '#7AB6F5',
      'Deserts & Xeric Shrublands':                             '#CC6767',
      'Flooded Grasslands & Savannas':                          '#BEE7FF',
      'Mangroves':                                              '#FE01C4',
      'Mediterranean Forests, Woodlands & Scrub':               '#FE0000',
      'Montane Grasslands & Shrublands':                        '#D6C39D',
      'Rock and Ice':                                           '#FFEAAF',
      'Temperate Broadleaf & Mixed Forests':                    '#00734C',
      'Temperate Conifer Forests':                              '#458970',
      'Temperate Grasslands, Savannas & Shrublands':            '#FEFF73',
      'Tropical & Subtropical Coniferous Forests':              '#88CE66',
      'Tropical & Subtropical Dry Broadleaf Forests':           '#CCCD65',
      'Tropical & Subtropical Grasslands, Savannas & Shrublands': '#FEAA01',
      'Tropical & Subtropical Moist Broadleaf Forests':         '#38A700',
      'Tundra':                                                 '#9ED7C2',
    };

    /** Converts a hex colour string to separate R, G, B components. */
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 0, g: 0, b: 0 };
    };

    return Object.fromEntries(
      Object.entries(rawData).map(([biome, hex]) => [
        biome,
        { name: biome, ...hexToRgb(hex) },
      ])
    );
  }, []);

  return (
    <CategoricalLegend
      data={ecoregionData}
      labelKey="name"
      colorKeys={{ r: 'r', g: 'g', b: 'b' }}
      title="Ecoregions"
      className={className}
    />
  );
};

export default EcoregionLegend;
