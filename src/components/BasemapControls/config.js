import ElevationColorBar from '../ElevationColorBar';
import ColorBar from '../ColorBar';
import LandUseLegend from '../LandUseLegend';
import EcoregionLegend from '../EcoregionLegend';
import { PATH_STYLES } from '../../constants/mapConfig';

export const UNDERLAYS = {
  STREET: {
    label: 'Street map',
    value: `${PATH_STYLES}/positron_english_underlay.json`,
    source: {
      text: ['OpenStreetMap', 'OpenFreeMap'],
      url: ['https://www.openstreetmap.org', 'https://openfreemap.org/']
    }
  },
  SATELLITE: {
    label: 'Satellite imagery',
    value: `${PATH_STYLES}/esri_world_imagery.json`,
    legend: null,
    source: {
      text: ['Esri World Imagery'],
      url: ['https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9']
    }
  },
  ALTITUDE: {
    label: 'Elevation',
    value: `${PATH_STYLES}/mapzen_elevation_and_hillshade.json`,
    legend: ElevationColorBar,
    source: {
      text: ['Mapzen Elevation Data'],
      url: ['https://github.com/tilezen/joerd/blob/master/docs/data-sources.md'],
      additional_attribution_text: "Mapzen\n\n• ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards 1043681, 1559691, and 1542736;\n• Australia terrain data © Commonwealth of Australia (Geoscience Australia) 2017;\n• Austria terrain data © offene Daten Österreichs – Digitales Geländemodell (DGM) Österreich;\n• Canada terrain data contains information licensed under the Open Government Licence – Canada;\n• Europe terrain data produced using Copernicus data and information funded by the European Union - EU-DEM layers;\n• Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration;\n• Mexico terrain data source: INEGI, Continental relief, 2016;\n• New Zealand terrain data Copyright 2011 Crown copyright (c) Land Information New Zealand and the New Zealand Government (All rights reserved);\n• Norway terrain data © Kartverket;\n• United Kingdom terrain data © Environment Agency copyright and/or database right 2015. All rights reserved;\n• United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey."
    }
  },
  POPULATION: {
    label: 'Population density',
    value: `${PATH_STYLES}/worldpop.json`,
    legend: ColorBar,
    source: {
      text: ['WorldPop'],
      url: ['https://www.worldpop.org/']
    }
  },
  LAND_USE: {
    label: 'Land cover',
    value: `${PATH_STYLES}/landcover.json`,
    legend: LandUseLegend,
    source: {
      text: ['Copernicus Land Monitoring Service'],
      url: ['https://doi.org/10.2909/c6377c6e-76cc-4d03-8330-628a03693042']
    }

  },
  ECOREGIONS: {
    label: 'Ecoregions',
    value: `${PATH_STYLES}/ecoregions.json`,
    legend: EcoregionLegend,
    source: {
      text: ['Dinerstein et al. (2017)'],
      url: ['https://doi.org/10.1093/biosci/bix014']
    }
  }
};

export const OVERLAYS = {
  NONE: {
    label: 'No overlay',
    value: null
  },
  PROTECTED_AREAS: {
    label: 'Protected areas',
    value: `${PATH_STYLES}/wdpa.json`,
    source: {
      text: ['World Database on Protected Areas (WDPA)'],
      url: ['http://protectedplanet.net/']
    }
  }
};
