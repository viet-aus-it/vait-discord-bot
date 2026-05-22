# Environment Variables

All configuration is via environment variables in the `.env` file. Copy `.env.dist` to `.env` to get started.

> **Never commit the `.env` file.** It contains secrets and is gitignored.

## Discord Configuration

| Variable     | Required | Description                                                                            |
| ------------ | -------- | -------------------------------------------------------------------------------------- |
| `TOKEN`      | Yes      | Bot token from [Discord Developer Portal](https://discord.com/developers/applications) |
| `CLIENT_ID`  | Yes      | OAuth2 client ID                                                                       |
| `PUBLIC_KEY` | Yes      | Application public key                                                                 |
| `GUILD_ID`   | Dev only | Server ID for development command deployment                                           |

## Database

| Variable              | Required | Default      | Description                                          |
| --------------------- | -------- | ------------ | ---------------------------------------------------- |
| `POSTGRES_USER`       | Yes      | `postgres`   | PostgreSQL username                                  |
| `POSTGRES_PASSWORD`   | Yes      | `postgres`   | PostgreSQL password                                  |
| `POSTGRES_HOST`       | Yes      | `localhost`  | Database host (`db` for Docker production)           |
| `POSTGRES_DB`         | Yes      | `discordbot` | Database name                                        |
| `PORT`                | Yes      | `5432`       | PostgreSQL port                                      |
| `DATABASE_URL`        | Yes      | Composed     | Full connection URL (auto-composed from above)       |
| `DIRECT_DATABASE_URL` | Yes      | Composed     | Direct connection URL (same as DATABASE_URL locally) |

## Observability (Production Only)

| Variable        | Required  | Description                          |
| --------------- | --------- | ------------------------------------ |
| `AXIOM_TOKEN`   | Prod only | [Axiom](https://axiom.co/) API token |
| `AXIOM_DATASET` | Prod only | Axiom dataset name                   |
| `AXIOM_ORG_ID`  | Prod only | Axiom organisation ID                |

## OpenTelemetry

| Variable                      | Required          | Default            | Description                                                                                                                                               |
| ----------------------------- | ----------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ENABLE_OTEL`                 | No                | `false`            | Enable OpenTelemetry trace collection (`true` or `false`)                                                                                                 |
| `OTEL_DEBUG`                  | No                | `false`            | Enable OTel SDK diagnostic logging                                                                                                                        |
| `OTEL_SERVICE_NAME`           | No                | `vait-discord-bot` | Service name for trace attribution                                                                                                                        |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | When OTel enabled | —                  | OTLP HTTP base endpoint URL. The SDK appends signal-specific paths (`/v1/traces`, `/v1/logs`) automatically. Local dev: `http://localhost:4318` (Jaeger). |

When `ENABLE_OTEL=true` in production, `AXIOM_TOKEN` and `AXIOM_DATASET` are also required (traces and logs are exported to Axiom via the OTel pipeline). When `ENABLE_OTEL=false`, logs fall back to the direct `@axiomhq/winston` transport.

## System

| Variable   | Required | Default              | Description                                                                                                                                                                                                                                               |
| ---------- | -------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV` | No       | `development`        | Environment mode (`development`, `production`, or `test`). Drives environment-specific validation: `GUILD_ID` is required in development, Axiom variables are required in production, and `OTEL_EXPORTER_OTLP_ENDPOINT` is required when OTel is enabled. |
| `TZ`       | No       | `Australia/Brisbane` | Timezone for the bot process                                                                                                                                                                                                                              |
