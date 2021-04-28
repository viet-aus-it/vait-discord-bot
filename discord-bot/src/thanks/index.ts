import { Message } from 'discord.js';
import { PrismaClient } from '.prisma/client';

const thanks = async (msg: Message, prisma: PrismaClient) => {
  if (msg.content.indexOf('-rep') === 0) {
    const discordUser = msg.author;
    let user = await prisma.user.findUnique({ where: { id: discordUser.id } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: discordUser.id },
      });
    }

    msg.reply(`${discordUser.username}: ${user.reputation} Rep`);
  }

  if (msg.content.includes('thanks')) {
    const promises = msg.mentions.users.map(async (discordUser) => {
      let user = await prisma.user.findUnique({
        where: { id: discordUser.id },
      });
      if (!user) {
        user = await prisma.user.create({
          data: { id: discordUser.id },
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { reputation: { increment: 1 } },
      });
      console.log(updatedUser);
      msg.reply(`${discordUser.username}: ${updatedUser.reputation} Rep`);
    });
    await Promise.all(promises);
  }
};
export default thanks;

// check reputation: -rep
// thanks someone: thank/thanks @someone
