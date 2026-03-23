---
name: update-docs
description: Audit and update all project documentation to reflect recent changes
---

# Update Documentation Skill

## Purpose

Audit and update all project documentation to reflect recent code changes, ensuring docs stay in sync with the codebase.

## Trigger Condition

When user asks to:

- Update documentation
- Sync docs with recent changes
- Audit docs for accuracy
- Update README or AGENTS.md
- Check if docs are up to date

## Documentation Locations

| Location | Content | Key Sections |
|----------|---------|-------------|
| `README.md` | Project overview, quick start, tech stack | Entry point only, links to `docs/` |
| `docs/` | User-facing docs ([Diataxis](https://diataxis.fr/) framework) | Tutorials, how-to, reference, explanation |
| `AGENTS.md` | Agent control manifest | Project structure, tech stack, available skills/rules, commands |
| `.agents/rules/` | Domain-specific guidelines | Code style, patterns, commands, communication, special considerations |
| `.agents/skills/` | Task-specific toolkits | Each skill's SKILL.md |
| `.env.dist` | Environment variable reference | All required/optional env vars |

## Workflow

### Step 1: Identify Recent Changes

Determine the scope of changes to review:

```bash
# If user specifies a range, use it. Otherwise, find recent changes:
git log --oneline --since="2 weeks ago"
git log --oneline HEAD~20..HEAD

# Get a summary of what changed:
git diff --stat <range>
```

Ask the user for a commit range if not provided. Default to the last 20 commits or 2 weeks, whichever is smaller.

### Step 2: Categorise Changes

Group changes by their documentation impact:

- **New features**: New commands, subcommands, event handlers
- **Config changes**: New env vars, Docker changes, build config
- **Architecture changes**: New modules, directory restructuring, new dependencies
- **Command changes**: New scripts, modified workflows
- **Skill/rule changes**: New or modified agent skills and rules

For each category, note which documentation locations are affected using the mapping:

| Change Type | Docs to Check |
|-------------|---------------|
| New command | `docs/reference/01-commands-list.md`, `docs/explanation/02-bot-commands-design.md`, `docs/index.md` |
| New env var | `.env.dist`, `docs/reference/05-environment-variables.md` |
| New dependency | `README.md`, `AGENTS.md` (tech stack), `docs/reference/02-pnpm-scripts.md` |
| New pnpm script | `docs/reference/02-pnpm-scripts.md`, `.agents/rules/commands.md` |
| Database change | `docs/reference/04-database-schema.md` |
| New skill/rule | `AGENTS.md` (available skills/rules) |
| Test changes | `docs/explanation/03-testing-strategy.md`, `.agents/rules/patterns.md` |
| Project structure change | `docs/reference/03-project-structure.md`, `AGENTS.md` |

### Step 3: Audit Each Location

For each affected documentation file:

1. **Read the doc file** to understand its current content
2. **Read the relevant source files** to understand what the doc should say
3. **Identify gaps**: missing features, outdated instructions, wrong commands, stale references
4. **Identify removals**: documented features that no longer exist

Pay special attention to:
- Command names and options (do they match the source?)
- pnpm script names (do they match `package.json`?)
- File paths (do they still exist?)
- Environment variables (match `.env.dist`?)
- Project structure trees (match actual directory layout?)

### Step 4: Apply Updates

Update each affected file following these principles:

- **Preserve existing style**: Match the tone, formatting, and structure of each file
- **Minimal changes**: Only update what is actually out of date
- **Australian/British English**: Consistent spelling per `.agents/rules/communication.md`
- **No fluff**: Concise, factual documentation
- **Diataxis compliance**: Do not mix content types (no how-to steps in reference docs)

### Step 5: Verify

Review all changes for:

- All file paths referenced in docs exist
- All commands referenced in docs are valid
- All env vars in `.env.dist` are documented and vice versa
- Cross-references between docs are consistent
- `docs/index.md` links are current and complete

```bash
# Verify commands still work
pnpm typecheck
pnpm lint
```

## Checklist

- [ ] Commit range identified and all changes reviewed
- [ ] Changes categorised by documentation impact
- [ ] `README.md` checked (entry point still accurate)
- [ ] `docs/` files checked and updated for affected topics
- [ ] `docs/index.md` links verified
- [ ] `AGENTS.md` checked: project structure, tech stack, skills, rules, commands
- [ ] `.agents/rules/` checked for affected rules
- [ ] `.agents/skills/` checked for affected skills
- [ ] `.env.dist` checked against actual env var usage
- [ ] Cross-references between docs are consistent
- [ ] Australian/British English spelling throughout
- [ ] No stale file paths or broken references

## Documentation Framework

The `docs/` directory follows the [Diataxis](https://diataxis.fr/) framework. Each document must serve **one** primary purpose:

| Type | Purpose | Question It Answers |
|------|---------|---------------------|
| **Tutorial** | Learning-oriented guided experience | "Can you teach me to...?" |
| **How-to guide** | Goal-oriented steps | "How do I...?" |
| **Reference** | Information-oriented lookup | "What is...?" |
| **Explanation** | Understanding-oriented discussion | "Why...? Can you tell me about...?" |

Current `docs/` structure:

- **`tutorials/developers/`**: `01-your-first-slash-command`, `02-database-backed-feature`, `03-testing-your-command`
- **`tutorials/users/`**: `01-getting-started`, `02-using-bot-commands`
- **`how-to/`**: `01-quick-start`, `02-development-workflow`, `03-deploy-commands`, `04-production-testing`, `05-contributing`
- **`reference/`**: `01-commands-list`, `02-pnpm-scripts`, `03-project-structure`, `04-database-schema`, `05-environment-variables`
- **`explanation/`**: `01-architecture`, `02-bot-commands-design`, `03-testing-strategy`

When updating docs, do not mix content types. Move how-to steps out of reference docs, move reference tables out of explanation docs, etc.

### External Linking Rule

Every mention of an external tool, framework, pattern, or standard must include a hyperlink on first mention per document.

## Notes

- This skill audits and updates existing documentation. It does not create new `docs/` files unless a major new feature clearly warrants one.
- When in doubt about whether a change needs documentation, err on the side of updating.
- The `docs/` files are numbered for ordering. If a new file is needed, pick the next available number.
- Run this skill after completing a feature, before cutting a release, or whenever the user suspects docs have drifted.
