import { rollup } from "d3";
export const chordDataProcessor = (data) => {
  let leagueNamesArray;
  let matrix;
  let leagueFlowNodes = [];
  let tempArray = data.map((country) => country.country);
  tempArray.push("ROTW");
  leagueNamesArray = tempArray;

  const leaguesList = rollup(
    data.map((country) => [...country.players]).flat(),
    (v) => v.length,
    (d) => d.league
  );

  data.forEach((country) => {
    const league = rollup(
      country.players,
      (v) => v.length,
      (d) => d.league
    );

    const leagueNodes = Array.from(league).map((el) => {
      return {
        source: country.country,
        target: leagueNamesArray.includes(el[0]) ? el[0] : "ROTW",
        value: el[1],
      };
    });

    leagueFlowNodes.push(leagueNodes);
  });
  const flatLeagueFlowNodes = leagueFlowNodes.flat();

  const index = new Map(leagueNamesArray.map((name, i) => [name, i]));
  matrix = Array.from(index, () => new Array(leagueNamesArray.length).fill(0));
  for (const { source, target, value } of flatLeagueFlowNodes)
    matrix[index.get(source)][index.get(target)] += value;

  const euroParticipantLeagues = [...leagueNamesArray];
  euroParticipantLeagues.splice(-1);
  const rotwMiddle = new Map(
    Array.from(leaguesList).filter(
      (league) => !euroParticipantLeagues.includes(league[0])
    )
  );
  const chordTooltipROTWDataMap = Array.from(rotwMiddle)
    .map((entry) => ({
      country: entry[0],
      value: entry[1],
    }))
    .sort((a, b) => b.value - a.value);

  return [matrix, leagueNamesArray, chordTooltipROTWDataMap];
};
