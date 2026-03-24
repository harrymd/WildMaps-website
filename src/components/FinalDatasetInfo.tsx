import { useFilterState } from '../hooks/useFilterState';
import { useAppContext } from '../context/AppContext';

interface FinalDatasetInfoProps {
  className?: string;
}

/** Data access section: download link and contact email for the selected dataset. */
const FinalDatasetInfo = ({ className = '' }: FinalDatasetInfoProps) => {
  const { getAllParams } = useFilterState();
  const { data } = useAppContext();
  const allParams = getAllParams();

  const entry = allParams.datasetKey ? data[allParams.datasetKey] : undefined;

  const download_link   = entry?.download_link   ?? 'none';
  const source_contact  = entry?.source_contact  ?? 'none';

  return (
    <div className={`mb-4 ${className}`}>
      <div className="text-sm text-gray-800 leading-relaxed">
        <h3 className="text-lg font-semibold mb-2">Data access</h3>
        <p>
          {download_link === 'none' ? (
            <>A link to download the source data has not been added yet.{' '}</>
          ) : (
            <>
              The data can be downloaded{' '}
              <a href={download_link} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:text-blue-800 underline">
                here
              </a>.{' '}
            </>
          )}
          {source_contact === 'none' ? (
            'Contact details have not yet been added for this dataset.'
          ) : (
            <>
              For more information, contact{' '}
              <a href={`mailto:${source_contact}`}
                 className="text-blue-600 hover:text-blue-800 underline">
                {source_contact}
              </a>.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default FinalDatasetInfo;
