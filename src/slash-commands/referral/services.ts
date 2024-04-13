import OZBARGAIN_SERVICES from './generated/ozbargain-services.json';

const CUSTOM_SERVICES: string[] = ['everyday extra (woolworths & big w)', 'warp terminal', 'arc browser'];

export const services: string[] = [...new Set([...OZBARGAIN_SERVICES, ...CUSTOM_SERVICES])].sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1));

const options = services.map((service) => ({
  name: service,
  value: service,
}));

export const searchServices = (term: string) => {
  const cleanedTerm = term?.trim().toLowerCase();

  return options.filter((service) => (cleanedTerm ? service.name.includes(cleanedTerm) : true)).slice(0, 25);
};
