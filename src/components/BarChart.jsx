import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Enhanced BarChart that can optionally display color swatches
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
  // New props for color swatch functionality
  useColorSwatches = false,
  landUseColorSchemeData = null
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { 
      top: 20, 
      right: 20, 
      bottom: useColorSwatches ? 80 : 60, // Adjust bottom margin for swatches
      left: Math.max(60, yLabelOffset + 20)
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const keys = Object.keys(data[0]).filter(k => k !== 'label');
    const isStacked = keys.length > 1;

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([innerHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tooltip only if using color swatches
    let tooltip;
    if (useColorSwatches) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'bar-chart-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('max-width', '200px')
        .style('z-index', '1000')
        .style('pointer-events', 'none');
    }

    if (isStacked) {
      const stack = d3.stack().keys(keys);
      const stackedData = stack(data);

      if (yMax !== null) {
        y.domain([0, yMax]);
      } else {
        y.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]).nice();
      }

      const color = colors && colors.length === keys.length
        ? d3.scaleOrdinal().domain(keys).range(colors)
        : d3.scaleOrdinal().domain(keys).range(d3.schemeCategory10);

      g.selectAll('.serie')
        .data(stackedData)
        .enter().append('g')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .enter().append('rect')
        .attr('x', d => x(d.data.label))
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth());
    } else {
      if (yMax !== null) {
        y.domain([0, yMax]);
      } else {
        y.domain([0, d3.max(data, d => d.value)]).nice();
      }

      g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.label))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.value))
        .attr('fill', colors && colors.length > 0 ? colors[0] : '#4A90E2');
    }

    // Y-axis
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

    // X-axis - conditionally show text labels
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(useColorSwatches ? '' : null))
      .selectAll('text')
      .style('font-size', `${xTickFontSize}px`);

    // Add color swatches if enabled
    if (useColorSwatches && landUseColorSchemeData) {
      const swatchSize = Math.min(x.bandwidth() * 0.8, 20);
      const swatchY = innerHeight + 15;

      g.selectAll('.color-swatch')
        .data(data)
        .enter().append('rect')
        .attr('class', 'color-swatch')
        .attr('x', d => x(d.label) + (x.bandwidth() - swatchSize) / 2)
        .attr('y', swatchY)
        .attr('width', swatchSize)
        .attr('height', swatchSize)
        .attr('fill', d => {
          if (landUseColorSchemeData[d.label]) {
            const colorData = landUseColorSchemeData[d.label];
            return `rgb(${colorData.r}, ${colorData.g}, ${colorData.b})`;
          }
          return '#ccc';
        })
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          if (landUseColorSchemeData[d.label]) {
            const colorData = landUseColorSchemeData[d.label];
            const tooltipContent = `
              <strong>Code:</strong> ${d.label}<br/>
              <strong>Class:</strong> ${colorData.lc_class}<br/>
              <strong>Definition:</strong> ${colorData.definition}
            `;
            tooltip
              .style('visibility', 'visible')
              .html(tooltipContent);
          } else {
            // Handle case where landUseColorSchemeData doesn't have this label
            const tooltipContent = `
              Other land cover types.
            `;
            tooltip
              .style('visibility', 'visible')
              .html(tooltipContent);
          }
        })
        .on('mousemove', function(event) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
          tooltip.style('visibility', 'hidden');
        });
    }

    // X-axis label
    if (xLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + (useColorSwatches ? 60 : 40))
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', `${xLabelFontSize}px`)
        .text(xLabel);
    }

    // Cleanup function
    return () => {
      if (tooltip) {
        tooltip.remove();
      }
    };

  }, [data, width, height, xLabel, yLabel, colors, yMax, xTickFontSize, yTickFontSize, xLabelFontSize, yLabelFontSize, yLabelOffset, useColorSwatches, landUseColorSchemeData]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};

// Higher-order component that creates a ColorSwatchBarChart
export const ColorSwatchBarChart = (props) => {
  return (
    <BarChart 
      {...props} 
      useColorSwatches={true}
    />
  );
};

export default BarChart;
