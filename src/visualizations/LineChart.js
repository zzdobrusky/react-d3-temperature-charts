import React, { Component } from "react";
import * as d3 from "d3";

const width = 650;
const height = 400;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

class LineChart extends Component {
  state = {
    pathLow: [],
    pathHigh: []
  };

  xAxis = d3.axisBottom().tickFormat(d3.timeFormat("%b"));
  yAxis = d3.axisLeft().tickFormat((d) => `${d}℉`);

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data } = nextProps;
    if (!data) return {};

    // x date scale
    const xExtent = d3.extent(data, (d) => d.date);
    const xScale = d3
      .scaleTime()
      .domain(xExtent)
      .range([margin.left, width - margin.right]);

    // y temperature scale
    const maxY = d3.max(data, (d) => d.high);
    const minY = d3.min(data, (d) => d.low);
    const yScale = d3
      .scaleLinear()
      .domain([minY, maxY])
      .range([height - margin.bottom, margin.top]);

    const lineGeneratorX = d3.line().x((d) => xScale(d.date));
    const pathLow = lineGeneratorX.y((d) => yScale(d.low))(data);
    const pathHigh = lineGeneratorX.y((d) => yScale(d.high))(data);

    return { pathLow, pathHigh, xScale, yScale };
  }

  componentDidUpdate() {
    this.xAxis.scale(this.state.xScale);
    d3.select("#xAxisLineChart").call(this.xAxis);
    this.yAxis.scale(this.state.yScale);
    d3.select("#yAxisLineChart").call(this.yAxis);
  }

  render() {
    return (
      <svg width={width} height={height}>
        <path
          d={this.state.pathLow}
          strokeWidth="2"
          stroke="blue"
          fill="none"
        />
        <path
          d={this.state.pathHigh}
          strokeWidth="2"
          stroke="red"
          fill="none"
        />
        <g
          id="xAxisLineChart"
          transform={`translate(0 ${height - margin.bottom})`}
        />
        <g id="yAxisLineChart" transform={`translate(${margin.left}, 0)`} />
      </svg>
    );
  }
}

export default LineChart;
