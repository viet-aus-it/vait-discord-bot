# Rule: Communication Style

## General Principles

- **Concise but friendly**: Informative with a collaborative tone
- **Code-focused**: Emphasize technical solutions over lengthy explanations
- **Structured language**: Use bullet points or short, clearly separated paragraphs
- **Thoughtful caveats**: "Totally get that...", "Just flagging that...", "Not suggesting this as a blocker..."
- **Balance clarity with pragmatism**: Avoid over-explaining
- **Engineering-oriented vocabulary**: "infra", "pipelines", "ownership", "RFC", "productionised", "alignment"
- **Practical**: Focus on what works for the community
- **Matter-of-fact tone**: Avoid hype or dramatic emphasis

## For Code/Technical Discussions

- Reference specific file paths with line numbers (e.g. `src/utils/logger.ts:45`)
- Cite libraries' (e.g. Discord.js, Prisma...) documentation when relevant
- Emphasise architecture decisions and modular boundaries
- Explain trade-offs clearly
- Focus on testable, atomic changes with clear intent
- Consider deliver pragmatism alongside technical rigour

## For Documentation

- **Mandatory**: All project documentation MUST follow the [Diataxis](https://diataxis.fr/) framework
  - **Tutorials** (`docs/tutorials/`): Learning-oriented, step-by-step walkthroughs for newcomers
  - **How-to guides** (`docs/how-to/`): Task-oriented, practical recipes for specific goals
  - **Reference** (`docs/reference/`): Information-oriented, factual lookup material
  - **Explanation** (`docs/explanation/`): Understanding-oriented, context and design rationale
- Each document serves ONE Diataxis purpose, never mix categories
- Documentation lives in `docs/` under the appropriate category directory
- Lead with context and audience awareness
- Keep it concise and actionable
- Use code examples where helpful
- Cross-reference related docs using relative markdown paths
- Every external tool or framework mentioned must include a hyperlink on first mention per document
- When adding a new feature, update the relevant docs in `docs/`
- Update `docs/index.md` when adding new doc files
- Use Markdown with clean formatting

## For Issue Tracking

- Use GitHub issues for bugs and feature requests
- Follow issue templates
- Link related PRs and issues
- Be specific about reproduction steps
- Focus on clear intent, avoid overly prescriptive instructions
- Encourage atomic, decoupled stories for easier review and delivery

## Writing Style (Strictly Enforced)

- **Always use commas instead of em dashes** - Never use em dashes under any circumstances
- **Australian/British English**: "optimise" not "optimize", "colour" not "color"
- **Clarity and structure**: Bullet points, light markdown, short paragraphs
- **Uncertainty phrases**: "just flagging...", "not a blocker, but...", "might be worth considering..."
- **AVOID**:
  - Hype language or salesy tone
  - Deep nesting in structure
  - Em dashses (prefer commas instead)
  - Overly technical jargon
  - Unnecessary complexity

## Output Expectations

- **Structured responses**: Use bullet points, clear headings
- **Technical accuracy**: Reference discord.js v14 API, TypeScript best practices
- **Actionable advice**: Provide concrete next steps
- **Risk awareness**: Flag potential issues (rate limits, breaking changes)
- **Code examples**: Show working code snippets when helpful
- **Australian spelling and phrasing**: Use consistent Australian English spelling and phrasing where appropriate
- **Diátaxis-aligned documentation**: When suggesting documentation approaches

## Formatting and Style Guidelines

- Use dashes for lists in markdown documents instead of literal dots, especially in commit messages
