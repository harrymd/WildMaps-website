const NavigationButtons = ({ onPrevious, onReset, disabled = false }) => (
  <div className="absolute bottom-0 left-0 right-0 border-t pt-4 bg-white h-15">
    <div className="flex justify-between gap-2">
      <button
        onClick={onPrevious}
        disabled={disabled}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2"
      >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
        Back
      </button>
      <button
        onClick={onReset}
        disabled={disabled}
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
      >
        Reset Parameters
      </button>
    </div>
  </div>
);

export default NavigationButtons
