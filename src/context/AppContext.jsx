import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [datasetKey, setDatasetKey] = useState(null);
  const [adm0Key, setAdm0Key] = useState(null);
  const [adm1Key, setAdm1Key] = useState(null);

  useEffect(() => {
    fetch('/results.json')
      .then((res) => res.json())
      .then((dataset) => {
        //const transformed = {};
        //for (const key in dataset) {
        //  const { species, study_area, source_text } = dataset[key];
        //  transformed[key] = { species, study_area, source_text };
        //}
        //setData({ raw: dataset, summary: transformed });
        setData(dataset);
      });
  }, []);

  return (
    <AppContext.Provider value={{ data, datasetKey, setDatasetKey, adm0Key, setAdm0Key, adm1Key, setAdm1Key }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
