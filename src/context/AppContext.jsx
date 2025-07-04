import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [admData, setAdmData] = useState({});
  const [superSpeciesData, setSuperSpeciesData] = useState({});
  const [speciesData, setSpeciesData] = useState({});
  const [regionData, setRegionData] = useState({});
  const [subregionData, setSubregionData] = useState({});
  const [landUseColorSchemeData, setLandUseColorSchemeData] = useState({});

  const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
  const PATH_DATA_OUTPUTS = `${BUCKET_URL}/data_outputs`;
  const PATH_RESULTS = `${PATH_DATA_OUTPUTS}/raster_analysis`;
  const PATH_DATA_INPUTS = `${BUCKET_URL}/data_inputs`;
  const PATH_DICTS = `${PATH_DATA_INPUTS}/dictionaries`;

  // Load the data about the administrative boundaries
  useEffect(() => {
    //fetch('/adm_bdry_info.json')
    fetch(`${PATH_DATA_OUTPUTS}/adm_bdry_info.json`)
      .then((res) => res.json())
      .then((dataset) => {
        console.log(dataset);
        setAdmData(dataset);
      });
  }, []);

  // Load the species CSV data (step 1)
  useEffect(() => {
    fetch(`${PATH_DICTS}/species_dictionary.csv`) 
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const speciesMap = {};
            results.data.forEach((row) => {
              if (row.common_name) {
                speciesMap[row.common_name] = {
                  superspecies: row.superspecies || '',
                  scientific_name: row.scientific_name || ''
                };
              }
            });
            console.log('Species data loaded:', Object.keys(speciesMap).length, 'entries');
            setSpeciesData(speciesMap);
          },
          error: (error) => {
            console.error('Error parsing species CSV:', error);
          }
        });
      })
      .catch((error) => {
        console.error('Error loading species CSV:', error);
      });
  }, []);

  // Load the superspecies CSV data (step 2)
  useEffect(() => {
    fetch(`${PATH_DICTS}/superspecies_dictionary.csv`) 
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const superSpeciesMap = {};
            results.data.forEach((row) => {
              if (row.superspecies) {
                superSpeciesMap[row.superspecies] = {
                  //description: row.description || '',
                  scientific_name: row.scientific_name || '',
                  common_name: row.common_name || '',
                  emoji: row.emoji || ''
                };
              }
            });
            console.log('SuperSpecies data loaded:', Object.keys(superSpeciesMap).length, 'entries');
            setSuperSpeciesData(superSpeciesMap);
          },
          error: (error) => {
            console.error('Error parsing superspecies CSV:', error);
          }
        });
      })
      .catch((error) => {
        console.error('Error loading superspecies CSV:', error);
      });
  }, []);

  // Load the region bounding boxes CSV data (step 3)
  useEffect(() => {
    fetch(`${PATH_DICTS}/region_dictionary.csv`) 
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const regionMap = {};
            results.data.forEach((row) => {
              if (row.name) {
                regionMap[row.name] = {
                  bbox: [row.lon_min, row.lat_min, row.lon_max, row.lat_max]
                };
              }
            });
            console.log('Region data loaded:', Object.keys(regionMap).length, 'entries');
            setRegionData(regionMap);
          },
          error: (error) => {
            console.error('Error parsing region CSV:', error);
          }
        });
      })
      .catch((error) => {
        console.error('Error loading region CSV:', error);
      });
  }, []);

  // Load the subregion dictionary CSV data (step 4)
  useEffect(() => {
    fetch(`${PATH_DICTS}/subregion_dictionary.csv`) 
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const subregionMap = {};
            results.data.forEach((row) => {
              if (row.subregion) {
                subregionMap[row.subregion] = {
                  name: row.subregion,
                  region: row.region,
                  bbox: [row.lon_min, row.lat_min, row.lon_max, row.lat_max]
                };
              }
            });
            console.log('Subregion data loaded:', Object.keys(subregionMap).length, 'entries');
            setSubregionData(subregionMap);
          },
          error: (error) => {
            console.error('Error parsing subregion CSV:', error);
          }
        });
      })
      .catch((error) => {
        console.error('Error loading subregion CSV:', error);
      });
  }, []);

  // Load main dataset and do multi-step enrichment
  useEffect(() => {
    if (Object.keys(speciesData).length === 0 || 
        Object.keys(superSpeciesData).length === 0 || 
        Object.keys(regionData).length === 0 ||
        Object.keys(subregionData).length === 0) {
      return;
    }

    fetch(`${PATH_RESULTS}/results_summary.json`)
      .then((res) => res.json())
      .then((dataset) => {
        console.log('Starting multi-step enrichment...');
        
        // Step 1: Enrich with species data
        const stepOneEnriched = {};
        Object.entries(dataset).forEach(([key, entry]) => {
          const speciesInfo = speciesData[entry.common_name];
          stepOneEnriched[key] = {
            ...entry,
            superspecies: speciesInfo?.superspecies || 'Unknown superspecies',
            scientific_name: speciesInfo?.scientific_name || 'Unknown scientific name'
          };
        });

        // Step 2: Parse region and subregion strings into arrays
        const stepTwoEnriched = {};
        Object.entries(stepOneEnriched).forEach(([key, entry]) => {
          stepTwoEnriched[key] = {
            ...entry,
            regions: entry.region ? entry.region.split(';').map(r => r.trim()) : [],
            subregions: entry.subregion ? entry.subregion.split(';').map(r => r.trim()) : []
          };
        });

        // Step 3: Enrich with superspecies descriptions
        const finalEnriched = {};
        Object.entries(stepTwoEnriched).forEach(([key, entry]) => {
          finalEnriched[key] = {
            ...entry,
            superspecies_description: superSpeciesData[entry.superspecies]?.description || 'No description available'
          };
        });

        console.log('Enrichment complete. Sample entry:', Object.values(finalEnriched)[0]);
        setData(finalEnriched);
      })
      .catch((error) => {
        console.error('Error loading main dataset:', error);
      });
  }, [speciesData, superSpeciesData, regionData, subregionData]);
  //
  // Load the data about the land use colour scheme
  useEffect(() => {
    //fetch('/adm_bdry_info.json')
    fetch(`${PATH_DATA_INPUTS}/colour_ramps/un_lcc_color_scheme.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const landUseColorSchemeMap = {};
            results.data.forEach((row) => {
              if (row.code) {
                landUseColorSchemeMap[row.code] = {
                  un_level : row.un_level || '',
                  lc_class : row.lc_class || '',
                  definition : row.definition || '',
                  r : row.r || '',
                  g : row.g || '',
                  b : row.b || ''
                };
              }
            });
            console.log('Land use data loaded:', Object.keys(landUseColorSchemeMap).length, 'entries');
            setLandUseColorSchemeData(landUseColorSchemeMap);
          },
          error: (error) => {
            console.error('Error parsing land use colour scheme CSV:', error);
          }
        });
      })
      .catch((error) => {
        console.error('Error loading land use colour scheme CSV:', error);
      });
  }, []);

  const value = {
    data,
    setData,
    admData,
    setAdmData,
    superSpeciesData,
    setSuperSpeciesData,
    speciesData,
    setSpeciesData,
    regionData,
    setRegionData,
    subregionData,
    setSubregionData,
    landUseColorSchemeData,
    setLandUseColorSchemeData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
