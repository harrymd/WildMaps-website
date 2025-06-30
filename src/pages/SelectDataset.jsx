import GeneralSelectComponent from '../components/GeneralSelectComponent';

const SelectDataset = () => {
  const getDatasetOptions = (allParams, data) => {
    let filteredData = data || {};
  
    // Filter by superspecies if selected
    if (allParams.superspecies) {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([key, entry]) =>
          entry.superspecies === allParams.superspecies
        )
      );
    }
  
    // Filter by region if selected
    if (allParams.region) {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([key, entry]) =>
          entry.regions && entry.regions.includes(allParams.region)
        )
      );
    }
  
    // Filter by subregion if selected
    if (allParams.subregion) {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([key, entry]) =>
          entry.subregions && entry.subregions.includes(allParams.subregion)
        )
      );
    }
  
    console.log('Filtered datasets:', Object.keys(filteredData).length, 'entries');
  
    // Return filtered datasets as table rows
    return Object.entries(filteredData).map(([key, entry]) => ({
      value: key,
      cells: [entry.common_name || 'Unknown species', entry.source_text || 'No source']
    }));
  };

  return (
    <GeneralSelectComponent
      route="/dataset"
      paramKey="datasetKey"
      title="Dataset"
      description="Click on a row to select a study (it will show on the map):"
      getOptions={getDatasetOptions}
      tableHeaders={['Species', 'Source']}
    />
  );
};

export default SelectDataset;
