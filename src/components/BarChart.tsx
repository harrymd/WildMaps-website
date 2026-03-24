import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { LandUseColorEntry } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A single data row for the chart. The `label` field is the x-axis category. */
export interface BarChartDataEntry {
  label: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartDataEntry[];
  width?: number;
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Colour array — one per stacked segment (stacked) or a single colour (simple). */
  colors?: string[] | null;
  /** Fixed y-axis maximum. Computed automatically when null. */
  yMax?: number | null;
  xTickFontSize?: number;
  yTickFontSize?: number;
  xLabelFontSize?: number;
  yLabelFontSize?: number;
  /** Distance in px between the y-axis centre and the axis label. */
  yLabelOffset?: number;
  /** When true, draws a colour swatch under each bar instead of a text tick. */
  useColorSwatches?: boolean;
  /** Land-use colour scheme used to fill the swatches. */
  landUseColorSchemeData?: Record<string, LandUseColorEntry> | null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * D3-powered stacked (or simple) bar chart rendered imperatively inside a
 * useEffect. The tooltip element is created and removed in the same effect to
 * avoid leaking DOM nodes across re-renders.
 *
 * NOTE: This component uses imperative D3 DOM manipulation — avoid wrapping it
 * in React.memo or adding fast-changing props that would trigger frequent redraws.
 */
const BarChart = ({
  data,
  width = 500,
  height = 300,
  title = 'Bar Chart',
  xLabel = '',
  yLabel = '',
  colors = null,
  yMax = null,
  xTickFontSize = 14,
  yTickFontSize = 14,
  xLabelFontSize = 20,
  yLabelFontSize = 20,
  yLabelOffset = 45,
  useColorSwatches = false,
  landUseColorSchemeData = null,
}: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear previous render

    const margin = {
      top: 20,
      right: 20,
      bottom: useColorSwatches ? 80 : 60,
      left: Math.max(60, yLabelOffset + 20),
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Determine whether this is a stacked chart (multiple numeric keys per row)
    const keys = Object.keys(data[0]).filter((k) => k !== 'label');
    const isStacked = keys.length > 1;

    const x = d3.scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3.scaleLinear().range([innerHeight, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // ── Tooltip (only created when using colour swatches) ──────────────────
    let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown> | undefined;
    if (useColorSwatches) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'bar-chart-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'rgba(0,0,0,0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('max-width', '200px')
        .style('z-index', '1000')
        .style('pointer-events', 'none');
    }

    // ── Bars ──────────────────────────────────────────────────────────────
    if (isStacked) {
      const stack = d3.stack<BarChartDataEntry>().keys(keys);
      const stackedData = stack(data);

      if (yMax !== null) {
        y.domain([0, yMax]);
      } else {
        y.domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1]) ?? 0]).nice();
      }

      const color =
        colors && colors.length === keys.length
          ? d3.scaleOrdinal<string>().domain(keys).range(colors)
          : d3.scaleOrdinal<string>().domain(keys).range(d3.schemeCategory10);

      g.selectAll('.serie')
        .data(stackedData)
        .enter().append('g')
        .attr('fill', (d) => color(d.key))
        .selectAll('rect')
        .data((d) => d)
        .enter().append('rect')
        .attr('x', (d) => x(d.data.label) ?? 0)
        .attr('y', (d) => y(d[1]))
        .attr('height', (d) => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth());
    } else {
      // Simple (non-stacked) bar chart
      if (yMax !== null) {
        y.domain([0, yMax]);
      } else {
        y.domain([0, d3.max(data, (d) => Number(d['value'])) ?? 0]).nice();
      }

      g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.label) ?? 0)
        .attr('y', (d) => y(Number(d['value'])))
        .attr('width', x.bandwidth())
        .attr('height', (d) => innerHeight - y(Number(d['value'])))
        .attr('fill', colors && colors.length > 0 ? colors[0] : '#4A90E2');
    }

    // ── Y-axis ─────────────────────────────────────────────────────────────
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', `${yTickFontSize}px`);

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -yLabelOffset)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', `${yLabelFontSize}px`)
        .text(yLabel);
    }

    // ── X-axis ─────────────────────────────────────────────────────────────
    // When colour swatches replace the tick labels, pass an empty-string formatter.
    // The two cases are split because D3's tickFormat overloads don't accept a union.
    const xAxis = useColorSwatches
      ? d3.axisBottom(x).tickFormat(() => '')
      : d3.axisBottom(x);
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', `${xTickFontSize}px`);

    // ── Colour swatches beneath x-axis ─────────────────────────────────────
    if (useColorSwatches && landUseColorSchemeData) {
      const swatchSize = Math.min(x.bandwidth() * 0.8, 20);
      const swatchY = innerHeight + 15;

      g.selectAll('.color-swatch')
        .data(data)
        .enter().append('rect')
        .attr('class', 'color-swatch')
        .attr('x', (d) => (x(d.label) ?? 0) + (x.bandwidth() - swatchSize) / 2)
        .attr('y', swatchY)
        .attr('width', swatchSize)
        .attr('height', swatchSize)
        .attr('fill', (d) => {
          const c = landUseColorSchemeData[d.label];
          return c ? `rgb(${c.r}, ${c.g}, ${c.b})` : '#ccc';
        })
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function (_event, d) {
          if (!tooltip) return;
          const c = landUseColorSchemeData[d.label];
          const html = c
            ? `<strong>Code:</strong> ${d.label}<br/><strong>Class:</strong> ${c.lc_class}<br/><strong>Definition:</strong> ${c.definition}`
            : 'Other land cover types.';
          tooltip.style('visibility', 'visible').html(html);
        })
        .on('mousemove', function (event: MouseEvent) {
          tooltip?.style('top', `${event.pageY - 10}px`).style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', function () {
          tooltip?.style('visibility', 'hidden');
        });
    }

    // ── X-axis label ───────────────────────────────────────────────────────
    if (xLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + (useColorSwatches ? 60 : 40))
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', `${xLabelFontSize}px`)
        .text(xLabel);
    }

    // Cleanup: remove the tooltip div on unmount / re-render
    return () => { tooltip?.remove(); };
  }, [data, width, height, xLabel, yLabel, colors, yMax, xTickFontSize, yTickFontSize,
      xLabelFontSize, yLabelFontSize, yLabelOffset, useColorSwatches, landUseColorSchemeData]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

/**
 * Convenience wrapper that enables colour swatches beneath the x-axis.
 * Used for the land-use chart on the FinalScreen.
 */
export const ColorSwatchBarChart = (props: BarChartProps) => (
  <BarChart {...props} useColorSwatches={true} />
);

export default BarChart;
