# Production Testing

Test the production Docker build locally before deploying.

## Steps

1. Create a production environment file:

```bash
cp .env.dist .env.production
```

2. Fill in the `.env.production` file. Set `POSTGRES_HOST` to `db` instead of `localhost` (the Docker network hostname).

3. Build the production image:

```bash
docker compose -f docker-compose.production.yml build bot
```

4. Start the database and bot:

```bash
docker compose -f docker-compose.production.yml up db bot
```

See [Environment Variables](../reference/05-environment-variables.md) for the full configuration reference.
