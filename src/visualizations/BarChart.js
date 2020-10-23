import React, { Component } from "react";
import * as d3 from "d3";

const width = 650;
const height = 400;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

class BarChart extends Component {
  state = {
    bars: []
  };

  xAxis = d3.axisBottom().tickFormat(d3.timeFormat("%b"));
  yAxis = d3.axisLeft().tickFormat((d) => `${d}℉`);

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, range, unselectedColor } = nextProps;
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

    // bar color scale
    const avgExtent = d3.extent(data, (d) => d.avg).reverse();
    const colorScale = d3
      .scaleSequential()
      .domain(avgExtent)
      .interpolator(d3.interpolateRdYlBu);

    const bars = data.map((d) => {
      const isColored =
        range.length === 0 || (d.date > range[0] && d.date < range[1]);
      const x = xScale(d.date);
      const y = yScale(d.high);
      const height = yScale(d.low) - yScale(d.high);
      const fill = isColored ? colorScale(d.avg) : unselectedColor;
      return { x, y, height, fill };
    });

    return { bars, xScale, yScale };
  }

  componentDidUpdate() {
    this.xAxis.scale(this.state.xScale);
    d3.select("#xAxisBarChart").call(this.xAxis);
    this.yAxis.scale(this.state.yScale);
    d3.select("#yAxisBarChart").call(this.yAxis);

    // because of an animation code for bars here
    d3.select("#bars")
      .selectAll("rect")
      .data(this.state.bars)
      .attr("y", (d) => d.y)
      .transition() // this animates whatever comes after
      .attr("height", (d) => d.height)
      .attr("fill", (d) => d.fill);
  }

  componentDidMount() {
    const brush = d3
      .brushX()
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom]
      ])
      .on("end", () => {
        if (d3.event.selection) {
          const [minX, maxX] = d3.event.selection;
          const range = [
            this.state.xScale.invert(minX),
            this.state.xScale.invert(maxX)
          ];
          this.props.updateRange(range);
        } else {
          this.props.updateRange([]);
        }
      });
    d3.select("#brush").call(brush);
  }

  render() {
    return (
      <svg width={width} height={height}>
        <g id="bars">
          {this.state.bars.map((d, i) => (
            <rect key={i} x={d.x} width="2" />
          ))}
        </g>
        <g
          id="xAxisBarChart"
          transform={`translate(0 ${height - margin.bottom})`}
        />
        <g id="yAxisBarChart" transform={`translate(${margin.left}, 0)`} />
        <g id="brush" /> {/* the order of tags matters */}
      </svg>
    );
  }
}

export default BarChart;
