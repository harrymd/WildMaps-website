import React from 'react';

const ElevationColorBar = () => {
  const colorStops = [
    { value: -11000, color: "rgb(0, 0, 0)" },
    { value: -8000, color: "rgb(64, 64, 64)" },
    { value: -5000, color: "rgb(122, 122, 122)" },
    { value: -2000, color: "rgb(181, 181, 181)" },
    { value: -500, color: "rgb(226, 226, 226)" },
    { value: -1, color: "rgb(255, 255, 255)" },
    { value: 0, color: "rgb(0, 34, 77)" },
    { value: 200, color: "rgb(17, 53, 111)" },
    { value: 500, color: "rgb(58, 72, 107)" },
    { value: 1000, color: "rgb(87, 93, 109)" },
    { value: 2000, color: "rgb(111, 112, 115)" },
    { value: 3000, color: "rgb(137, 134, 120)" },
    { value: 4000, color: "rgb(165, 155, 115)" },
    { value: 5000, color: "rgb(195, 179, 104)" },
    { value: 6000, color: "rgb(225, 204, 84)" },
    { value: 8000, color: "rgb(253, 231, 55)" }
  ];

  const labels = [8000, 6000, 5000, 4000, 3000, 2000, 1000, 500, 200, 0, -500, -2000, -5000, -8000, -11000];

  return (
    //<div className="p-4 bg-gray-50">
    <div className="p-2">
      <div className="text-sm font-semibold mb-3 text-gray-700">
        Elevation (metres)
      </div>
      
      <div className="flex items-center gap-8">
        {/* Labels */}
        <div className="relative h-80 flex flex-col justify-between">
          {labels.filter(label => label !== -1).map((label, index) => {
            const label_str = label.toLocaleString('en-US');
            // Calculate position based on gradient sections
            let position;
            if (label >= 0) {
              // Land section (0 to 8000) - top 240px
              // Gradient goes from bottom (0) to top (8000)
              const landStops = [0, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000, 8000];
              const landIndex = landStops.indexOf(label);
              if (landIndex !== -1) {
                // Reverse the position calculation for land section
                position = 240 - (landIndex / (landStops.length - 1)) * 240;
              }
            } else {
              // Underwater section (-11000 to -500) - bottom 80px
              // Gradient goes from bottom (-11000) to top (-500)
              const underwaterStops = [-11000, -8000, -5000, -2000, -500];
              const underwaterIndex = underwaterStops.indexOf(label);
              if (underwaterIndex !== -1) {
                // Reverse the position calculation for underwater section
                position = 320 - (underwaterIndex / (underwaterStops.length)) * 80;
              }
            }
            
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
          <svg width="40" height="320" className="block">
            <defs>
              {/* Underwater gradient */}
              <linearGradient id="underwaterGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" style={{ stopColor: "rgb(0, 0, 0)", stopOpacity: 1 }} />
                <stop offset="18.75%" style={{ stopColor: "rgb(64, 64, 64)", stopOpacity: 1 }} />
                <stop offset="37.5%" style={{ stopColor: "rgb(122, 122, 122)", stopOpacity: 1 }} />
                <stop offset="56.25%" style={{ stopColor: "rgb(181, 181, 181)", stopOpacity: 1 }} />
                <stop offset="75%" style={{ stopColor: "rgb(226, 226, 226)", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "rgb(255, 255, 255)", stopOpacity: 1 }} />
              </linearGradient>
              
              {/* Land gradient */}
              <linearGradient id="landGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" style={{ stopColor: "rgb(0, 34, 77)", stopOpacity: 1 }} />
                <stop offset="11.11%" style={{ stopColor: "rgb(17, 53, 111)", stopOpacity: 1 }} />
                <stop offset="22.22%" style={{ stopColor: "rgb(58, 72, 107)", stopOpacity: 1 }} />
                <stop offset="33.33%" style={{ stopColor: "rgb(87, 93, 109)", stopOpacity: 1 }} />
                <stop offset="44.44%" style={{ stopColor: "rgb(111, 112, 115)", stopOpacity: 1 }} />
                <stop offset="55.56%" style={{ stopColor: "rgb(137, 134, 120)", stopOpacity: 1 }} />
                <stop offset="66.67%" style={{ stopColor: "rgb(165, 155, 115)", stopOpacity: 1 }} />
                <stop offset="77.78%" style={{ stopColor: "rgb(195, 179, 104)", stopOpacity: 1 }} />
                <stop offset="88.89%" style={{ stopColor: "rgb(225, 204, 84)", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "rgb(253, 231, 55)", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            {/* Underwater section (bottom 80px) */}
            <rect x="0" y="240" width="40" height="80" fill="url(#underwaterGradient)" />
            
            {/* Land section (top 240px) */}
            <rect x="0" y="0" width="40" height="240" fill="url(#landGradient)" />
            
            {/* Sharp transition line at water level */}
            <line x1="0" y1="240" x2="40" y2="240" stroke="#000" strokeWidth="0.5" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ElevationColorBar;
