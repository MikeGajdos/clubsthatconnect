import {
  select,
  selectAll,
  geoPath,
  geoMercator,
  zoom,
  each,
  join,
  min,
} from "d3";

function getMapScale(width, height) {
  // known size of CT image for given scale
  const baseScale = 800;
  const baseWidth = 1400;
  const baseHeight = 760;
  const scale1 = (baseScale * width) / baseWidth;
  const scale2 = (baseScale * height) / baseHeight;
  return min([scale1, scale2]);
}

export const choroplethMap = (selection, props) => {
  const {
    dataGeo,
    colorScale,
    width,
    height,
    centerX,
    centerY,
    selectedCountry,
    selectedColorValue,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  } = props;

  const mapScale = getMapScale(width, height);
  const CT_coords = [14.41854, 50.073658];

  const projection = geoMercator().fitSize([width, height], dataGeo);
  projection.center(CT_coords).scale(mapScale).translate([centerX, centerY]);

  const pathGenerator = geoPath().projection(projection);

  const gUpdate = selection
    .selectAll("g")
    .attr("class", ".sphere")
    .data([null]);
  const gEnter = gUpdate.enter().append("g").attr("class", "update");
  const g = gUpdate.merge(gEnter);

  gEnter
    .append("path")
    .attr("class", "sphere")
    .attr("d", pathGenerator({ type: "Sphere" }))
    .merge(gUpdate.select(".sphere"))
    .attr("opacity", selectedColorValue ? 0.5 : 1)
    .attr("width", width);
  // selection.call(
  //   zoom()
  //     .extent([
  //       [0, 0],
  //       [width, height],
  //     ])
  //     .scaleExtent([1, 8])
  //     .on("zoom", (event) => {
  //       zoomed(event);
  //     })
  // );
  // function zoomed(event) {
  //   g.attr("transform", event.transform);
  // }

  const countryPaths = g.selectAll(".country").data(dataGeo);
  const countryPathsEnter = countryPaths
    .enter()
    .append("path")
    .attr("class", "country");
  countryPaths
    .merge(countryPathsEnter)
    .attr("d", pathGenerator)
    .attr("pointer-events", selectedColorValue ? "none" : "all")
    .attr("fill", (d) =>
      d.properties.value === 0
        ? "white"
        : colorScale(d.properties.leagueCategory)
    )
    .attr("opacity", (d) =>
      !selectedColorValue || selectedColorValue === d.properties.leagueCategory
        ? 1
        : 0.1
    )

    .on("mouseover", function (event, d) {
      onMouseEnter(event, d);
    })
    .on("mouseleave", function (event, d) {
      onMouseLeave(event, d);
    });

  // Labels
  const countryLabels = g
    .selectAll("text")
    .data(dataGeo)
    .join("text")
    .attr("class", "country-label")
    .text(function (d) {
      return `${d.properties.name}  `;
    })
    .attr("x", function (d) {
      if (d.properties.name === "Russia")
        return projection([37.618423, 55.751244])[0];
      if (d.properties.name === "Norway")
        return projection([10.757933, 55.751244])[0];
    })
    .attr("y", function (d) {
      if (d.properties.name === "Russia")
        return projection([37.618423, 59.911491])[1];
      if (d.properties.name === "Norway")
        return projection([10.757933, 59.911491])[1];
    })

    .attr("transform", function (d) {
      if (d.properties.name === "Norway" || d.properties.name === "Russia")
        return null;
      return "translate(" + pathGenerator.centroid(d) + ")";
    })

    .attr("dx", function (d) {
      if (d.properties.name === "France") return "3em";
      if (d.properties.name === "Wales") return "-2em";

      return "0em";
    })
    .attr("dy", function (d) {
      if (d.properties.name === "France") return "-4.5em";
      if (d.properties.name === "Serbia") return "-1em";
      if (d.properties.name === "Kosovo") return "0.32em";
      return "0em";
    })
    .attr("fill", function (d) {
      return d.properties.value > 20 ? "white" : "black";
    })
    .attr("opacity", (d) =>
      !selectedColorValue || selectedColorValue === d.properties.leagueCategory
        ? 1
        : 0
    );
};
