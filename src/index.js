import { select } from "d3";
import { debounce } from "lodash-es";
import { loadAndProcessData } from "./js/loadAndProcessData";
// import LocomotiveScroll from "locomotive-scroll";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
import Splitting from "splitting";
import { headerAnimation } from "./js/animations/animations";
import { map } from "./js/map/map";
import { drawChart } from "./js/chart/drawChart";
import { drawGraph } from "./js/graph/drawGraph";
import { drawChord } from "./js/chord/chord";
gsap.registerPlugin(ScrollTrigger);

let revealText = document.querySelectorAll(".reveal-text");
let results = Splitting({ target: revealText, by: "lines" });
results.forEach((splitResult) => {
  const wrappedLines = splitResult.lines
    .map(
      (wordsArr) => `
      <span class="line"><div class="words">
        ${wordsArr
          .map(
            (word) => `${word.outerHTML}<span class="whitespace"> 
       </span>`
          )
          .join("")}
      </div></span>`
    )
    .join("");
  splitResult.el.innerHTML = wrappedLines;
});


let selectedColorValue;
let selectedCountry;
let dataGeo;
let width;
let height;
let matrix;
let leagueNamesArray;
let chordWidth;
let chordHeight;
let rotwLeagues;
let graphSvgWidth;
let graphSvgHeight;
let graphMargin = 40;
let dotSize = 25;
let graphVieboxParam;
let graphBoundingBox;
let chart1Data;
let chart2Data;
const chartLabelOffsets = {
  xAxisLabelOffset: 60,
  yAxisLabelOffset: 30,
  chartLabelTitleOffset: 10,
};
const chartMargins = {
  top: 30,
  bottom: 80,
  right: 40,
  left: 60,
};

const initMapParams = () => {
  const svg = select("#map").append("svg").attr("class", "svgMap");
  const choroplethMapG = svg.append("g").attr("class", "map");
  const colorLegendG = svg.append("g");
  const mapTooltip = select("body").append("div").attr("class", "mapTooltip");
  const mapContainer = select("#map");
  return {
    mapTooltip,
    mapContainer,
    svg,
    choroplethMapG,
    colorLegendG,
  };
};

const initChordParams = () => {
  const chordDiv = document.getElementById("chord");
  const chordTooltip = select("body")
    .append("div")
    .attr("class", "chordTooltip");
  const chordCard = select(".chordSection")
    .append("div")
    .attr("class", "chordCard");
  chordWidth = chordDiv.getBoundingClientRect().width;
  chordHeight = chordDiv.getBoundingClientRect().height;
  const chordVieBox = Math.min(chordWidth,chordHeight)
  // chordHeight = chordWidth
  const chordContainerSvg = select("#chord")
    .append("svg")
    .attr("class", "chordSvg")
    .attr("width", "100%")
    .attr("height", "100%")
   
    // .attr("preserveAspectRatio", "xMidYMid")
    .attr("viewBox", [-chordVieBox/2 , -chordVieBox / 2, chordVieBox, chordVieBox]);
    // .attr("viewBox", [-chordWidth / 2, -chordHeight / 2, chordWidth, chordHeight]);
    // .attr("viewBox", `0 0  ${chordWidth} ${chordHeight}`);

  const chordSvgInner = chordContainerSvg
    .append("g")
    .attr("class", "chordGroupInner")
    // .attr("transform", `translate(${chordWidth / 2}, ${chordHeight / 2})`);
  const chordSvgOuter = chordContainerSvg
    .append("g")
    .attr("class", "chordGroupOuter")
    // .attr("transform", `translate(${chordWidth / 2}, ${chordHeight / 2})`);

  return {
    chordDiv,
    chordTooltip,
    chordCard,
    chordSvgInner,
    chordSvgOuter,
    chordContainerSvg,
  };
};

const initGraphParams = () => {
  const graphDiv = document.getElementById("graph");
  graphSvgWidth = graphDiv.getBoundingClientRect().width;
  graphSvgHeight = graphDiv.getBoundingClientRect().height;
  graphVieboxParam = graphSvgHeight;
  graphBoundingBox = graphSvgHeight - 40;
  const graphSvg = select("#graph")
    .append("svg")
    .attr("class", "graphSvg")
    .attr("width", "100%")
    .attr("height", "100%")
    // .attr("preserveAspectRatio", "xMidYMid")
    .attr("viewBox", [-20, 0, graphVieboxParam,graphVieboxParam]);

  const graphGroupContainer = graphSvg
    .append("g")
    .attr("class", "graphGroupContainer")
    // .attr("transform", `translate(${graphMargin},${graphMargin} )`);

  const countryNodesCircle = graphGroupContainer
    .append("circle")
    .attr("r", graphBoundingBox / 2)
    .attr("cx", graphBoundingBox / 2)
    .attr("cy", graphBoundingBox / 2)
    .attr("fill", "none");
  let defs = graphGroupContainer.append("defs");

  return {
    graphSvg,
    graphGroupContainer,
    countryNodesCircle,
    defs,
  };
};

