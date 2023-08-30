// Reference: https://date-fns.org/v2.29.3/docs/parse
import { getUnixTime, parse } from 'date-fns';

// Reference: https://date-fns.org/v2.29.3/docs/parse
export const DAY_MONTH_YEAR_FORMAT = 'dd/MM/yyyy';
export const DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT = 'dd/MM/yyyy HH:mm';

export const convertDateToEpoch = (input: string) => {
  const date = parse(input, DAY_MONTH_YEAR_HOUR_MINUTE_FORMAT, new Date());
  return getUnixTime(date);
};

export const getCurrentUnixTime = () => {
  return getUnixTime(new Date());
};
