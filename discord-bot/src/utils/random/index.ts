export const getRandomIntInclusive = (min: number, max: number) => {
  const intMin = Math.ceil(min);
  const intMax = Math.floor(max);
  return Math.floor(Math.random() * (intMax - intMin + 1) + min);
};

export const getRandomBoolean = (): boolean => {
  const randomBinaryNumber = Math.floor(Math.random() * 2);
  return Boolean(randomBinaryNumber);
};
