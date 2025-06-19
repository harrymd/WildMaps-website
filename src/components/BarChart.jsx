import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, width = 500, height = 300, title = 'Bar Chart', xLabel = '', yLabel = '' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
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

    if (isStacked) {
      const stack = d3.stack().keys(keys);
      const stackedData = stack(data);

      y.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]).nice();

      // Color scale
      const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10);

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
      y.domain([0, d3.max(data, d => d.value)]).nice();

      g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.label))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.value))
        .attr('fill', '#4A90E2');
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    if (xLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .text(xLabel);
    }

    g.append('g')
      .call(d3.axisLeft(y));

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .text(yLabel);
    }

  }, [data, width, height, xLabel, yLabel]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};

export default BarChart;
