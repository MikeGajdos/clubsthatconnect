import { json, rollup } from "d3";
import { feature } from "topojson-client";
import { mapLegendGrouping } from "../utils/helpers";

export const mapDataProcessor = (rawtopoJSONdata, data) => {
  const topoJSONdata = rawtopoJSONdata;
  

  const sortedData = rollup(
    data.map((country) => [...country.players]).flat(),
    (v) => v.length,
    (d) => d.league
  );

  const sortedArray = Array.from(sortedData, ([key, value]) => ({
    key,
    value,
  })).sort((a, b) => b.value - a.value);

  const euroDataMap = new Map([
    ...sortedArray.map((obj) => [obj.key, obj.value]),
  ]);

  const euroLeagueMap = new Map(
    sortedArray.map((obj) => [obj.key, mapLegendGrouping(obj.value)])
  );

 

  const countries = feature(topoJSONdata, topoJSONdata.objects.europe);
  
  let mapData = countries.features;
  // let mapData = countries.features.filter(
  //   (feature) => feature.properties.continent === "Europe" || feature.id
  // );
  mapData.forEach((d) => {
    const computedProps = {
      value: euroDataMap.get(d.properties.name) || 0,
      leagueCategory: euroLeagueMap.get(d.properties.name) || "Category 9",
    };
    Object.assign(d.properties, computedProps);
  });

  return mapData;
};
