import React from 'react';

const SDMColorBar = ({ 
  maxVal = 100,
  title = "Habitat suitability"
}) => {
  // Color stops with your specified values
  const colorStops = [
    { value: 1.0, color: "rgb(68, 1, 84)" },
    { value: 11.0, color: "rgb(70, 14, 97)" },
    { value: 21.0, color: "rgb(72, 29, 111)" },
    { value: 31.0, color: "rgb(71, 42, 121)" },
    { value: 41.0, color: "rgb(69, 54, 129)" },
    { value: 51.0, color: "rgb(65, 66, 134)" },
    { value: 61.0, color: "rgb(60, 77, 138)" },
    { value: 71.0, color: "rgb(55, 88, 140)" },
    { value: 81.0, color: "rgb(50, 98, 141)" },
    { value: 91.0, color: "rgb(46, 108, 142)" },
    { value: 101.0, color: "rgb(42, 119, 142)" },
    { value: 111.0, color: "rgb(38, 128, 142)" },
    { value: 121.0, color: "rgb(34, 137, 141)" },
    { value: 131.0, color: "rgb(31, 147, 139)" },
    { value: 141.0, color: "rgb(30, 156, 137)" },
    { value: 151.0, color: "rgb(33, 166, 133)" },
    { value: 161.0, color: "rgb(41, 175, 127)" },
    { value: 171.0, color: "rgb(55, 184, 119)" },
    { value: 181.0, color: "rgb(73, 193, 109)" },
    { value: 191.0, color: "rgb(94, 201, 97)" },
    { value: 201.0, color: "rgb(116, 208, 84)" },
    { value: 211.0, color: "rgb(141, 214, 68)" },
    { value: 221.0, color: "rgb(167, 219, 51)" },
    { value: 231.0, color: "rgb(194, 223, 34)" },
    { value: 241.0, color: "rgb(220, 226, 24)" },
    { value: 251.0, color: "rgb(246, 230, 31)" },
    { value: 254.0, color: "rgb(253, 231, 36)" }
  ];

  // Generate labels based on your specification
  // Data space positions: 1 + [0, 0.25, 0.5, 0.75, 1.0] * 253
  // Label space values: [0.0, 0.25, 0.5, 0.75, 1.0] * maxVal
  const labelPositions = [0, 0.25, 0.5, 0.75, 1.0];
  const labels = labelPositions.map(pos => ({
    dataValue: 1 + pos * 253,
    labelValue: pos * maxVal
  }));

  return (
    <div className="p-2">
      <div className="text-sm font-semibold mb-3 text-gray-700">
        {title}
      </div>
      
      <div className="flex items-center gap-8">
        {/* Labels */}
        <div className="relative h-40 flex flex-col justify-between">
          {labels.map((label, index) => {
            const labelStr = (() => {
              const value = label.labelValue;
              const isZeroOrOne = Math.abs(value - 0) < 1e-3 || Math.abs(value - 1) < 1e-3;
              return value.toLocaleString('en-US', {
                minimumFractionDigits: isZeroOrOne ? 0 : 2,
                maximumFractionDigits: isZeroOrOne ? 0 : 2
              });
            })();
            
            // Calculate position based on data value position in the 1-254 range
            // Map from data space (1-254) to visual space (0-160px)
            const position = ((label.dataValue - 1) / 253) * 160;
            
            return (
              <div 
                key={index}
                className="absolute text-xs text-right w-24 text-gray-600 -translate-y-2 pr-10"
                style={{ 
                  top: `${160 - position}px`, // Flip vertically since SVG starts from top
                  lineHeight: '16px'
                }}
              >
                {labelStr}
              </div>
            );
          })}
        </div>
        
        {/* Color bar */}
        <div className="border border-gray-800 shadow-md ml-8">
          <svg width="40" height="160" className="block">
            <defs>
              {/* Gradient based on your color stops */}
              <linearGradient id="customGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                {colorStops.map((stop, index) => {
                  // Map stop value from 1-254 range to 0-100% offset
                  const offset = ((stop.value - 1) / 253) * 100;
                  return (
                    <stop 
                      key={stop.value}
                      offset={`${offset}%`} 
                      style={{ stopColor: stop.color, stopOpacity: 1 }} 
                    />
                  );
                })}
              </linearGradient>
            </defs>
            
            {/* Single rectangle covering full height */}
            <rect x="0" y="0" width="40" height="160" fill="url(#customGradient)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SDMColorBar;
