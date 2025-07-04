const NavigationButtons = ({ onPrevious, onReset, disabled = false }) => (
  <div className="absolute bottom-0 left-0 right-0 border-t pt-4 bg-white h-15">
    <div className="flex justify-between gap-2">
      <button
        onClick={onPrevious}
        disabled={disabled}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
      >
        Back
      </button>
      <button
        onClick={onReset}
        disabled={disabled}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
      >
        Reset Parameters
      </button>
    </div>
  </div>
);

export default NavigationButtons
