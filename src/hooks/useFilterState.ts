import { useSearchParams, useNavigate } from 'react-router-dom';

export interface FilterState {
  /** Returns the current value of a URL search parameter, or null if absent. */
  getParam: (key: string) => string | null;
  /** Returns all current search params as a plain object. */
  getAllParams: () => Record<string, string>;
  /** Updates a single search param in-place (replaces history entry). */
  setParam: (key: string, value: string) => void;
  /** Sets a param then navigates to `nextRoute`, carrying all current params. */
  setParamAndNavigate: (key: string, value: string, nextRoute: string) => void;
}

/**
 * Manages the workflow selection state via URL search params.
 * Using the URL means selections survive page refreshes and are shareable.
 */
export const useFilterState = (): FilterState => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const getParam = (key: string) => searchParams.get(key);

  const getAllParams = () => Object.fromEntries(searchParams.entries());

  const setParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams, { replace: true });
  };

  const setParamAndNavigate = (key: string, value: string, nextRoute: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    navigate(`${nextRoute}?${newParams.toString()}`);
  };

  return { getParam, getAllParams, setParam, setParamAndNavigate };
};
