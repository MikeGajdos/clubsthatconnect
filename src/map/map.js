import { scaleOrdinal, select, selectAll } from "d3";
import { mapColorLegend } from "./mapColorLegend";
import { choroplethMap } from "./choroplethMap";
import { theme } from "../utils/theme";

export const map = (
  mapParams,
  dataGeo,
  width,
  height,
  selectedColorValue,
  selectedCountry
) => {
  const { mapTooltip, mapContainer, svg, choroplethMapG, colorLegendG } =
    mapParams;

  let dims = mapContainer.node().getBoundingClientRect();
  width = dims.width;
  height = dims.height;
  // svg.attr("viewBox", [0, 0, width, height]);
  const centerX = width / 2.7;
  const centerY = height / 1.7;

  // Use the extracted size to set the size of an SVG element.
  svg.attr("width", width).attr("height", height);
  colorLegendG.attr(
    "transform",
    `translate(${width  - 100}, ${height - 375} )`
  );
  const colorScale = scaleOrdinal().range(theme.mapColorRange);
  const colorDomain = dataGeo.map((d) => d.properties.leagueCategory);
  colorScale.domain(colorDomain).domain(colorDomain.sort().reverse());

  colorLegendG.call(mapColorLegend, {
    colorScale,
    circleRadius: 8,
    spacing: 20,
    textOffset: 12,
    backgroundRectWidth: 100,
    onClick,
    selectedColorValue,
  });

  choroplethMapG.call(choroplethMap, {
    dataGeo,
    colorScale,
    width,
    height,
    selectedColorValue,
    selectedCountry,
    centerX,
    centerY,
    onMouseEnter,
    onMouseLeave,
  });

  function onClick(event, d) {
    selectedColorValue = d;
    map(mapParams, dataGeo, width, height, selectedColorValue, selectedCountry);
  }

  function onMouseEnter(event, d) {
    selectedCountry = d.properties.name;

    selectAll(".country").transition().duration(200).attr("opacity", 0.5);
    select(event.currentTarget).transition().duration(200).attr("opacity", 1);

    mapTooltip
      .style("opacity", 1)
      .style("visibility", "visible")
      .style("top", event.pageY + 15 + "px")
      .style("left", event.pageX + 4 + "px")
      .html(`${selectedCountry}<br>${d.properties.value} players`);
  }

  function onMouseLeave(event, d) {
    selectedCountry = event.currentTarget;
    selectAll(".country").transition().duration(200).attr("opacity", 1);
    select(event.currentTarget).transition().duration(200).attr("opacity", 1);
    mapTooltip.style("opacity", 0).style("visibility", "hidden");
  }
};
