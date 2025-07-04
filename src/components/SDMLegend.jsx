import SDMColorBar from './SDMColorBar';

const SDMLegend = ({ maxVal }) => {
  return (
    //<fieldset>
    //  <legend className="font-medium mb-2">Data layer: Controls and colour scale</legend>
      <div className="ml-0">
        <SDMColorBar maxVal={maxVal} />
        <div className="text-xs text-gray-600 mt-2">
          The maximum value of the colour scale is chosen as the 99th percentile of the input data.
        </div>
      </div>
    //</fieldset>
  );
};

export default SDMLegend;
