# Server Admin Guide

Set up and manage the VAIT Bot's admin features on your Discord server.

## Prerequisites

- Administrator permission on your Discord server
- The VAIT Bot invited to your server

## Configure Server Settings

### Set the Reminder Channel

Pick a text channel where the bot sends reminder notifications:

```
/server-settings reminder-channel channel: #reminders
```

You should see a confirmation message. From now on, all reminders broadcast to that channel.

### Set Up a Honeypot Channel

Designate a channel as a honeypot trap. Any user who posts in the honeypot channel is automatically banned and has their messages from the past hour deleted.

```
/server-settings honeypot-channel channel: #honeypot
```

You should see a confirmation message. The honeypot is active immediately — no bot restart required.

### Set Up Advent of Code Tracking

Configure your server's [Advent of Code](https://adventofcode.com/) leaderboard:

```
/server-settings aoc-settings aoc-key: YOUR_SESSION_KEY leaderboard-id: YOUR_LEADERBOARD_ID
```

Members can then use `/aoc-leaderboard` to see the server's ranking.

## Manage Thread Auto-Bumping

Keep important threads active by auto-bumping them on a schedule.

### Add a Thread

Navigate to the thread you want to keep active, then run:

```
/autobump-threads add thread: #your-thread
```

You should see a confirmation that the thread was added.

### List Auto-Bumped Threads

```
/autobump-threads list
```

You should see a list of all threads currently being auto-bumped.

### Remove a Thread

```
/autobump-threads remove thread: #your-thread
```

## Manage Reputation

### Take Reputation from a User

```
/rep take user: @someone
```

Removes 1 reputation point.

### Set a User's Reputation

```
/rep set user: @someone amount: 10
```

Sets the user's reputation to exactly 10.

## Moderation Commands

### Remove Users by Role from a Thread

Inside a thread, run:

```
/removeuserbyrole name: @role-name
```

All members with that role are removed from the thread. This only works inside threads, not in regular channels.

## Full Reference

See [Bot Commands Reference](../../reference/01-commands-list.md) for the complete list of admin and member commands.