const initChart1Params = () => {
  const chartSvg = select("#mostPlayersChart")
    .append("svg")
    .attr("class", "chartSVG")
    .attr("height", "100%")
    .attr("width", "100%");
  // INITIAL GRAPH SET UP
  const chartGroup = chartSvg
    .append("g")
    .attr("transform", `translate(${chartMargins.left}, ${chartMargins.top})`);

  let defs = chartGroup.append("defs");
  var gradient = defs
    .append("linearGradient")
    .attr("id", "svgGradient")
    .attr("gradientTransform", "rotate(-70)")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "100%");
  gradient
    .append("stop")
    .attr("class", "start")
    .attr("offset", "0%")
    .attr("stop-color", "rgba(11, 63, 131,0.8)")
    .attr("stop-opacity", 1);
  gradient
    .append("stop")
    .attr("class", "end")
    .attr("offset", "20%")
    .attr("stop-color", "rgba(66, 228, 131, 1")
    .attr("stop-opacity", 1);

  const XAxisGroup = chartGroup.append("g").attr("class", "axis axis--x");
  const YAxisGroup = chartGroup.append("g").attr("class", "axis axis--y");

  const yAxisLabel = "Number of Players";
  const xAxisLabel = "Clubs";
  const chartTitle = "Clubs with most players ";

  const xLabel = chartGroup
    .append("text")
    .attr("class", "xAxisLabel")
    .attr("text-anchor", "middle");
  const yLabel = chartGroup.append("text").attr("class", "yAxisLabel");
  const chartTitleLabel = chartGroup
    .append("text")
    .attr("class", "titleAxisLabel")
    .attr("text-anchor", "middle");

  return {
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
  };
};

const initChart2Params = () => {
  const chartSvg = select("#mostConnectedChart")
    .append("svg")
    .attr("class", "chartSVG")
    .attr("height", "100%")
    .attr("width", "100%");
  // INITIAL GRAPH SET UP
  const chartGroup = chartSvg
    .append("g")
    .attr("transform", `translate(${chartMargins.left}, ${chartMargins.top})`);

  const XAxisGroup = chartGroup.append("g").attr("class", "axis axis--x");
  const YAxisGroup = chartGroup.append("g").attr("class", "axis axis--y");

  const yAxisLabel = "Number of Nationalities";
  const xAxisLabel = "Clubs";
  const chartTitle = "Clubs which connect the most Countries ";

  const xLabel = chartGroup
    .append("text")
    .attr("class", "xAxisLabel")
    .attr("text-anchor", "middle");
  const yLabel = chartGroup.append("text").attr("class", "yAxisLabel");
  const chartTitleLabel = chartGroup
    .append("text")
    .attr("class", "titleAxisLabel")
    .attr("text-anchor", "middle");

  return {
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
  };
};

const mapParams = initMapParams();
const chordParams = initChordParams();
const graphParams = initGraphParams();
const chart1Params = initChart1Params();
const chart2Params = initChart2Params();
headerAnimation();

loadAndProcessData().then(
  ({
    mapData,
    chordMatrix,
    leaguesArray,
    chordTooltipROTWDataMap,
    allNodes,
    countryNodes,
    playerNodes,
    clubNodes,
    links,
    linkedByIndex,
    mostPlayersClubData,
    mostConnectedClubs,
  }) => {
    dataGeo = mapData;
    matrix = chordMatrix;
    leagueNamesArray = leaguesArray;
    rotwLeagues = chordTooltipROTWDataMap;
    chart1Data = mostPlayersClubData;
    chart2Data = mostConnectedClubs;
    map(mapParams, dataGeo, width, height, selectedColorValue, selectedCountry);
    drawChord(
      chordParams,
      leagueNamesArray,
      matrix,
      chordWidth,
      chordHeight,
      rotwLeagues
    );
    drawGraph(
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
    );
    drawChart(chart1Params, chart1Data, chartMargins, chartLabelOffsets);
    drawChart(chart2Params, chart2Data, chartMargins, chartLabelOffsets);
  }
);

window.addEventListener("resize", function () {
  map(mapParams, dataGeo, width, height, selectedColorValue, selectedCountry);
  drawChart(chart1Params, chart1Data, chartMargins, chartLabelOffsets);
  drawChart(chart2Params, chart2Data, chartMargins, chartLabelOffsets);
});
// ScrollTrigger.addEventListener("refresh", () => scroller.update());
// ScrollTrigger.refresh();

var body = document.body,
  html = document.documentElement;

var webpageheight = Math.max(
  body.scrollHeight,
  body.offsetHeight,
  html.clientHeight,
  html.scrollHeight,
  html.offsetHeight
);

console.log(webpageheight);
