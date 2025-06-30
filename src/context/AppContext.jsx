// context/AppContext.jsx
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
  //const [datasetKey, setDatasetKey] = useState(null);
  //const [adm0Key, setAdm0Key] = useState(null);
  //const [adm1Key, setAdm1Key] = useState(null);

  // Load the data about the administrative boundaries
  useEffect(() => {
    fetch('/adm_bdry_info.json')
      .then((res) => res.json())
      .then((dataset) => {
        setAdmData(dataset);
      });
  }, []);

  // Load the species CSV data (step 1)
  useEffect(() => {
    fetch('/species_dictionary.csv') 
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Convert array to object with common_name as key
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
    fetch('/superspecies_dictionary.csv') 
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Convert array to object with superspecies as key
            const superSpeciesMap = {};
            results.data.forEach((row) => {
              if (row.superspecies) {
                superSpeciesMap[row.superspecies] = {
                  description: row.description || '',
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
    fetch('/UN_geoscheme_bounding_boxes_tweaked.csv') 
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Convert array to object with region name as key
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
    fetch('/subregion_dictionary.csv') 
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Convert array to object with subregion name as key
            const subregionMap = {};
            results.data.forEach((row) => {
              if (row.subregion) {
                subregionMap[row.subregion] = {
                  // Add any other subregion attributes here if they exist in the CSV
                  name: row.subregion
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
    // Wait until all CSV files are loaded
    if (Object.keys(speciesData).length === 0 || 
        Object.keys(superSpeciesData).length === 0 || 
        Object.keys(regionData).length === 0 ||
        Object.keys(subregionData).length === 0) {
      return;
    }

    fetch('/results.json')
      .then((res) => res.json())
      .then((dataset) => {
        console.log('Starting multi-step enrichment...');
        
        // Step 1: Enrich with species data (common_name -> superspecies, scientific_name)
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
  }, [speciesData, superSpeciesData, regionData, subregionData]); // Run when all CSV datasets are ready

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
    //datasetKey,
    //setDatasetKey,
    //adm0Key,
    //setAdm0Key,
    //adm1Key,
    //setAdm1Key,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
