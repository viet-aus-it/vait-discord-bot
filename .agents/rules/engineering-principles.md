# Rule: Engineering Principles (Always Apply)

## Clean Code

- **Single Responsibility**: Each function/module does one thing well
- **DRY (Don't Repeat Yourself)**: Extract common logic into utilities
- **KISS (Keep It Simple)**: Prefer simple, readable solutions over clever code
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until needed

## Error Handling

- **Use Result types**: Prefer `Ok`/`Err` from oxide.ts over throwing exceptions
- **Log errors**: Always log errors with winston logger
- **User feedback**: Provide clear error messages to Discord users
- **Graceful degradation**: Bot should continue running even if one command fails

## Security

- **Environment variables**: Never hardcode secrets, use `.env` file
- **Permission checks**: Verify user permissions before executing commands
- **Input validation**: Validate all user inputs with Zod schemas
- **Rate limiting**: Be mindful of Discord API rate limits

## Performance

- **Async/Await**: Use for all I/O operations
- **Database queries**: Optimize queries, use indexes, avoid N+1 queries
- **Caching**: Cache frequently accessed data when appropriate
- **Batch operations**: Batch database operations when possible

## Decision Framework

When evaluating technical choices, consider:

1. **Community Value**: Does this feature serve the VAIT community?
2. **Code Quality**: Is the code clean, tested, and maintainable?
3. **Performance**: Will this scale with community growth?
4. **Security**: Are we protecting user data and bot credentials?
5. **Maintainability**: Can future contributors understand and modify this?

## Code Review & Analysis Approach

- **Command structure**: Follow existing patterns in `/src/slash-commands/`
- **Type safety**: Ensure strict TypeScript compliance
- **Error handling**: Check for proper Result type usage and error logging
- **Testing**: Verify tests exist and cover edge cases
- **Documentation**: Ensure complex logic has clear explanations
- **Discord best practices**: Proper interaction handling, permission checks
