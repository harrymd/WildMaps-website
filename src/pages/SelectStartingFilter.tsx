import { useNavigate } from 'react-router-dom';
import { useDefaultMapPanning } from '../hooks/useDefaultMapPanning';
import GeneralSelectComponent from '../components/GeneralSelectComponent';

const DEFAULT_VIEW = { center: [105.0, 13] as [number, number], zoom: 2.5 };

const OPTIONS = [
  { value: 'region',       cells: ['... geographical region'] },
  { value: 'superspecies', cells: ['... animal type (taxon)'] },
];

const SurveyCallout = () => (
  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between gap-3">
    <p className="text-xs text-green-800 leading-snug">
      Have SDM data to share? Add it to this catalog.
    </p>
    <button
      onClick={() => window.open('/survey', '_blank', 'noopener,noreferrer')}
      className="flex-shrink-0 bg-green-800 hover:bg-green-700 active:bg-green-900 text-white text-xs font-medium px-3 py-1.5 rounded shadow-sm transition-colors"
    >
      Add your data
    </button>
  </div>
);

/** First step: user chooses whether to filter by region first or taxon first. */
const SelectStartingFilter = () => {
  const navigate = useNavigate();

  // Pan back to the world overview whenever this page is shown
  useDefaultMapPanning(DEFAULT_VIEW, { eventName: 'panToDefault', duration: 1500 });

  const handleNext = (selectedValue: string) => {
    if (selectedValue === 'region') {
      navigate('/region?startingFilter=region');
    } else {
      navigate('/superspecies?startingFilter=superspecies');
    }
  };

  return (
    <GeneralSelectComponent
      route="/starting-filter"
      paramKey="startingFilter"
      title="starting theme"
      description=""
      getOptions={() => OPTIONS}
      getContextDisplay={() => (
        <div className="mb-4">
          <p className="mb-4">Choose a dataset, filtering first by...</p>
        </div>
      )}
      tableHeaders={[]}
      customNextHandler={handleNext}
      customBackHandler={null} // null hides the Back button on the first page
      preHeading={<SurveyCallout />}
    />
  );
};

export default SelectStartingFilter;
