import { Message } from 'discord.js';
import { thankUser } from './thankUser';
import { checkReputation } from './checkReputation';

const thanks = async (msg: Message) => {
  await checkReputation(msg);
  await thankUser(msg);
};

export default thanks;
