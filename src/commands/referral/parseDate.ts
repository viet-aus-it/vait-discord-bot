import { parse, isValid, isAfter, isEqual } from 'date-fns';
import { DAY_MONTH_YEAR_FORMAT } from '../../utils/dateUtils';

type ParseInvalidDateError = ['INVALID_DATE'];
type ParseExpiredDateError = ['EXPIRED_DATE'];
type ParseDateSuccess = ['SUCCESS', Date];

type ParseDatePayload =
  | ParseDateSuccess
  | ParseInvalidDateError
  | ParseExpiredDateError;

export const parseDate = (date: string): ParseDatePayload => {
  const parsedDate = parse(date, DAY_MONTH_YEAR_FORMAT, new Date());

  if (!isValid(parsedDate)) return ['INVALID_DATE'];

  if (isAfter(new Date(), parsedDate) || isEqual(new Date(), parsedDate)) {
    return ['EXPIRED_DATE'];
  }

  return ['SUCCESS', parsedDate];
};
