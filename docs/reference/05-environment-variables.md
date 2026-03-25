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

## Observability

### OpenTelemetry

OpenTelemetry integration is optional. To enable, set the `ENABLE_OTEL` environment variable to `true`.

| Variable                      | Required | Default                             | Description                          |
| ----------------------------- | -------- | ----------------------------------- | ------------------------------------ |
| `ENABLE_OTEL`                 | No       | 'false'                             | Enable OpenTelemetry Instrumentation |
| `OTEL_DEBUG`                  | No       | 'false'                             | Enable OpenTelemetry Debug logs      |
| `OTEL_SERVICE_NAME`           | No       | `vait-discord-bot`                  | Service name for OTEL traces         |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | When OTEL enabled | —                | OTLP exporter endpoint               |

### OpenObserve (Local Development)

| Variable                 | Required | Description                                                                         |
| ------------------------ | -------- | ----------------------------------------------------------------------------------- |
| `OPENOBSERVE_AUTH_TOKEN` | Dev only | API key from [OpenObserve](https://openobserve.ai/) console (format: `Basic <key>`) |

**Local setup:**

1. Start the OpenObserve container: `docker compose up -d openobserve`
2. Open `http://localhost:5080` and login with `root@example.com` / `Complexpass#123`
3. Navigate to **Ingestion** → **Custom** → **OTEL Collector** and copy the `Authorization` header value
4. Set `OPENOBSERVE_AUTH_TOKEN` in your `.env` file with the copied value

### Axiom (Production Only)

| Variable        | Required  | Description                          |
| --------------- | --------- | ------------------------------------ |
| `AXIOM_TOKEN`   | Prod only | [Axiom](https://axiom.co/) API token |
| `AXIOM_DATASET` | Prod only | Axiom dataset name                   |
| `AXIOM_ORG_ID`  | Prod only | Axiom organisation ID                |

## System

| Variable | Required | Default              | Description                  |
| -------- | -------- | -------------------- | ---------------------------- |
| `TZ`     | No       | `Australia/Brisbane` | Timezone for the bot process |
