# Database Schema

[Prisma](https://www.prisma.io/) models and relationships for the VAIT Discord Bot. The schema is defined in `prisma/schema.prisma`.

## Models

### User

Core user model, keyed by Discord user ID.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Discord user ID |
| `reputation` | Int | Reputation score (default: 0) |

**Relations:** `thankTo` (ReputationLog[]), `thankBy` (ReputationLog[]), `reminders` (Reminder[]), `referralCodes` (ReferralCode[])

### ReputationLog

Audit trail for reputation changes.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Auto-generated CUID |
| `fromUserId` | String (FK) | User who initiated the change |
| `toUserId` | String (FK) | User whose reputation changed |
| `operation` | Json | Operation details (increment/decrement/set) |
| `createdAt` | DateTime | Timestamp (default: now) |

### ReferralCode

User-submitted referral codes.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Auto-generated CUID |
| `service` | String | Service name (e.g. "Uber", "GoGet") |
| `code` | String | The referral code or link |
| `expiry_date` | DateTime | When the code expires |
| `guildId` | String | Discord server ID |
| `userId` | String (FK) | Owner's Discord user ID |

### Reminder

Scheduled reminders for users.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Auto-generated CUID |
| `userId` | String (FK) | Owner's Discord user ID |
| `onTimestamp` | Int | Unix timestamp for when to fire |
| `message` | String | Reminder message content |
| `guildId` | String | Discord server ID |

**Indexes:** `id`, `userId`

### ServerChannelsSettings

Per-server configuration.

| Field | Type | Description |
|-------|------|-------------|
| `guildId` | String (unique) | Discord server ID |
| `reminderChannel` | String? | Channel ID for reminder notifications |
| `autobumpThreads` | String[] | Thread IDs to automatically bump |
| `aocKey` | String? | Advent of Code session key |
| `aocLeaderboardId` | String? | Advent of Code leaderboard ID |

### AocLeaderboard

Cached Advent of Code leaderboard data.

| Field | Type | Description |
|-------|------|-------------|
| `guildId` | String (unique) | Discord server ID |
| `result` | Json | Cached leaderboard response |
| `updatedAt` | DateTime | Last cache update time |

## Entity Relationship Diagram

```
User 1──* ReputationLog (fromUserId)
User 1──* ReputationLog (toUserId)
User 1──* Reminder
User 1──* ReferralCode

ServerChannelsSettings (standalone, keyed by guildId)
AocLeaderboard (standalone, keyed by guildId)
```
