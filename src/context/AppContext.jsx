import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [admData, setAdmData] = useState({});
  //
  const [datasetKey, setDatasetKey] = useState(null);
  const [adm0Key, setAdm0Key] = useState(null);
  const [adm1Key, setAdm1Key] = useState(null);

  // Load the data about the raster files.
  useEffect(() => {
    fetch('/results.json')
      .then((res) => res.json())
      .then((dataset) => {
        setData(dataset);
      });
  }, []);

  // Load the data about the administrative boundaries.
  useEffect(() => {
    fetch('/adm_bdry_info.json')
      .then((res) => res.json())
      .then((dataset) => {
        setAdmData(dataset);
      });
  }, []);

  return (
    <AppContext.Provider value={{ data, admData, datasetKey, setDatasetKey, adm0Key, setAdm0Key, adm1Key, setAdm1Key }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
