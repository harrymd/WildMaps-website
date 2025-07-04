import { useSearchParams, useNavigate } from 'react-router-dom';

export const useFilterState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const getParam = (key) => searchParams.get(key);
  const getAllParams = () => Object.fromEntries(searchParams.entries());
  
  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams, { replace: true });
  };
  
  const setParamAndNavigate = (key, value, nextRoute) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    navigate(`${nextRoute}?${newParams.toString()}`);
  };
  
  return { 
    getParam, 
    getAllParams, 
    setParam, 
    setParamAndNavigate 
  };
};
