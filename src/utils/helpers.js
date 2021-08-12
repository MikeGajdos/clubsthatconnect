export const mapLegendGrouping = (value) => {
  if (value === 0) return "Category 9";
  if (value === 1) return "Category 8";
  if (value > 1 && value < 10) return "Category 7";
  if (value >= 10 && value < 20) return "Category 6";
  if (value >= 20 && value <= 30) return "Category 5";
  if (value > 30 && value < 70) return "Category 4";
  if (value >= 70 && value < 90) return "Category 3";
  if (value >= 90 && value < 100) return "Category 2";
  if (value > 100) return "Category 1";
};
