import React from 'react';

const SingleColorBar = ({ 
  colorStops = [
    { value: 0, color: "rgb(12, 7, 134)" },
    { value: 30, color: "rgb(117, 0, 168)" },
    { value: 100, color: "rgb(177, 43, 143)" },
    { value: 300, color: "rgb(223, 97, 99)" },
    { value: 1000, color: "rgb(252, 167, 53)" },
    { value: 3000, color: "rgb(239, 248, 33)" }
  ],
  labels = [3000, 1000, 300, 100, 30, 0],
  title = "People per km²"
}) => {

  return (
    <div className="p-2">
      <div className="text-sm font-semibold mb-3 text-gray-700">
        {title}
      </div>
      
      <div className="flex items-center gap-8">
        {/* Labels */}
        <div className="relative h-40 flex flex-col justify-between">
          {labels.map((label, index) => {
            const label_str = label.toLocaleString('en-US');
            
            // Calculate position based on index in the labels array
            // Evenly distribute labels across the full height
            const position = (index / (labels.length - 1)) * 160;
            
            return (
              <div 
                key={label}
                className="absolute text-xs text-right w-24 text-gray-600 -translate-y-2 pr-10"
                style={{ 
                  top: `${position}px`,
                  lineHeight: '16px'
                }}
              >
                {label_str}
              </div>
            );
          })}
        </div>
        
        {/* Color bar */}
        <div className="border border-gray-800 shadow-md ml-8">
          <svg width="40" height="160" className="block">
            <defs>
              {/* Single gradient covering full height */}
              <linearGradient id="singleGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                {colorStops.map((stop, index) => {
                  const offset = (index / (colorStops.length - 1)) * 100;
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
            <rect x="0" y="0" width="40" height="160" fill="url(#singleGradient)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SingleColorBar;
