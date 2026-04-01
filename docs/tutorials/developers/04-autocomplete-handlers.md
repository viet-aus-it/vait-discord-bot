# Add Autocomplete to a Slash Command

Add dynamic autocomplete suggestions to a slash command option so users see filtered choices as they type.

## Prerequisites

- Completed [Build Your First Slash Command](./01-your-first-slash-command.md)
- Bot running locally with `pnpm run start`

## Step 1: Create a Data Source

Create `src/slash-commands/lookup/services.ts` with a list of options and a search function:

```typescript
const SERVICES = ['GitHub', 'GitLab', 'Bitbucket', 'Azure DevOps', 'AWS CodeCommit'].sort();

const options = SERVICES.map((service) => ({
  name: service,
  value: service,
}));

export const searchServices = (term: string) => {
  const cleaned = term?.trim().toLowerCase();
  return options.filter((s) => (cleaned ? s.name.toLowerCase().includes(cleaned) : true)).slice(0, 25);
};
```

Discord allows a maximum of 25 autocomplete choices per response.

## Step 2: Create the Autocomplete Handler

Create `src/slash-commands/lookup/lookup-autocomplete.ts`:

```typescript
import type { AutocompleteHandler } from '../builder';
import { searchServices } from './services';

export const autocomplete: AutocompleteHandler = async (interaction) => {
  const searchTerm = interaction.options.getString('service', true);
  const results = searchServices(searchTerm);
  interaction.respond(results);
};
```

See [Command Interfaces](../../reference/06-command-interfaces.md) for the `AutocompleteHandler` type reference.

## Step 3: Create the Command

Create `src/slash-commands/lookup/index.ts`:

```typescript
import { type ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../builder';
import { autocomplete } from './lookup-autocomplete';

const data = new SlashCommandBuilder()
  .setName('lookup')
  .setDescription('Look up a service')
  .addStringOption((option) => option.setName('service').setDescription('Service name').setRequired(true).setAutocomplete(true))
  .setContexts(InteractionContextType.Guild);

const execute = async (interaction: ChatInputCommandInteraction) => {
  const service = interaction.options.getString('service', true);
  await interaction.reply(`You selected: ${service}`);
};

const command: SlashCommand = {
  data,
  execute,
  autocomplete,
};

export default command;
```

The key parts:

- `.setAutocomplete(true)` on the string option enables autocomplete
- The `autocomplete` property on the `SlashCommand` object wires in the handler

## Step 4: Register and Deploy

Add to `src/slash-commands/index.ts`:

```typescript
import lookup from './lookup';

export const commands: SlashCommand[] = [
  // ... existing commands
  lookup,
];
```

```bash
pnpm run deploy:command
```

## Step 5: Test It

Open Discord and type `/lookup service:`. You should see a dropdown of all services. Type "git" — you should see only "GitHub", "GitLab" filtered in the list.

Select a service and press Enter. The bot replies with "You selected: GitHub".

## What's Next

- [External API Integration](./05-external-api-integration.md)
- The `referral` command (`src/slash-commands/referral/`) is the production example, with autocomplete wired to specific subcommands only
