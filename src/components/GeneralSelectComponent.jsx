import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute, getPreviousRoute } from '../utils/navigationUtils';
import { useAppContext } from '../context/AppContext';

const GeneralSelectComponent = ({ 
  route,
  paramKey,
  title,
  description,
  getOptions,
  getContextDisplay,
  tableHeaders = [title],
  onSelect,
  customBackHandler
}) => {
  const { data } = useAppContext();
  const { getParam, getAllParams, setParamAndNavigate } = useFilterState();
  const [selectedValue, setSelectedValue] = useState(getParam(paramKey) || '');
  const startingFilter = getParam('startingFilter');
  const allParams = getAllParams();
  const navigate = useNavigate();
  
  const handleSelect = (value) => {
    setSelectedValue(value);
    
    // Immediately update URL parameter when row is clicked
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(paramKey, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    
    // Call custom selection handler if provided
    if (onSelect) {
      onSelect(value);
    }
  };
  
  const handleNext = () => {
    if (!selectedValue) return;
    const nextRoute = getNextRoute(route, startingFilter);
    setParamAndNavigate(paramKey, selectedValue, nextRoute);
  };
  
  const handleBack = () => {
    if (customBackHandler) {
      customBackHandler();
    } else {
      const prevRoute = getPreviousRoute(route, startingFilter);
      const currentParams = new URLSearchParams(window.location.search);
      // Remove the current parameter when going back
      currentParams.delete(paramKey);
      navigate(`${prevRoute}?${currentParams.toString()}`);
    }
  };
  
  const options = getOptions(allParams, data);
  const contextDisplay = getContextDisplay ? getContextDisplay(allParams) : null;
  
  return (
    <div>
      <h2 className="text-2xl mb-4">Select {title}</h2>
      {contextDisplay && <div className="mb-4">{contextDisplay}</div>}
      <p className="mb-4">Click on a row to select a {title.toLowerCase()}:</p>
      
      <table className="w-full mb-4 border">
        {tableHeaders.length > 0 && (
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index} className="border px-2 text-left">{header}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {options.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            
            return (
              <tr 
                key={optionValue} 
                onClick={() => handleSelect(optionValue)} 
                className={`cursor-pointer ${optionValue === selectedValue ? 'bg-blue-100' : ''}`}
              >
                {typeof option === 'string' ? (
                  <td className="border px-2">{option}</td>
                ) : (
                  option.cells.map((cell, index) => (
                    <td key={index} className="border px-2">{cell}</td>
                  ))
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="flex gap-2">
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedValue}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GeneralSelectComponent;
