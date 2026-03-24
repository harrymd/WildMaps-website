/**
 * Elevation colour bar with two separate gradients:
 * - Land (0–8000 m) displayed in the upper 240 px
 * - Ocean (−11000–−500 m) displayed in the lower 80 px
 */
const ElevationColorBar = () => {
  const labels = [8000, 6000, 5000, 4000, 3000, 2000, 1000, 500, 200, 0, -500, -2000, -5000, -8000, -11000];
  const landStops = [0, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000, 8000];
  const underwaterStops = [-11000, -8000, -5000, -2000, -500];

  /** Converts an elevation value to a pixel offset from the top of the 320 px bar. */
  const labelToTop = (label: number): number | undefined => {
    if (label >= 0) {
      const idx = landStops.indexOf(label);
      return idx !== -1 ? 240 - (idx / (landStops.length - 1)) * 240 : undefined;
    }
    const idx = underwaterStops.indexOf(label);
    return idx !== -1 ? 320 - (idx / underwaterStops.length) * 80 : undefined;
  };

  return (
    <div className="p-2">
      <div className="text-sm font-semibold mb-3 text-gray-700">Elevation (metres)</div>

      <div className="flex items-center gap-8">
        <div className="relative h-80 flex flex-col justify-between">
          {labels.map((label) => {
            const top = labelToTop(label);
            if (top === undefined) return null;
            return (
              <div
                key={label}
                className="absolute text-xs text-right w-24 text-gray-600 -translate-y-2 pr-10"
                style={{ top: `${top}px`, lineHeight: '16px' }}
              >
                {label.toLocaleString('en-US')}
              </div>
            );
          })}
        </div>

        <div className="border border-gray-800 shadow-md ml-8">
          <svg width="40" height="320" className="block">
            <defs>
              <linearGradient id="underwaterGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%"      style={{ stopColor: 'rgb(0, 0, 0)',       stopOpacity: 1 }} />
                <stop offset="18.75%" style={{ stopColor: 'rgb(64, 64, 64)',     stopOpacity: 1 }} />
                <stop offset="37.5%"  style={{ stopColor: 'rgb(122, 122, 122)', stopOpacity: 1 }} />
                <stop offset="56.25%" style={{ stopColor: 'rgb(181, 181, 181)', stopOpacity: 1 }} />
                <stop offset="75%"    style={{ stopColor: 'rgb(226, 226, 226)', stopOpacity: 1 }} />
                <stop offset="100%"   style={{ stopColor: 'rgb(255, 255, 255)', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="landGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%"     style={{ stopColor: 'rgb(0, 34, 77)',     stopOpacity: 1 }} />
                <stop offset="11.11%" style={{ stopColor: 'rgb(17, 53, 111)',   stopOpacity: 1 }} />
                <stop offset="22.22%" style={{ stopColor: 'rgb(58, 72, 107)',   stopOpacity: 1 }} />
                <stop offset="33.33%" style={{ stopColor: 'rgb(87, 93, 109)',   stopOpacity: 1 }} />
                <stop offset="44.44%" style={{ stopColor: 'rgb(111, 112, 115)',  stopOpacity: 1 }} />
                <stop offset="55.56%" style={{ stopColor: 'rgb(137, 134, 120)', stopOpacity: 1 }} />
                <stop offset="66.67%" style={{ stopColor: 'rgb(165, 155, 115)', stopOpacity: 1 }} />
                <stop offset="77.78%" style={{ stopColor: 'rgb(195, 179, 104)', stopOpacity: 1 }} />
                <stop offset="88.89%" style={{ stopColor: 'rgb(225, 204, 84)',  stopOpacity: 1 }} />
                <stop offset="100%"   style={{ stopColor: 'rgb(253, 231, 55)',  stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {/* Ocean section (bottom 80 px) */}
            <rect x="0" y="240" width="40" height="80" fill="url(#underwaterGradient)" />
            {/* Land section (top 240 px) */}
            <rect x="0" y="0"   width="40" height="240" fill="url(#landGradient)" />
            {/* Sharp transition line at sea level */}
            <line x1="0" y1="240" x2="40" y2="240" stroke="#000" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ElevationColorBar;
