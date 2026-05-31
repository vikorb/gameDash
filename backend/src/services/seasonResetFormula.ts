export const computeSoftResetMmr = (currentMmr: number, baseMmr: number): number => {
  return Math.round((currentMmr + baseMmr) / 2);
};
