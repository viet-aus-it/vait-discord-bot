import { processMessage } from './utils/messageProcessor';
import { getDiscordClient } from './clients/discord';

import ask8Ball from './commands/8ball';
import danhSomeone from './commands/danhSomeone';
import mockSomeone from './commands/mockSomeone';
import { thankUser, checkReputation } from './commands/thanks';

const { TOKEN } = process.env;
getDiscordClient({
  token: TOKEN,
})
.then(client => {
  if(!(client.user)) throw new Error('Something went wrong!')

  console.log(`Logged in as ${client.user.tag}!`);

  client.on('message', (msg) => {
    processMessage(msg, {
      prefixedCommands: {
        prefix: '-',
        commands: [
          { matcher: 'rep', fn: checkReputation },
          { matcher: '8ball', fn: ask8Ball },
          { matcher: 'mock', fn: mockSomeone },
          { matcher: 'hit', fn: (message) => danhSomeone(message, (client.user as any).id) }
        ],
      },
      keywordMatchCommands: [
        {
          matchers: ['thank', 'thanks', 'cảm ơn'],
          fn: thankUser,
        },
      ],
    });
  });
});

process.on('SIGTERM', () => process.exit());
