type ParseInvalidDateError = ['INVALID_DATE'];
type ParseExpiredDateError = ['EXPIRED_DATE'];
type ParseDateSuccess = ['SUCCESS', Date];

type ParseDatePayload =
  | ParseDateSuccess
  | ParseInvalidDateError
  | ParseExpiredDateError;

export const parseDate = (date?: string): ParseDatePayload => {
  const thirtyDaysInFuture = new Date();
  thirtyDaysInFuture.setDate(thirtyDaysInFuture.getDate() + 30);

  const [dd, mm, yyyy] =
    date?.split('/') || thirtyDaysInFuture.toLocaleDateString('09/06/2022');
  const jsFormatDate = `${mm}/${dd}/${yyyy}`;

  if (Number.isNaN(Date.parse(jsFormatDate)) === true) return ['INVALID_DATE'];

  const parsedDate = new Date(jsFormatDate);
  if (parsedDate <= new Date()) return ['EXPIRED_DATE'];

  return ['SUCCESS', parsedDate];
};
