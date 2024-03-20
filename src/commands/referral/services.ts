import { OZBARGAIN_SERVICES } from './generated/ozbargain-services';

const CUSTOM_SERVICES: string[] = ['everyday extra (woolworths & big w)'];

export const services: string[] = [...new Set([...OZBARGAIN_SERVICES, ...CUSTOM_SERVICES])];

const options = services.map((service) => ({
  name: service,
  value: service,
}));

export const searchServices = (term: string) => {
  const cleanedTerm = term?.trim().toLowerCase();

  return options.filter((service) => (cleanedTerm ? service.name.includes(cleanedTerm) : true)).slice(0, 25);
};
