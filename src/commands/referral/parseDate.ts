type ParseInvalidDateError = ['INVALID_DATE'];
type ParseExpiredDateError = ['EXPIRED_DATE'];
type ParseDateSuccess = ['SUCCESS', Date];

type ParseDatePayload =
  | ParseDateSuccess
  | ParseInvalidDateError
  | ParseExpiredDateError;

export const parseDate = (date: string): ParseDatePayload => {
  if (Number.isNaN(Date.parse(date)) === true) return ['INVALID_DATE'];

  const parsedDate = new Date(date);
  if (parsedDate <= new Date()) return ['EXPIRED_DATE'];

  return ['SUCCESS', parsedDate];
};
