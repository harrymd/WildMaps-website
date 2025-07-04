import React from 'react';
import { OVERLAYS } from './config';

export default function OverlaySection({ 
  currentBaselayer, 
  handleOverlayChange 
}) {
  return (
    <fieldset className="border-b border-gray-200 pb-4">
      <legend className="font-medium mb-2">Select an overlay layer</legend>
      <div className="flex flex-col space-y-2">
        {Object.values(OVERLAYS).map(({ label, value }) => (
          <label key={value || 'none'} className="flex items-center space-x-2">
            <input
              type="radio"
              name="overlay"
              value={value || ''}
              checked={currentBaselayer === value}
              onChange={() => handleOverlayChange(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
