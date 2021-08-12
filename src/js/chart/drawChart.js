import {
  select,
  call,
  scaleBand,
  scaleLinear,
  axisBottom,
  axisLeft,
  max,
} from "d3";

const chartXScale = scaleBand().paddingInner(0.2).paddingOuter(0.2);
const chartYScale = scaleLinear();
export const drawChart = (
  {
    chartSvg,
    chartGroup,
    xAxisLabel,
    yAxisLabel,
    chartTitle,

    XAxisGroup,
    YAxisGroup,
    xLabel,
    yLabel,
    chartTitleLabel,
  },
  chartData,
  chartMargins,
  chartLabelOffsets
) => {
  var bounds = chartSvg.node().getBoundingClientRect();
  const width = bounds.width - chartMargins.left - chartMargins.right;
  const height = bounds.height - chartMargins.top - chartMargins.bottom;

  chartXScale.rangeRound([0, width]);
  chartYScale.rangeRound([height, 0]);

  // GRAPH MODIFICATION-----DEPENDENT ON THE DATA
  chartXScale.domain(chartData.map((d) => d.key));
  chartYScale.domain([
    0,
    max(chartData, function (d) {
      return d.value;
    }),
  ]);

  const bars = chartGroup.selectAll(".bar").data(chartData);
  // UPDATE
  bars
    .attr("x", function (d) {
      return chartXScale(d.key);
    })
    .attr("y", function (d) {
      return chartYScale(d.value);
    })
    .attr("fill", "url(#svgGradient)")
    .attr("width", chartXScale.bandwidth())
    .attr("height", function (d) {
      return height - chartYScale(d.value);
    });

  // EXIT
  bars.exit().remove();

  // ENTER
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", "url(#svgGradient)")
    .attr("x", function (d) {
      return chartXScale(d.key);
    })
    .attr("y", function (d) {
      return height;
    })
    .transition()
    .duration(800)
    .delay(function (d, i) {
      return i * 100;
    })
    .attr("y", function (d) {
      return chartYScale(d.value);
    })

    .attr("width", chartXScale.bandwidth())
    .attr("height", function (d) {
      return height - chartYScale(d.value);
    });

  chartGroup
    .select(".axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(chartXScale));
  if(width > 450 ) {
    chartGroup.selectAll(".tick text").call(wrap, chartXScale.bandwidth());
  }
  else {
    chartGroup.selectAll(".tick text").attr("transform", "rotate(-40)")
    .attr("text-anchor", "end");
  }
  
  chartGroup.select(".axis--y").call(axisLeft(chartYScale));

  chartTitleLabel
    .attr("x", width / 2)
    .attr("y", `${-chartLabelOffsets.chartLabelTitleOffset}`)
    .attr("text-anchor", "middle")
    .text(chartTitle);

  xLabel
    .attr("x", width / 2)
    .attr("y", height + chartLabelOffsets.xAxisLabelOffset)
    .attr("text-anchor", "middle")
    .text(xAxisLabel);

  yLabel
    .attr(
      "transform",
      `translate( ${-chartLabelOffsets.yAxisLabelOffset}, ${
        height / 2
      }) rotate(-90)`
    )
    .attr("text-anchor", "middle")
    .text(yAxisLabel);
};

function wrap(text, width) {
  text.each(function () {
    var text = select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", `${++lineNumber * lineHeight + dy}em`)
          .text(word);
      }
    }
  });
}
