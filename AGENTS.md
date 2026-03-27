# VAIT Discord Bot (Team VAIT)

## Universal Agents Control Manifest

All agents must emulate `.agents/` support even when the runtime does not load those files automatically. Treat this document as the control manifest: it lists the available metadata, where to read it, and how to compose it during a conversation.

## About the Project

You are working on the VAIT Discord Bot, a community-driven bot for the Viet-Aus IT Discord server. The project values:

- **Community-first**: Building features that serve the VAIT community
- **Code quality**: Clean, maintainable, and well-tested code
- **Collaboration**: Open-source contributions from community members
- **Pragmatic solutions**: Shipping working features over perfect designs

## Role & Technical Context

- **Domain**: Discord bot for community engagement, utilities, and moderation
- **Team**: VAIT (Vietnamese Australians in Information Technology community)
- **Tech Stack**: TypeScript, Node.js 22+, discord.js v14, Prisma ORM, PostgreSQL, Vitest, MSW
- **Architecture**: Modular command-based architecture with slash commands, context menu commands, and event handlers

## Change Management Philosophy

All changes must be:

- **Atomic**: The smallest possible and logically complete unit of change
- **Safe**: Reviewed, tested, and production-ready
- **Tested**: Unit tests required for new features, integration tests for database interactions
- **Linted**: Must pass `pnpm lint` and `pnpm typecheck` before commit
- **Documented**: Clear commit messages following conventional commits pattern
- **Delivered**: Merged via pull request after review

## Project Structure

> Full layout: [`docs/reference/03-project-structure.md`](docs/reference/03-project-structure.md)

```
docs/                            # Project documentation (Diataxis framework)
.agents/
  skills/                        # Task-specific toolkits with proven workflows
  rules/                         # Domain-specific guidelines and constraints
src/                             # Application source code
test/                            # Test fixtures, mocks, and helpers
```

## Execution Protocol

1. **Always read this file first** before starting a task so you know which skills or rules to load from `.agents/`.
2. **Skills**:
   - Load a skill only if its trigger condition matches the task. Example: code review tasks must load `skills/code-review/SKILL.md`.
   - Once loaded, obey the process and output format defined inside the skill file so the final response stays consistent.
   - Skills are located in `.agents/skills/[skill-name]/SKILL.md`
3. **Rules**:
   - Rules are long-lived constraints (API guidelines, coding practices, etc.). Whenever a task touches those domains, read the matching file under `.agents/rules/`.
   - Treat these as required context: preload them before drafting any response and ensure every recommendation complies.
   - Rules are located in `.agents/rules/[rule-name].md`
4. **Response contract**:
   - Explicitly mention which skills and rules are in effect.
   - Derive findings, recommendations, or code while enforcing all loaded constraints. If conflicts arise, ask for clarification before diverging.

## Available Rules

Load these rules when working on relevant domains:

- **[commands.md](.agents/rules/commands.md)** - Complete reference of available pnpm commands
- **[code-style.md](.agents/rules/code-style.md)** - Code formatting, TypeScript conventions, project structure
- **[patterns.md](.agents/rules/patterns.md)** - Discord.js, Prisma, and testing patterns
- **[engineering-principles.md](.agents/rules/engineering-principles.md)** - Clean code, error handling, security, decision framework
- **[communication.md](.agents/rules/communication.md)** - Communication style and output expectations
- **[special-considerations.md](.agents/rules/special-considerations.md)** - Discord API limitations, community focus, important reminders

## Available Skills

Load a skill when its trigger condition matches the task:

- **[update-docs](.agents/skills/update-docs/SKILL.md)** - Audit and update documentation after code changes. Trigger: feature additions, schema changes, new commands, dependency updates, or when docs may have drifted.

## Quick Reference

### Tech Stack

See the [README](README.md) for the full tech stack.

### Essential Commands

```bash
pnpm start              # Run bot with migrations
pnpm test              # Run tests
pnpm lint              # Check code quality
pnpm deploy:command    # Deploy Discord commands (use sparingly!)
```

### Key Principles

- **Atomic changes**: Smallest logical units
- **Test coverage**: Unit and integration tests
- **Type safety**: Strict TypeScript
- **Community-first**: Serve VAIT community needs

## Rules vs. Skills at a Glance

| Aspect           | Rules                                             | Skills                                                                     |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| Purpose          | Concise written instructions covering a domain.   | Full toolkits: guidance plus reusable templates and verified workflows.    |
| Execution effort | Agent interprets and implements from scratch.     | Drop-in code, docs, and checklists shorten build time.                     |
| Complexity focus | Describes guardrails; depends on agent expertise. | Encodes battle-tested patterns for tricky or specialized scenarios.        |
| Maintenance      | Update the prose rule as policies evolve.         | Refresh the whole package (docs + sample code) when better solutions ship. |

Think of **rules** as a "manual" that keeps behavior aligned, while **skills** are the "manual + toolbox + demo video" bundle you reach for when you need a proven solution.

## Extending the Manifest

- Additional **skills** (architecture review, test planning, etc.) or **rules** (team code style, compliance requirements) can be added under the existing folders.
- Keep this file updated so future agents know when to load each artifact and how to combine them safely.

Remember: You're supporting the VAIT community Discord bot. Focus on clean, maintainable code that serves the community well. When in doubt, follow existing patterns in the codebase and refer to the relevant rules.
