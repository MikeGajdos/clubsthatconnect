import images from "../../images/*.svg";
import {
  select,
  scaleLinear,
  scaleSqrt,
  extent,
  forceCenter,
  forceCollide,
  forceManyBody,
  forceLink,
  forceSimulation,
  forceRadial,
} from "d3";

const graphBBoxscale = scaleLinear().domain([-1, 1]);
const graphRadiusScale = scaleSqrt().range([3, 25]);

export const drawGraph = (
  graphParams,
  graphSvgWidth,
  graphSvgHeight,
  graphMargin,
  dotSize,
  graphVieboxParam,
  graphBoundingBox,
  allNodes,
  countryNodes,
  playerNodes,
  clubNodes,
  links,
  linkedByIndex
) => {
  const { graphSvg, graphGroupContainer, countryNodesCircle, defs } =
    graphParams;
  const outerCirclePoints = [];
  outerCirclePoints.push(pointsOnCircle(countryNodes.length));
  // UPDATE SCALES
  graphBBoxscale.range([0, graphBoundingBox]);
  graphRadiusScale.domain(
    extent(clubNodes, function (d) {
      return d.size;
    })
  );
  // DEFINE CENTER FORCE
  const centerX = graphBoundingBox / 2;
  const centerY = graphBoundingBox / 2;
  //   ASSIGN DEFS
  defs
    .selectAll(".nations-pattern")
    .data(countryNodes)
    .enter()
    .append("pattern")
    .attr("class", "nations-pattern")
    .attr("id", function (d) {
      return d.name.replace(" ", "_");
    })
    .attr("height", "100%")
    .attr("width", "100%")
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr("height", 1)
    .attr("width", 1)
    .attr("preserveAspectRatio", "none")
    .attr("xlink:href", function (d) {
      return `${images[d.name.replace(" ", "_")]}`;
    });

  // NODES AND LINKS
  const link = graphGroupContainer
    .append("g")
    .selectAll(".line")
    .data(links)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.3)
    .attr("class", "link")
    .attr("stroke-width", 1);

  var pointGroupWrapper = graphGroupContainer.append("g");

  var pointGroup = pointGroupWrapper
    .selectAll(".dot")
    .data(allNodes)
    .enter()
    .append("g")
    .attr("class", "dot");

  var point = pointGroup
    .append("circle")
    .attr("class", "pica")
    .attr("r", function (d) {
      return d.type === "nationNode"
        ? dotSize
        : d.type === "clubNode"
        ? graphRadiusScale(d.size)
        : 3;
    })
    .attr("fill", function (d) {
      return d.type === "nationNode"
        ? `url(#${d.name.replace(" ", "_")})`
        : d.type === "playerNode"
        ? "red"
        : "rgba(66, 228, 131, 1)";
    });

  var graphTextElement = pointGroup
    .append("text")
    .attr("class", "textElement")
    .attr("dx", 0)
    .attr("dy", ".35em")
    .text(function (d) {
      return d.name;
    })
    .style("stroke", "gray")
    .style("visibility", function (d) {
      return d.type === "clubNode" && d.size > 8 ? "visible" : "hidden";
    });

  const simulation = forceSimulation(allNodes)
    .force(
      "charge",
      forceManyBody().strength(function (node) {
        return node.vagina;
      })
    )
    .force("fixedCountryNodesForce", fixedNodesForce)

    .force("center", forceCenter(centerX, centerY).strength(1))
    .force(
      "collision",
      forceCollide().radius(function (node) {
        return node.type === "clubNode" ? 20 : null;
      })
    )
    .force(
      "link",
      forceLink(links)
        .id((node) => node.name)
        .distance((link) => link.linkDistance)
        .strength((link) => link.linkStrenght)
    )
    .force(
      "r",
      forceRadial(
        function (node) {
          return node.type === "playerNode" ? graphBoundingBox / 2 - 400 : null;
        },
        graphBoundingBox / 2,
        graphBoundingBox / 2
      )
    );

  function fixedNodesForce() {
    const filteredNodes = allNodes.filter((node) => node.type === "nationNode");
    for (var i = 0, n = filteredNodes.length; i < n; ++i) {
      let current_node = filteredNodes[i];
      current_node.fx = graphBBoxscale(outerCirclePoints[0][i].x);
      current_node.fy = graphBBoxscale(outerCirclePoints[0][i].y);
    }
  }

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    point
      .attr("cx", (d) => {
        return (d.x = Math.max(
          dotSize,
          Math.min(graphBoundingBox - dotSize, d.x)
        ));
      })
      .attr("cy", (d) => {
        return (d.y = Math.max(
          dotSize,
          Math.min(graphBoundingBox - dotSize, d.y)
        ));
      });

    graphTextElement
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      });
  });

  for (let i = 0; i < allNodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
  }

  links.forEach((link) => {
    linkedByIndex[`${link.source.index},${link.target.index}`] = 1;
  });

  pointGroup
    .on("mouseenter", function (event, d) {
      if (d.type !== "clubNode") return null;
      point.style("opacity", function (o) {
        return neighboring(d, o) | neighboring(o, d)
          ? 1
          : o.type === "nationNode"
          ? 1
          : 0;
      });
      link.style("opacity", function (o) {
        return (d.index == o.source.index) | (d.index == o.target.index)
          ? 1
          : 0;
      });
      graphTextElement.style("visibility", function (o) {
        return neighboring(d, o) | neighboring(o, d) ? "visible" : "hidden";
      });
    })
    .on("mouseleave", function (event, d) {
      point.style("opacity", 1);
      link.style("opacity", 1);
      graphTextElement.style("visibility", function (d) {
        return d.type === "clubNode" && d.size > 8 ? "visible" : "hidden";
      });
    });

  function neighboring(a, b) {
    return linkedByIndex[a.index + "," + b.index];
  }
};

function pointsOnCircle(num) {
  var angle = (2 * Math.PI) / num;
  var points = [];
  var i = 0;
  for (var a = 0; a < 2 * Math.PI; a += angle) {
    i++;
    points.push({
      x: Math.cos(a),
      y: Math.sin(a),
      rotation: a,
    });
  }
  return points;
}
