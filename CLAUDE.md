# Claude Code Instructions

Please read and follow the instructions in [AGENTS.md](./AGENTS.md) for comprehensive guidance on:

- Project architecture (backend CSR pattern, frontend React SPA)
- Development philosophy and coding standards
- ADR references for detailed conventions
- Testing and migration practices

## Quick Reference

- **Backend code**: `/src` - TypeScript/Express with CSR pattern
- **Frontend code**: `/frontend/src` - React/TypeScript with MUI
- **ADRs**: `/contributing/ADRs/` - Architectural decisions
- **Tests**: Use Vitest; run with `yarn test`

## Claude-Specific Configuration

Additional Claude Code configuration exists in `/.claude/`:
- **Agents**: Specialized agents for feature flag development
- **Commands**: Custom slash commands (`/wrap-flag`, `/list-flags`)
- **Docs**: Feature flag automation documentation
