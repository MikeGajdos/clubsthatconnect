import images from "../images/*.svg";

import {
  scaleOrdinal,
  select,
  selectAll,
  chordDirected,
  ribbonArrow,
  descending,
  arc,
  range,
} from "d3";
import { chordColorRange } from "../utils/theme";

function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return range(0, d.value, step).map(function (value) {
    return { value: value, angle: value * k + d.startAngle };
  });
}

const chordColorScale = scaleOrdinal().range(chordColorRange);

export const drawChord = (
  chordParams,
  leagueNamesArray,
  matrix,
  chordWidth,
  chordHeight,
  rotwLeagues
) => {
  const {
    chordDiv,
    chordTooltip,
    chordCard,
    chordSvgInner,
    chordSvgOuter,
    chordContainerSvg,
  } = chordParams;

  const chordInnerRadius = Math.min(chordWidth, chordHeight) * 0.5 - 100;
  const chordOuterRadius = chordInnerRadius + 10;

  chordColorScale.domain(leagueNamesArray);
  const res = chordDirected()
    .padAngle(12 / chordInnerRadius)
    .sortSubgroups(descending)
    .sortChords(descending)(matrix);

  // add the groups on the inner part of the circle
  const outerCircleGroup = chordSvgOuter
    .selectAll("g")
    .data(res.groups)
    .join("g")
    .attr("class", "chordCountries");

  outerCircleGroup
    .append("path")
    .attr("class", ".bostockDicks")
    .attr("fill", (d) => chordColorScale(leagueNamesArray[d.index]))
    .style("stroke", "black")
    .attr(
      "d",
      arc().innerRadius(chordInnerRadius).outerRadius(chordOuterRadius)
    );

  outerCircleGroup
    .append("text")
    .each((d) => (d.angle = (d.startAngle + d.endAngle) / 2))
    .attr("font-size", "1.5vmin")
    .attr("dy", "0.35em")
    .attr("class", "chordText")
    .attr(
      "transform",
      (d) => `
      rotate(${(d.angle * 180) / Math.PI - 90})
      translate(${chordOuterRadius + 10})
      rotate(90) `
    )
    .attr("text-anchor", "middle")
    .text((d) => {
      if (leagueNamesArray[d.index] === "Czech Republic") return "Czech Rep.";
      if (leagueNamesArray[d.index] === "North Macedonia")
        return "N. Macedonia";
      return leagueNamesArray[d.index];
    });

  // Add the links between groups
  const ribbonGroup = chordSvgInner
    .selectAll("g")
    .data(res)
    .join("g")
    .attr("class", "ribbonGroup");

  ribbonGroup
    .append("path")
    .attr("class", "ribbonPath")
    .attr(
      "d",
      ribbonArrow()
        .radius(chordInnerRadius - 3)
        .padAngle(1 / chordInnerRadius)
    )
    .attr("fill", (d) => {
      return chordColorScale(leagueNamesArray[d.target.index]);
    })
    .style("mix-blend-mode", "multiply")
    .on("mouseover", function (event, d, i) {
      selectAll(".ribbonPath").attr("opacity", 0);
      select(event.currentTarget).attr("opacity", 1);
    })
    .on("mouseleave", function (event, d, i) {
      selectAll(".ribbonPath").attr("opacity", 1);
      select(event.currentTarget).attr("opacity", 1);
    });
  ribbonGroup
    .append("title")
    .attr("class", "chordTitle")
    .text(
      (d) =>
        `${d.source.value} ${
          leagueNamesArray[d.source.index]
        } players play in ${leagueNamesArray[d.target.index]} `
    );

  chordContainerSvg
    .selectAll(".chordCountries")
    .on("mouseenter", function (event, d) {
      const country = leagueNamesArray[d.index];
      const homeTotal = matrix[d.index][d.index];
      const trinity = [...matrix[d.index]];
      trinity.splice(d.index, 1, 0);
      const foreignIndex = trinity.indexOf(Math.max(...trinity));
      const foreignTrinity = matrix.map((row) => row[d.index]);
      foreignTrinity.splice(d.index, 1, 0);
      const foreignTrinityIndex = foreignTrinity.indexOf(
        Math.max(...foreignTrinity)
      );
   
      chordCard.style("visibility", "visible").html(
        `${
          country !== "ROTW"
            ? `<div class="chordCard-inner">
                  <div class="chordCard-header">
                          <div class="chordCard-image">
                            <img src="${
                              images[country.replace(" ", "_")]
                            }" alt="${country}flag" />
                          </div>
                          <h1 class="chordCard-title">${country}</h1>
                        </div>
                        <div class="chordCard-content">
                            <div class ="nationSguad-wrapper>
                                  <h2 class="nationSguad">${country}'s team</h2>
                                  <ul class="nationSguad-list">
                                    <li class="nationSguad-item">Home : ${homeTotal}</li>
                                    <li class="nationSguad-item">
                                      Abroad : ${26 - homeTotal}
                                      <ul>
                                        <li>${leagueNamesArray[foreignIndex]} : ${
                      matrix[d.index][foreignIndex]
                    }</li>
                                      </ul>
                                    </li>
                                  </ul>
                              </div>
                          <div class="nationLeague-wrapper>
                                <h2 class="nationLeague">${country}'s league</h2>
                                ${
                                  d.value - 26 - homeTotal === 0
                                    ? ` <ul class="nationLeague-list">
                                  <li class="nationLeague-item">${
                                    country !== "Wales"
                                      ? `No Foreign Players </br> play in ${country}'s league`
                                      : "See footnote at map section"
                                  }
                                  </li>`
                                    : ` <ul class="nationLeague-list">
                                  <li class="nationLeague-item">
                                    Foreign Players: ${d.value - 26 - homeTotal}
                                    <ul>
                                      <li>${leagueNamesArray[foreignTrinityIndex]}: ${
                                        foreignTrinity[foreignTrinityIndex]
                                      }</li>
                                    </ul>
                                  </li>
                                </ul>`
                                }
                          </div>
                        </div>
                  <div/>`

                  : `<div class="chordCard-inner" >
                          <div class="chordCard-header rotw">
                                 
                                  <h1 class="chordCard-title">The Rest of the World</h1>
                          </div>
                          <div class="chordCard-content rotw">
                                 
                                  <ul class="nationSguad-list rotw">
                                    ${rotwLeagues
                                      .map(
                                        (league) =>
                                          `<li class="nationSguad-item">${league.country} : ${league.value}</li>`
                                      )
                                      .join("")}
                                  </ul>
                          </div>
                        <div/>
                          `
        }`
      );
    })
    .on("mouseleave", function (event, d) {
      chordCard.style("visibility", "hidden");
     
    
    });
};


// <div class="rotw">
// ${country}
// </div>

// <h2 class="nationSguad">List of country leagues <br>outisde Euro participating nations</h2>
