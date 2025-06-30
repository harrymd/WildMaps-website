import { useSearchParams, useNavigate } from 'react-router-dom';

export const useFilterState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const getParam = (key) => searchParams.get(key);
  const getAllParams = () => Object.fromEntries(searchParams.entries());
  
  const setParamAndNavigate = (key, value, nextRoute) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    navigate(`${nextRoute}?${newParams.toString()}`);
  };
  
  return { getParam, getAllParams, setParamAndNavigate };
};
