import { rollup } from "d3";

export const graphDataProcessor = (data) => {
  // COUNTRY NODES
  const countryNodes = data.map((country) => {
    return {
      name: country.country,
      type: "nationNode",
      parent: "",
      color: "green",
      nationSize: 10,
      vagina: 0,
    };
  });

  //  CLUB NODES

  const allPlayerArray = data.flatMap((country) => country.players);

  const allClubsMap = rollup(
    allPlayerArray,
    (v) => v.length,
    (d) => d.club
  );

  const filteredSortedTeamMap = new Map(
    [...allClubsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .filter((club) => club[1] > 1)
  );

  const clubNamesSet = new Set([...filteredSortedTeamMap.keys()]);

  const clubNodes = Array.from(clubNamesSet).map((club) => {
    return {
      name: club,
      type: "clubNode",
      size: filteredSortedTeamMap.get(club),
      color: "red",
      vagina: 55,
      center: 1,
    };
  });

  // CLUB LINKS

  const clubLinks = allPlayerArray
    .filter((player) => clubNamesSet.has(player.club))
    .map((player) => {
      return {
        source: player.club,
        linkDistance: 6,
        linkStrenght: 0.2,
        target: player.name,
      };
    });

  // PLAYER NODE & PLAYER LINKS

  let playerNodes = [];
  let playerLinks = [];

  data.forEach((country) => {
    const nationParent = country.country;
    const eachCountryPlayersNodes = country.players
      .filter((player) => clubNamesSet.has(player.club))
      .map((player) => {
        return {
          name: player.name,
          type: "playerNode",
          parent: nationParent,
          color: "blue",
          vagina: -19,
          center: 0.5,
        };
      });
    const eachCountryPlayerLinks = eachCountryPlayersNodes.map((player) => {
      return {
        source: player.name,
        target: player.parent,
        linkDistance: 20,
        linkStrenght: 1.5,
      };
    });
    playerNodes.push(...eachCountryPlayersNodes);
    playerLinks.push(...eachCountryPlayerLinks);
  });

  const allNodes = [...countryNodes, ...playerNodes, ...clubNodes];

  const links = [...playerLinks, ...clubLinks];
  let linkedByIndex = {};

  return [allNodes, countryNodes, playerNodes, clubNodes, links, linkedByIndex];
};
