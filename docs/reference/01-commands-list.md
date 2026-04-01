# Bot Commands

Complete reference of all VAIT Discord Bot commands.

## Member Commands

### Fun

| Command              | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `/8ball <question>`  | Ask the magic 8ball a question and receive a random response        |
| `/allcap <text>`     | Transform text into spaced uppercase format                         |
| `/cowsay <text>`     | Generate ASCII art of a cow speaking your text                      |
| `/disclaimer en\|vi` | Display a humorous disclaimer in English or Vietnamese              |
| `/hit @username`     | Deal random damage to up to 10 tagged members                       |
| `/insult @username`  | Generate a random insult targeting a specific user                  |
| `/mock`              | Reformat the previous message in alternating case (sPoNgEbOb style) |
| `/powerball`         | Generate random Powerball numbers                                   |
| `/qotd`              | Display an inspirational quote of the day                           |

### Utilities

| Command               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `/weather <location>` | Display current weather conditions for a location |
| `/aoc-leaderboard`    | Show the server's Advent of Code leaderboard      |

### Reputation

| Command                   | Description                             |
| ------------------------- | --------------------------------------- |
| `/rep check`              | Check your current reputation score     |
| `/rep give @user`         | Give 1 reputation point to another user |
| `/rep leaderboard [size]` | Display the top users by reputation     |

### Referral

| Command                      | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `/referral new`              | Add a referral code with service name, code, and expiry date |
| `/referral random <service>` | Retrieve a random referral code for a service                |

### Reminders

| Command                             | Description                        |
| ----------------------------------- | ---------------------------------- |
| `/reminder on <date> <message>`     | Set a reminder for a specific date |
| `/reminder in <duration> <message>` | Set a reminder after a duration    |
| `/reminder list`                    | List your active reminders         |
| `/reminder update <id>`             | Update an existing reminder        |
| `/reminder delete <id>`             | Delete a reminder                  |

## Admin/Mod Commands

| Command                                       | Description                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `/rep take @user`                             | Remove 1 reputation point from a user                                                      |
| `/rep set @user <amount>`                     | Set a user's reputation to a specific number                                               |
| `/server-settings honeypot-channel <channel>` | Set a honeypot channel — users who post in it are banned and their recent messages deleted |
| `/server-settings reminder-channel <channel>` | Set the channel for reminder notifications                                                 |
| `/server-settings aoc-settings <key> <id>`    | Configure Advent of Code leaderboard tracking                                              |
| `/autobump-threads`                           | Manage automatic thread bumping                                                            |
| `/removeuserbyrole <role>`                    | Remove users by role from threads                                                          |

## Context Menu Commands

Currently none registered. See [Bot Commands Design](../explanation/02-bot-commands-design.md) for the context menu command pattern.
