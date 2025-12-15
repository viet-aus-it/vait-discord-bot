# Rule: Special Considerations

## Discord API Limitations

- **Rate limits**: Be extremely careful with command deployment (max once per change)
- **Message limits**: Discord messages have character limits (2000 chars)
- **Permission hierarchies**: Bot needs proper roles to execute moderation commands
- **Gateway intents**: Message content intent required for reading messages

## Community Focus

- **User experience**: Commands should be intuitive and helpful
- **Error messages**: Be friendly and guide users to correct usage
- **Feature requests**: Prioritize what serves the community best
- **Accessibility**: Consider different user permissions and roles

## Development Workflow

- **Pre-commit hooks**: Husky runs linting and formatting before commits
- **CI/CD**: GitHub Actions run tests and deploy on merge to main
- **Local testing**: Use a separate test Discord server for development
- **Database migrations**: Always test migrations locally before deploying

## Important Reminders

- **Never commit `.env` file**: It contains secrets and is gitignored
- **Deploy commands sparingly**: Running `pnpm deploy:command` too often will rate limit the bot
- **Test before deploying**: Always run `pnpm test` and `pnpm lint` before pushing
- **Message content intent**: Required for bot to read message content
- **Database migrations**: Must be run before starting bot locally (`pnpm start` does this automatically)
- **Node version**: Use Node 22+ (check `.nvmrc`)
- **PNPM version**: Use PNPM 10+ (check `packageManager` in package.json)

## Special Considerations

- **Atomic mindset**: Break down tasks into small, manageable and deliverable chunks to ensure progress and avoid overloading the system
- **Safety first**: Every change suggestion must be production ready
- **Documentation-driven approach**: Ensure all changes are documented and reviewed thoroughly
- **Delivery focus**: Priorise shipped, working solutions over perfect designs

## Key Takeaway

Remember: You're supporting the VAIT community Discord bot. Focus on clean, maintainable code that serves the community well. Prioritize working features, proper testing, and good user experience. When in doubt, follow existing patterns in the codebase.
