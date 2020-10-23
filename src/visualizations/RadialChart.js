import React, { Component } from "react";
import * as d3 from "d3";

const width = 650;
const height = 400;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };
const axisTemps = [20, 40, 60, 80, 100];

class RadialChart extends Component {
  state = {
    slices: []
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, range, unselectedColor } = nextProps;
    if (!data) return {};

    // y temperature scale
    const maxY = d3.max(data, (d) => d.high);
    const minY = d3.min(data, (d) => d.low);
    const radiusScale = d3
      .scaleLinear()
      .domain([minY, maxY])
      .range([margin.top, height / 2 - margin.bottom]);

    const perSliceAngle = (2 * Math.PI) / data.length;
    const dateExtent = d3.extent(data, (d) => d.date);
    const angleScale = d3.scaleTime().domain(dateExtent).range([0, 360]);

    // bar color scale
    const avgExtent = d3.extent(data, (d) => d.avg).reverse();
    const colorScale = d3
      .scaleSequential()
      .domain(avgExtent)
      .interpolator(d3.interpolateRdYlBu);

    var arcGen = d3.arc();

    const slices = data.map((d, i) => {
      const isColored =
        range.length === 0 || (d.date > range[0] && d.date < range[1]);
      const path = arcGen({
        innerRadius: radiusScale(d.low),
        outerRadius: radiusScale(d.high),
        startAngle: angleScale(d.date) * perSliceAngle,
        endAngle: (angleScale(d.date) + 1) * perSliceAngle
      });
      return { path, fill: isColored ? colorScale(d.avg) : unselectedColor };
    });

    return { slices, radiusScale, angleScale };
  }

  render() {
    const { slices, radiusScale } = this.state;

    return (
      <svg width={width} height={height}>
        <g transform={`translate(${width / 2} ${height / 2})`}>
          {slices.map((d, i) => (
            <path d={d.path} fill={d.fill} key={`${i}_${d.low}`} />
          ))}
        </g>
        <g id="axes">
          {axisTemps.map((temp, i) => {
            const radius = radiusScale ? radiusScale(temp) : null;
            return (
              <circle
                cx={width / 2}
                cy={height / 2}
                r={radius}
                fill="none"
                stroke="black"
              />
            );
          })}
        </g>
      </svg>
    );
  }
}

export default RadialChart;
