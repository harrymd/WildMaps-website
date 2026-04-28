const S3 = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';

/**
 * Base URL for all WildMaps assets (dictionaries, styles, JSON results, logo).
 * Falls back to S3 when VITE_BUCKET_URL is not set.
 */
export const BUCKET_URL: string = import.meta.env.VITE_BUCKET_URL ?? S3;

/**
 * Base URL specifically for raster tiles.
 * Falls back to BUCKET_URL (and then S3) when VITE_TILE_BUCKET_URL is not set.
 *
 * Three modes via .env.local:
 *   1. All local:              VITE_BUCKET_URL=http://localhost:8080
 *   2. Local except tiles:     VITE_BUCKET_URL=http://localhost:8080
 *                              VITE_TILE_BUCKET_URL=https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com
 *   3. All S3 (default):       (no variables set)
 */
export const TILE_BUCKET_URL: string = import.meta.env.VITE_TILE_BUCKET_URL ?? BUCKET_URL;

/**
 * When VITE_USE_TESTING_PREFIX=true, all data paths are rooted under a
 * "testing/" subdirectory on the bucket, e.g. testing/data_outputs/...
 */
const testingPrefix = import.meta.env.VITE_USE_TESTING_PREFIX === 'true' ? '/test' : '';

/** Root for all non-tile assets (dictionaries, styles, result JSON). */
export const DATA_ROOT: string = `${BUCKET_URL}${testingPrefix}`;

/** Root for raster tile assets. */
export const TILE_DATA_ROOT: string = `${TILE_BUCKET_URL}${testingPrefix}`;

/** Path prefix for MapLibre GL style JSON files. */
export const PATH_STYLES = `${DATA_ROOT}/data_inputs/styles`;
