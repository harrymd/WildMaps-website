import { useNavigate } from 'react-router-dom';
import { useDefaultMapPanning } from '../hooks/useDefaultMapPanning';
import GeneralSelectComponent from '../components/GeneralSelectComponent';

const DEFAULT_VIEW = { center: [105.0, 13] as [number, number], zoom: 2.5 };

const OPTIONS = [
  { value: 'region',       cells: ['... geographical region'] },
  { value: 'superspecies', cells: ['... animal type (taxon)'] },
];

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
    />
  );
};

export default SelectStartingFilter;
