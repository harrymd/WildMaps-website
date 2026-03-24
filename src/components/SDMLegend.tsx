import SDMColorBar from './SDMColorBar';

interface SDMLegendProps {
  maxVal: number;
}

/** Wrapper that adds an explanatory footnote below the SDM colour bar. */
const SDMLegend = ({ maxVal }: SDMLegendProps) => (
  <div className="ml-0">
    <SDMColorBar maxVal={maxVal} />
    <div className="text-xs text-gray-600 mt-2">
      The maximum value of the colour scale is chosen as the 99th percentile of the input data.
    </div>
  </div>
);

export default SDMLegend;
