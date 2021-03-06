import { json } from "d3";
import { chartDataProcessor } from "./chart/chartDataProcessor";
import { graphDataProcessor } from "./graph/graphDataProcessor";
import { chordDataProcessor } from "./chord/chordDataProcessor";
import { mapDataProcessor } from "./map/mapDataProcessor";

export const loadAndProcessData = () =>
  Promise.all([
    json(
      "https://raw.githubusercontent.com/MikeGajdos/topodata/main/uefa.topo.json"
    ),
    json(
      "https://gist.githubusercontent.com/MikeGajdos/906a9445ecdf2b86fd83433589a560e2/raw/12e5b796bc6c54eee4123b13402d4808c5ea2a72/euro.json"
    ),
  ]).then(([rawData, euroData]) => {
    
    const mapData = mapDataProcessor(rawData, euroData);
    const [chordMatrix, leaguesArray, chordTooltipROTWDataMap] =
      chordDataProcessor(euroData);
    const [
      allNodes,
      countryNodes,
      playerNodes,
      clubNodes,
      links,
      linkedByIndex,
    ] = graphDataProcessor(euroData);

    const [mostPlayersClubData, mostConnectedClubs] =
      chartDataProcessor(euroData);

    return {
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
    };
  });
