import React from 'react';

export default function ToggleSwitch({ 
  label, 
  isChecked, 
  onChange, 
  srOnlyText 
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isChecked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={isChecked}
      >
        <span className="sr-only">{srOnlyText}</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
