import type { AutocompleteHandler } from '../builder';
import { searchServices } from './services';

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const searchTerm = interaction.options.getString('service', true);

  const options = searchServices(searchTerm);
  interaction.respond(options);
};
