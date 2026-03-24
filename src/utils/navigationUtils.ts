import type { StartingFilter } from '../types';

/**
 * Route sequences for each workflow ordering.
 * Region-first: user picks region → subregion → taxon → dataset → final.
 * Superspecies-first: user picks taxon → region → subregion → dataset → final.
 */
const REGION_FIRST_ORDER = ['/region', '/subregion', '/superspecies', '/dataset', '/final'] as const;
const SUPERSPECIES_FIRST_ORDER = ['/superspecies', '/region', '/subregion', '/dataset', '/final'] as const;

type Route = (typeof REGION_FIRST_ORDER)[number] | (typeof SUPERSPECIES_FIRST_ORDER)[number];

/** Returns the route that follows `currentRoute` in the selected workflow order. */
export const getNextRoute = (currentRoute: string, startingFilter: string | null): Route => {
  const order = startingFilter === 'region' ? REGION_FIRST_ORDER : SUPERSPECIES_FIRST_ORDER;
  const currentIndex = order.indexOf(currentRoute as Route);

  // If not found or already last, stay on /final
  return currentIndex >= 0 && currentIndex < order.length - 1
    ? order[currentIndex + 1]
    : '/final';
};

/** Returns the route that precedes `currentRoute` in the selected workflow order. */
export const getPreviousRoute = (currentRoute: string, startingFilter: string | null): Route | '/' => {
  const order = startingFilter === 'region' ? REGION_FIRST_ORDER : SUPERSPECIES_FIRST_ORDER;
  const currentIndex = order.indexOf(currentRoute as Route);

  // If not found or already first, return to the starting-filter page
  return currentIndex > 0 ? order[currentIndex - 1] : '/';
};
