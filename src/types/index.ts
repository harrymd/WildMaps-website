// ─── S3 data types ────────────────────────────────────────────────────────────

/** Statistical summary stored alongside each raster dataset. */
export interface RasterSummary {
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  max: number;
  /** 99th-percentile value — used as the colour-scale ceiling. */
  '99pc': number;
}

/** Per-bin area statistics for a single geographic scope. */
export interface DataSubset {
  area_km2_by_bin_in_PA: number[];
  area_km2_by_bin_not_in_PA: number[];
  /** Keys are land-use codes; values are per-bin area arrays. */
  area_km2_by_landuse_and_bin: Record<string, number[]>;
}

/**
 * One dataset entry, as served by results_summary.json and enriched by AppContext.
 * Lazy-loaded detail fields (whole, country, adm1-zone) are optional.
 */
export interface Dataset {
  // ── From S3 ──
  string_id: string;
  common_name: string;
  source_text?: string;
  source_link?: string;
  download_link?: string;
  source_contact?: string;
  /** Semicolon-separated region string (raw from S3). */
  region?: string;
  /** Semicolon-separated subregion string (raw from S3). */
  subregion?: string;
  folder: string;
  max_zoom: number;
  scale_factor?: number;
  raster_summary: RasterSummary;
  adm0_list?: string[];
  adm1_list?: string[];
  // ── Enriched by AppContext ──
  dataset_id: string;
  superspecies: string;
  scientific_name: string;
  /** Parsed from the `region` string. */
  regions: string[];
  /** Parsed from the `subregion` string. */
  subregions: string[];
  superspecies_description: string;
  // ── Lazy-loaded on FinalScreen ──
  whole?: { whole: DataSubset };
  country?: Record<string, DataSubset>;
  'adm1-zone'?: Record<string, DataSubset>;
}

export type DatasetMap = Record<string, Dataset>;

// ─── Dictionary / lookup types ────────────────────────────────────────────────

/** Row from species_dictionary.csv. */
export interface SpeciesInfo {
  superspecies: string;
  scientific_name: string;
}

/** Row from superspecies_dictionary.csv. */
export interface SuperSpeciesInfo {
  scientific_name: string;
  common_name: string;
  emoji: string;
  description?: string;
}

/** Row from region_dictionary.csv. */
export interface RegionInfo {
  bbox: [number, number, number, number];
}

/** Row from subregion_dictionary.csv. */
export interface SubregionInfo {
  name: string;
  region: string;
  bbox: [number, number, number, number];
}

/** One entry in adm_bdry_info.json for a country or first-level subdivision. */
export interface AdmBoundaryInfo {
  name: string;
  bbox: [number, number, number, number];
  is_disputed?: string;
}

/** Shape of the full adm_bdry_info.json payload. */
export interface AdmData {
  adm0: Record<string, AdmBoundaryInfo>;
  adm1: Record<string, AdmBoundaryInfo>;
}

/** One row from un_lcc_color_scheme.csv. */
export interface LandUseColorEntry {
  un_level: string | number;
  lc_class: string;
  definition: string;
  r: number | string;
  g: number | string;
  b: number | string;
}

// ─── Map layer types ───────────────────────────────────────────────────────────

/** A MapLibre source config (raster, vector, etc.). */
export interface LayerSource {
  type: string;
  tiles?: string[];
  tileSize?: number;
  bounds?: [number, number, number, number];
  minzoom?: number;
  maxzoom?: number;
  [key: string]: unknown;
}

/** A single MapLibre layer spec (subset of the full GL spec). */
export interface StyleLayer {
  id: string;
  type: string;
  source?: string;
  'source-layer'?: string;
  [key: string]: unknown;
}

/** Parsed content of a MapLibre style JSON, as used by useMap. */
export interface LayerInfo {
  sources?: Record<string, LayerSource>;
  layers?: StyleLayer[];
  glyphs?: string;
  sprite?: string;
}

/** One entry in the layers map — either a URL to fetch or inline info. */
export interface MapLayer {
  url?: string;
  info?: LayerInfo;
}

/**
 * The named layer slots managed by useMap.
 * Rendered in order: underlay → data → baselayer → overlay.
 */
export interface LayersMap {
  underlay?: MapLayer;
  data?: MapLayer;
  baselayer?: MapLayer;
  overlay?: MapLayer;
}

// ─── Chart data types ──────────────────────────────────────────────────────────

/**
 * One row for the D3 stacked bar chart.
 * Contains a label plus one numeric field per suitability bin.
 */
export interface ChartDataEntry {
  label: string;
  Low: number;
  'Low-med': number;
  'High-med': number;
  High: number;
  /** Index signature required for compatibility with BarChartDataEntry. */
  [key: string]: string | number;
}

// ─── Context types ─────────────────────────────────────────────────────────────

export interface AppContextValue {
  data: DatasetMap;
  setData: React.Dispatch<React.SetStateAction<DatasetMap>>;
  admData: AdmData | Record<string, never>;
  setAdmData: React.Dispatch<React.SetStateAction<AdmData | Record<string, never>>>;
  superSpeciesData: Record<string, SuperSpeciesInfo>;
  setSuperSpeciesData: React.Dispatch<React.SetStateAction<Record<string, SuperSpeciesInfo>>>;
  speciesData: Record<string, SpeciesInfo>;
  setSpeciesData: React.Dispatch<React.SetStateAction<Record<string, SpeciesInfo>>>;
  regionData: Record<string, RegionInfo>;
  setRegionData: React.Dispatch<React.SetStateAction<Record<string, RegionInfo>>>;
  subregionData: Record<string, SubregionInfo>;
  setSubregionData: React.Dispatch<React.SetStateAction<Record<string, SubregionInfo>>>;
  landUseColorSchemeData: Record<string, LandUseColorEntry>;
  setLandUseColorSchemeData: React.Dispatch<React.SetStateAction<Record<string, LandUseColorEntry>>>;
  studyMetadataDictionary: StudyMetadataDictionaryEntry[];
  setStudyMetadataDictionary: React.Dispatch<React.SetStateAction<StudyMetadataDictionaryEntry[]>>;
  studyMetadataCatalog: StudyMetadataCatalog;
  setStudyMetadataCatalog: React.Dispatch<React.SetStateAction<StudyMetadataCatalog>>;
}

// ─── Study metadata types ──────────────────────────────────────────────────────

/** One row from study_metadata_dictionary.csv (tab-separated). */
export interface StudyMetadataDictionaryEntry {
  metadata_key: string;
  section_name: string;
  metadata_name: string;
}

/**
 * Parsed study_metadata_catalog.csv.
 * Outer key: dataset_id (string). Inner key: metadata_key. Value: raw string from CSV.
 */
export type StudyMetadataCatalog = Record<string, Record<string, string>>;

// ─── Navigation types ──────────────────────────────────────────────────────────

/** The two supported workflow orderings. */
export type StartingFilter = 'region' | 'superspecies';

// ─── Select component types ────────────────────────────────────────────────────

/** A single option displayed in GeneralSelectComponent. */
export interface SelectOption {
  value: string;
  /** Each cell maps to one column header. */
  cells: (string | React.ReactNode)[];
}

// ─── Location selection types ──────────────────────────────────────────────────

export interface LocationOption {
  value: string;
  label: string;
}
