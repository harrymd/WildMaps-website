import { describe, it, expect } from 'vitest';
import { processChartData } from './chartDataUtils';
import type { DataSubset } from '../types';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const makeSubData = (overrides: Partial<DataSubset> = {}): DataSubset => ({
  area_km2_by_bin_in_PA: [100, 200, 300, 400],
  area_km2_by_bin_not_in_PA: [500, 500, 500, 500],
  area_km2_by_landuse_and_bin: {
    '10': [1000, 2000, 3000, 4000],  // 10,000 total — major
    '20': [500,  500,  500,  500],   // 2,000 total — major
    '99': [1,    1,    1,    1],     // 4 total — minor (< 1% of ~12,004)
  },
  ...overrides,
});

// ─── Protected-area chart ──────────────────────────────────────────────────────

describe('processChartData — protected area chart', () => {
  it('produces two rows: Unprotected and Protected', () => {
    const { chartData_areas_transposed } = processChartData(makeSubData());
    expect(chartData_areas_transposed).toHaveLength(2);
    expect(chartData_areas_transposed[0].label).toBe('Unprotected');
    expect(chartData_areas_transposed[1].label).toBe('Protected');
  });

  it('converts areas to percentages that sum to ~100 within each group', () => {
    const { chartData_areas_transposed } = processChartData(makeSubData());

    const unprotectedSum =
      chartData_areas_transposed[0].Low +
      chartData_areas_transposed[0]['Low-med'] +
      chartData_areas_transposed[0]['High-med'] +
      chartData_areas_transposed[0].High;

    expect(unprotectedSum).toBeCloseTo(100, 5);
  });

  it('correctly calculates Protected percentages', () => {
    // PA values: [100,200,300,400] → sum=1000
    // → [10%, 20%, 30%, 40%]
    const { chartData_areas_transposed } = processChartData(makeSubData());
    const pa = chartData_areas_transposed[1];
    expect(pa.Low).toBeCloseTo(10, 5);
    expect(pa['Low-med']).toBeCloseTo(20, 5);
    expect(pa['High-med']).toBeCloseTo(30, 5);
    expect(pa.High).toBeCloseTo(40, 5);
  });

  it('returns empty array when both PA arrays have zero length', () => {
    const { chartData_areas_transposed } = processChartData(
      makeSubData({ area_km2_by_bin_in_PA: [], area_km2_by_bin_not_in_PA: [] })
    );
    expect(chartData_areas_transposed).toHaveLength(0);
  });

  it('returns zeros when all PA values are 0 (avoids division by zero)', () => {
    const { chartData_areas_transposed } = processChartData(
      makeSubData({
        area_km2_by_bin_in_PA: [0, 0, 0, 0],
        area_km2_by_bin_not_in_PA: [0, 0, 0, 0],
      })
    );
    const pa = chartData_areas_transposed[1];
    expect(pa.Low).toBe(0);
    expect(pa['High-med']).toBe(0);
  });
});

// ─── Land-use chart ────────────────────────────────────────────────────────────

describe('processChartData — land-use chart', () => {
  it('includes major categories as separate bars', () => {
    const { chartData_landuse } = processChartData(makeSubData());
    const labels = chartData_landuse.map((d) => d.label);
    expect(labels).toContain('10');
    expect(labels).toContain('20');
  });

  it('aggregates minor categories into an "Other" bar', () => {
    const { chartData_landuse } = processChartData(makeSubData());
    const labels = chartData_landuse.map((d) => d.label);
    expect(labels).toContain('Other');
    // The original minor category should NOT appear as its own bar
    expect(labels).not.toContain('99');
  });

  it('converts areas to thousands of km²', () => {
    // category '10': values [1000, 2000, 3000, 4000] → /1000 = [1, 2, 3, 4]
    const { chartData_landuse } = processChartData(makeSubData());
    const cat10 = chartData_landuse.find((d) => d.label === '10')!;
    expect(cat10.Low).toBeCloseTo(1, 5);
    expect(cat10['Low-med']).toBeCloseTo(2, 5);
  });

  it('returns empty array when landuse data is absent', () => {
    const { chartData_landuse } = processChartData(
      makeSubData({ area_km2_by_landuse_and_bin: {} })
    );
    expect(chartData_landuse).toHaveLength(0);
  });

  it('does not add "Other" bar when all categories are major', () => {
    // Single category with large values — nothing is minor
    const { chartData_landuse } = processChartData(
      makeSubData({
        area_km2_by_landuse_and_bin: {
          '10': [10000, 10000, 10000, 10000],
        },
      })
    );
    const labels = chartData_landuse.map((d) => d.label);
    expect(labels).not.toContain('Other');
  });
});

// ─── Undefined input ──────────────────────────────────────────────────────────

describe('processChartData — undefined input', () => {
  it('returns empty arrays for both charts', () => {
    const { chartData_areas_transposed, chartData_landuse } = processChartData(undefined);
    expect(chartData_areas_transposed).toHaveLength(0);
    expect(chartData_landuse).toHaveLength(0);
  });
});
