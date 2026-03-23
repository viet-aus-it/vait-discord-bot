# Using Bot Commands

A walkthrough of the VAIT Bot's key command categories.

## Fun Commands

These commands keep the community chat lively.

### Cowsay

Generate ASCII art of a cow speaking your text:

```
/cowsay text: Hello VAIT!
```

### Mock Someone

Reformat the previous message in aLtErNaTiNg CaSe:

```
/mock
```

### Hit and Insult

Tag members for some playful banter:

```
/hit @username
/insult @username
```

## Reputation System

The reputation system lets community members recognise each other.

### Give Reputation

Thank someone who helped you:

```
/rep give user: @helpful-person
```

### Check Reputation

See your own or someone else's reputation:

```
/rep check
/rep check user: @someone
```

### Leaderboard

See the top community members by reputation:

```
/rep leaderboard
/rep leaderboard size: 20
```

## Referral Codes

Share and find referral codes within the community.

### Add a Referral Code

```
/referral new service: Uber code: ABC123 expiry: 2025-12-31
```

### Find a Referral Code

```
/referral random service: Uber
```

## Reminders

Set personal reminders that the bot will send you at the scheduled time.

### Set a Reminder by Date

```
/reminder on date: 2025-06-15 message: Submit tax return
```

### Set a Reminder by Duration

```
/reminder in duration: 2h message: Check the oven
```

### Manage Reminders

```
/reminder list
/reminder update id: abc123
/reminder delete id: abc123
```

## Seasonal: Advent of Code

During December, track your server's [Advent of Code](https://adventofcode.com/) progress:

```
/aoc-leaderboard
```

## Full Reference

For the complete list of all commands and options, see the [Bot Commands Reference](../../reference/01-commands-list.md).
