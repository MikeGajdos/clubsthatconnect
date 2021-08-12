export const mapColorLegend = (selection, props) => {
  const {
    colorScale,
    circleRadius,
    spacing,
    textOffset,
    backgroundRectWidth,
    onClick,
    selectedColorValue,
  } = props;

  const labels = [
    "0",
    "1",
    "1-10",
    "10-20",
    "20-30",
    "30-70",
    "70-90",
    "90-100",
    "> 100",
  ].reverse();

  const backgroundRect = selection.selectAll("rect").data([null]);
  const n = colorScale.domain().length;
  backgroundRect
    .enter()
    .append("rect")
    .merge(backgroundRect)
    .attr("x", -circleRadius * 2)
    .attr("y", -circleRadius )
    .attr("rx", circleRadius * 2)
    .attr("width", backgroundRectWidth)
    .attr("height", spacing * n + circleRadius * 2 + 15)
    .attr("fill", "white")
    .attr("opacity", 0.8);

    // const labelGroup = selection.selectAll(".legendLabel").data([null]);
    // labelGroup.enter().append("text").text("No. of players") .attr("font-size", "1em")
    // .attr("dy", "0.32em")
    // .attr("x", textOffset);

  const groups = selection
    .selectAll(".tick")
    .data(colorScale.domain().reverse());
  const groupsEnter = groups.enter().append("g").attr("class", "tick");
  groupsEnter
    .merge(groups)
    .attr("transform", (d, i) => `translate(0, ${i * spacing + 15 })`)
    .attr("opacity", (d) =>
      !selectedColorValue || d === selectedColorValue ? 1 : 0.2
    )
    .on("click", function (event, d) {
      onClick(event, d === selectedColorValue ? null : d);
    });
  groups.exit().remove();

  groupsEnter
    .append("circle")
    .merge(groups.select("circle"))
    .attr("class", "mapLegend-circle")
    .attr("r", circleRadius)
    .attr("fill", colorScale);

  groupsEnter
    .append("text")
    .merge(groups.select("text"))
    .attr("class", "mapLegend-text")
    .text((d, i) => `${labels[i]} `)
    .attr("font-size", "1em")
    .attr("dy", "0.32em")
    .attr("x", textOffset);
};
