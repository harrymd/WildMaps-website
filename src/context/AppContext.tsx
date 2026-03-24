import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { BUCKET_URL } from '../constants/mapConfig';
import type {
  AppContextValue,
  DatasetMap,
  SpeciesInfo,
  SuperSpeciesInfo,
  RegionInfo,
  SubregionInfo,
  LandUseColorEntry,
  AdmData,
} from '../types';

const AppContext = createContext<AppContextValue | null>(null);

/** Returns the app-wide context. Throws if called outside of AppProvider. */
export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
};

const PATH_DATA_OUTPUTS = `${BUCKET_URL}/data_outputs`;
const PATH_RESULTS = `${PATH_DATA_OUTPUTS}/raster_analysis`;
const PATH_DATA_INPUTS = `${BUCKET_URL}/data_inputs`;
const PATH_DICTS = `${PATH_DATA_INPUTS}/dictionaries`;

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<DatasetMap>({});
  const [admData, setAdmData] = useState<AdmData | Record<string, never>>({});
  const [superSpeciesData, setSuperSpeciesData] = useState<Record<string, SuperSpeciesInfo>>({});
  const [speciesData, setSpeciesData] = useState<Record<string, SpeciesInfo>>({});
  const [regionData, setRegionData] = useState<Record<string, RegionInfo>>({});
  const [subregionData, setSubregionData] = useState<Record<string, SubregionInfo>>({});
  const [landUseColorSchemeData, setLandUseColorSchemeData] = useState<Record<string, LandUseColorEntry>>({});

  // ── Administrative boundary data ─────────────────────────────────────────

  useEffect(() => {
    fetch(`${PATH_DATA_OUTPUTS}/adm_bdry_info.json`)
      .then((res) => res.json())
      .then((dataset: AdmData) => setAdmData(dataset))
      .catch((err) => console.error('Error loading adm boundary data:', err));
  }, []);

  // ── Species dictionary ────────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${PATH_DICTS}/species_dictionary.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse<{ common_name: string; superspecies: string; scientific_name: string }>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const map: Record<string, SpeciesInfo> = {};
            for (const row of results.data) {
              if (row.common_name) {
                map[row.common_name] = {
                  superspecies: row.superspecies ?? '',
                  scientific_name: row.scientific_name ?? '',
                };
              }
            }
            setSpeciesData(map);
          },
          error: (err: unknown) => console.error('Error parsing species CSV:', err),
        });
      })
      .catch((err) => console.error('Error loading species CSV:', err));
  }, []);

  // ── Superspecies dictionary ───────────────────────────────────────────────

  useEffect(() => {
    fetch(`${PATH_DICTS}/superspecies_dictionary.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse<{ superspecies: string; scientific_name: string; common_name: string; emoji: string }>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const map: Record<string, SuperSpeciesInfo> = {};
            for (const row of results.data) {
              if (row.superspecies) {
                map[row.superspecies] = {
                  scientific_name: row.scientific_name ?? '',
                  common_name: row.common_name ?? '',
                  emoji: row.emoji ?? '',
                };
              }
            }
            setSuperSpeciesData(map);
          },
          error: (err: unknown) => console.error('Error parsing superspecies CSV:', err),
        });
      })
      .catch((err) => console.error('Error loading superspecies CSV:', err));
  }, []);

  // ── Region bounding boxes ─────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${PATH_DICTS}/region_dictionary.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse<{ name: string; lon_min: number; lat_min: number; lon_max: number; lat_max: number }>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const map: Record<string, RegionInfo> = {};
            for (const row of results.data) {
              if (row.name) {
                map[row.name] = { bbox: [row.lon_min, row.lat_min, row.lon_max, row.lat_max] };
              }
            }
            setRegionData(map);
          },
          error: (err: unknown) => console.error('Error parsing region CSV:', err),
        });
      })
      .catch((err) => console.error('Error loading region CSV:', err));
  }, []);

  // ── Subregion dictionary ──────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${PATH_DICTS}/subregion_dictionary.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse<{ subregion: string; region: string; lon_min: number; lat_min: number; lon_max: number; lat_max: number }>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const map: Record<string, SubregionInfo> = {};
            for (const row of results.data) {
              if (row.subregion) {
                map[row.subregion] = {
                  name: row.subregion,
                  region: row.region,
                  bbox: [row.lon_min, row.lat_min, row.lon_max, row.lat_max],
                };
              }
            }
            setSubregionData(map);
          },
          error: (err: unknown) => console.error('Error parsing subregion CSV:', err),
        });
      })
      .catch((err) => console.error('Error loading subregion CSV:', err));
  }, []);

  // ── Main dataset — loaded after all dictionaries are ready ────────────────

  useEffect(() => {
    // Wait until all lookup maps are populated before enriching the dataset
    if (
      Object.keys(speciesData).length === 0 ||
      Object.keys(superSpeciesData).length === 0 ||
      Object.keys(regionData).length === 0 ||
      Object.keys(subregionData).length === 0
    ) return;

    fetch(`${PATH_RESULTS}/results_summary.json`)
      .then((res) => res.json())
      .then((rawDataset: Record<string, Partial<DatasetMap[string]>>) => {
        // Step 1: enrich with species info
        const enriched: DatasetMap = {};
        for (const [key, entry] of Object.entries(rawDataset)) {
          const speciesInfo = entry.common_name ? speciesData[entry.common_name] : undefined;
          enriched[key] = {
            ...entry,
            superspecies: speciesInfo?.superspecies ?? 'Unknown superspecies',
            scientific_name: speciesInfo?.scientific_name ?? 'Unknown scientific name',
            // Parse semicolon-separated strings into arrays
            regions: entry.region ? entry.region.split(';').map((r) => r.trim()) : [],
            subregions: entry.subregion ? entry.subregion.split(';').map((r) => r.trim()) : [],
            // Superspecies description (may be absent in current data)
            superspecies_description:
              superSpeciesData[speciesInfo?.superspecies ?? '']?.description ?? 'No description available',
          } as DatasetMap[string];
        }
        setData(enriched);
      })
      .catch((err) => console.error('Error loading main dataset:', err));
  }, [speciesData, superSpeciesData, regionData, subregionData]);

  // ── Land-use colour scheme ────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${PATH_DATA_INPUTS}/colour_ramps/un_lcc_color_scheme.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse<{ code: string; un_level: string; lc_class: string; definition: string; r: number; g: number; b: number }>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const map: Record<string, LandUseColorEntry> = {};
            for (const row of results.data) {
              if (row.code) {
                map[row.code] = {
                  un_level: row.un_level ?? '',
                  lc_class: row.lc_class ?? '',
                  definition: row.definition ?? '',
                  r: row.r ?? '',
                  g: row.g ?? '',
                  b: row.b ?? '',
                };
              }
            }
            setLandUseColorSchemeData(map);
          },
          error: (err: unknown) => console.error('Error parsing land use colour scheme CSV:', err),
        });
      })
      .catch((err) => console.error('Error loading land use colour scheme CSV:', err));
  }, []);

  const value: AppContextValue = {
    data, setData,
    admData, setAdmData,
    superSpeciesData, setSuperSpeciesData,
    speciesData, setSpeciesData,
    regionData, setRegionData,
    subregionData, setSubregionData,
    landUseColorSchemeData, setLandUseColorSchemeData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
