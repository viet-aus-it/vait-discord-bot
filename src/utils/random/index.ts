import { ColorResolvable } from 'discord.js';

export const getRandomIntInclusive = (min: number, max: number) => {
  const intMin = Math.ceil(min);
  const intMax = Math.floor(max);
  return Math.floor(Math.random() * (intMax - intMin + 1) + min);
};

export const getUniqueRandomIntInclusive = (numbers: number[], min: number, max: number) => {
  let number = getRandomIntInclusive(min, max);
  while (numbers.includes(number)) {
    number = getRandomIntInclusive(min, max);
  }
  return number;
};

export const getRandomBoolean = (): boolean => {
  const randomBinaryNumber = Math.floor(Math.random() * 2);
  return Boolean(randomBinaryNumber);
};

export const getRandomRGBValues = (): ColorResolvable => {
  return [
    getRandomIntInclusive(0, 255),
    getRandomIntInclusive(0, 255),
    getRandomIntInclusive(0, 255),
  ];
};
