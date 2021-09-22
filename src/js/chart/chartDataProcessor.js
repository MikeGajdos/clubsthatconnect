import { rollup, group } from "d3";

export const chartDataProcessor = (data) => {
  //DATA FORMATTING

  const playersArray = data
    .map((country) => {
      const modNationality = country.players.map((player) => ({
        ...player,
        nationality: country.country,
      }));
      return modNationality;
    })
    .flat();

  const clubGroupMap = rollup(
    playersArray,
    (v) => v.length,
    (d) => d.club,
    (d) => d.nationality
  );

  const connectedClubData = Array.from(clubGroupMap, ([key, value]) => ({
    key,
    value: value.size,
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const clubMap = rollup(
    playersArray,
    (v) => v.length,
    (d) => d.club
  );

  const clubData = Array.from(clubMap, ([key, value]) => ({
    key,
    value,
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  function stringMod(string) {
    let clubName = string.split(" ");
    if (clubName.length > 1 && clubName[1] === "Dortmund") {
      clubName[0] = "B.";
    }
    if (clubName[0] === "Internazionale") {
      clubName[0] = "Inter Milan";
    }
    if (clubName.length > 1 && clubName[0].length > 8) {
      clubName[0] = clubName[0].slice(0, 3);
    }
    if (clubName.length > 1 && clubName[1] === "Mönchengladbach") {
      clubName[1] = "GB";
    }
    return clubName.join(" ");
  }

  clubData.forEach((club) => {
    club.key = stringMod(club.key);
  });

  connectedClubData.forEach((club) => {
    club.key = stringMod(club.key);
  });

  return [clubData, connectedClubData];
};
