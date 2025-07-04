import ElevationColorBar from '../ElevationColorBar';
import ColorBar from '../ColorBar';
import LandUseLegend from '../LandUseLegend';
import EcoregionLegend from '../EcoregionLegend';
import { PATH_STYLES } from '../../constants/mapConfig';

export const UNDERLAYS = {
  STREET: {
    label: 'Street map',
    value: `${PATH_STYLES}/positron_english_underlay.json`,
    legend: null
  },
  SATELLITE: {
    label: 'Satellite imagery',
    value: `${PATH_STYLES}/esri_world_imagery.json`,
    legend: null
  },
  ALTITUDE: {
    label: 'Elevation',
    value: `${PATH_STYLES}/mapzen_elevation_and_hillshade.json`,
    legend: ElevationColorBar
  },
  POPULATION: {
    label: 'Population density',
    value: `${PATH_STYLES}/worldpop.json`,
    legend: ColorBar
  },
  LAND_USE: {
    label: 'Land cover',
    value: `${PATH_STYLES}/landcover.json`,
    legend: LandUseLegend
  },
  ECOREGIONS: {
    label: 'Ecoregions',
    value: `${PATH_STYLES}/ecoregions.json`,
    legend: EcoregionLegend
  }
};

export const OVERLAYS = {
  NONE: {
    label: 'No overlay',
    value: null
  },
  PROTECTED_AREAS: {
    label: 'Protected areas',
    value: `${PATH_STYLES}/wdpa.json`
  }
};
