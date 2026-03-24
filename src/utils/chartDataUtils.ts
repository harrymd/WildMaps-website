import type { DataSubset, ChartDataEntry } from '../types';

/** Suitability-bin labels used across all charts. */
const BIN_LABELS = ['Low', 'Low-med', 'High-med', 'High'] as const;
type BinLabel = (typeof BIN_LABELS)[number];

/** Result returned by processChartData. */
export interface ChartDataResult {
  /** Stacked bar data: Protected vs Unprotected, columns = suitability bins. */
  chartData_areas_transposed: ChartDataEntry[];
  /** Stacked bar data: land-use categories, columns = suitability bins. */
  chartData_landuse: ChartDataEntry[];
}

/**
 * Transforms raw per-dataset JSON into two D3-ready stacked-bar arrays.
 *
 * `sub_data` is the subset for the selected geographic scope (whole, country, or
 * adm1-zone). Returns empty arrays for both charts when the input is undefined.
 */
export const processChartData = (sub_data: DataSubset | undefined): ChartDataResult => {
  // ── Protected-area chart ──────────────────────────────────────────────────

  const area_PA = sub_data?.area_km2_by_bin_in_PA ?? [];
  const area_not_PA = sub_data?.area_km2_by_bin_not_in_PA ?? [];

  const sum_PA = area_PA.reduce((acc, v) => acc + v, 0);
  const sum_not_PA = area_not_PA.reduce((acc, v) => acc + v, 0);

  // Convert absolute areas to percentages within each group
  const area_PA_frac = area_PA.map((v) => (sum_PA > 0 ? (v / sum_PA) * 100 : 0));
  const area_not_PA_frac = area_not_PA.map((v) => (sum_not_PA > 0 ? (v / sum_not_PA) * 100 : 0));

  let chartData_areas_transposed: ChartDataEntry[] = [];
  if (area_PA_frac.length === BIN_LABELS.length && area_not_PA_frac.length === BIN_LABELS.length) {
    chartData_areas_transposed = [
      buildEntry('Unprotected', area_not_PA_frac),
      buildEntry('Protected', area_PA_frac),
    ];
  }

  // ── Land-use chart ────────────────────────────────────────────────────────

  const chartData_landuse: ChartDataEntry[] = [];
  const landuse_data = sub_data?.area_km2_by_landuse_and_bin;

  if (landuse_data) {
    // Sum all values per land-use category to determine "major" vs "minor"
    const category_sums: Record<string, number> = {};
    let total_sum = 0;

    for (const [category, values] of Object.entries(landuse_data)) {
      const sum = values.reduce((acc, v) => acc + v, 0);
      category_sums[category] = sum;
      total_sum += sum;
    }

    // Categories below 1% of total are aggregated into an "Other" bar
    const threshold = total_sum * 0.01;
    const major_categories: string[] = [];
    const minor_categories: string[] = [];

    for (const [category, sum] of Object.entries(category_sums)) {
      if (sum >= threshold) {
        major_categories.push(category);
      } else {
        minor_categories.push(category);
      }
    }

    // Build a bar per major category (values in thousands of km²)
    for (const category of major_categories) {
      chartData_landuse.push(buildEntry(category, landuse_data[category].map((v) => v / 1000)));
    }

    // Aggregate all minor categories into a single "Other" bar
    if (minor_categories.length > 0) {
      const other_values = [0, 0, 0, 0];
      for (const category of minor_categories) {
        landuse_data[category].forEach((v, i) => {
          other_values[i] += v;
        });
      }
      chartData_landuse.push(buildEntry('Other', other_values.map((v) => v / 1000)));
    }
  }

  return { chartData_areas_transposed, chartData_landuse };
};

// ─── Private helper ────────────────────────────────────────────────────────────

/**
 * Constructs a ChartDataEntry from a label and an array of four bin values.
 * Assumes the array order matches BIN_LABELS (Low, Low-med, High-med, High).
 */
function buildEntry(label: string, values: number[]): ChartDataEntry {
  return {
    label,
    [BIN_LABELS[0]]: values[0] ?? 0,
    [BIN_LABELS[1]]: values[1] ?? 0,
    [BIN_LABELS[2]]: values[2] ?? 0,
    [BIN_LABELS[3]]: values[3] ?? 0,
  } as ChartDataEntry;
}
