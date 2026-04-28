export const normalizeThreshold = (value) => {
  if (value === null || value === undefined || value === "") return undefined;
  return Math.min(Math.max(Number(value), 0), 1);
};
