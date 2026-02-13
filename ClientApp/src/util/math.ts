export const roundUp = (value: number, unit: number) => {
  return Math.ceil(value / unit) * unit;
};

export const numberCompare = (n1: number, n2: number) => {
  return n1 < n2 ? -1 : n1 > n1 ? 1 : 0;
};