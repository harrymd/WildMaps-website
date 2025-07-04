const SelectionPath = ({ allParams, dataset }) => (
  <div className="mb-6 p-4 bg-gray-50 rounded">
    <h3 className="text-lg font-semibold mb-2">Your Selection Path:</h3>
    <ul className="space-y-1">
      {allParams.superspecies && (
        <li><strong>Taxon:</strong> {allParams.superspecies}</li>
      )}
      {allParams.region && (
        <li><strong>Region:</strong> {allParams.region}</li>
      )}
      {allParams.subregion && (
        <li><strong>Sub-region:</strong> {allParams.subregion}</li>
      )}
      {allParams.datasetKey && (
        <li><strong>Dataset:</strong> {(dataset?.source_text || 'Unknown') + ' - ' + (dataset?.common_name || 'Unknown species')}</li>
      )}
    </ul>
  </div>
);

export default SelectionPath
