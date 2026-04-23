# Release Agent — local development

How to spin up the release-agent end-to-end against a linked enterprise
backend, with impact metrics and MCP integrations working.

## One-time setup

### 1. Clone enterprise next to OSS

```bash
# expected layout
~/work/
  unleash/             # this repo
  unleash-enterprise/  # sibling checkout
```

### 2. Link OSS into enterprise

Enterprise depends on OSS as an npm package. To consume your local changes,
use `yarn link` (Yarn 4):

```bash
cd ~/work/unleash-enterprise
yarn link ~/work/unleash
```

Known wart: Yarn 4 will refuse the link if peer versions differ. If you
hit `Cannot link unleash-server into ... dependency semver@X conflicts with
parent dependency semver@Y`, bump the conflicting pin in
`unleash-enterprise/package.json` to match OSS, e.g.
`"semver": "^7.7.4"`.

### 3. Build OSS once so the dist exists

Enterprise imports compiled OSS via the package's `exports` field
(`./dist/lib/server-impl.js`), so you must build after any OSS change:

```bash
cd ~/work/unleash
yarn build:backend
```

### 4. Slack app (optional but common)

To use the Slack MCP integration you need a Slack app with a bot user:

1. https://api.slack.com/apps → create app.
2. **OAuth & Permissions** → add Bot Token Scopes:
   `chat:write`, `channels:history`, `channels:read`, `reactions:write`,
   `users:read`, `users.profile:read`.
3. **Install to Workspace** (or **Reinstall** after scope changes — this is
   a common failure mode; `missing_scope` errors at runtime almost always
   mean you forgot to reinstall).
4. Copy the `xoxb-...` Bot User OAuth Token.
5. Grab your `T...` team ID from a Slack URL
   (`https://app.slack.com/client/T0123ABCD/...`).
6. In Slack, `/invite @yourbot` into every channel you want it to post in,
   or you'll get `not_in_channel`.

## Running

### Rebuild OSS (whenever OSS changes)

```bash
cd ~/work/unleash
yarn build:backend
```

### Start enterprise

```bash
cd ~/work/unleash-enterprise && \
NODE_OPTIONS="--preserve-symlinks" \
UNLEASH_EXPERIMENTAL_RELEASE_AGENT=true \
ANTHROPIC_API_KEY="sk-ant-..." \
PROMETHEUS_IMPACT_METRICS_API="https://vmselect:<pw>@impact-metrics.sandbox.getunleash.io/select/2:0/prometheus" \
UNLEASH_MCP_SERVERS=demo,slack \
UNLEASH_MCP_DEMO_COMMAND=npx \
UNLEASH_MCP_DEMO_ARGS=-y,@modelcontextprotocol/server-everything \
UNLEASH_MCP_SLACK_COMMAND=npx \
UNLEASH_MCP_SLACK_ARGS=-y,@modelcontextprotocol/server-slack \
UNLEASH_MCP_SLACK_ENV=SLACK_BOT_TOKEN:xoxb-...,SLACK_TEAM_ID:T... \
yarn dev:enterprise
```

If `ANTHROPIC_API_KEY` is unset, `compileSequence` falls back to the
deterministic mock compiler — useful for UI work without burning
tokens, but the mock doesn't emit safeguards or mcp.invoke actions.

Healthy startup logs (in order):

```
DB migration: end
Unleash has started. { port: 4242 }
MCP server "demo" connected with 13 tool(s)
Slack MCP Server running on stdio
MCP server "slack" connected with 8 tool(s)
```

### Frontend

If you're using the pre-built frontend served by the backend, just hit
http://localhost:4242 in a browser. For live reload:

```bash
cd ~/work/unleash/frontend
yarn dev
```

## Configuration reference

### Required env vars

| Var | Purpose |
|-----|---------|
| `NODE_OPTIONS="--preserve-symlinks"` | Needed because enterprise resolves OSS through a symlinked node_modules (created by `yarn link`). Without this, enterprise's compiled JS won't find OSS modules. |
| `UNLEASH_EXPERIMENTAL_RELEASE_AGENT=true` | Enables the flag gate. Without this, the `/api/admin/release-agent/*` endpoints return 404 and the sidebar item is hidden. |
| `ANTHROPIC_API_KEY` | Credential for the Anthropic-backed compiler. If unset, the service falls back to the deterministic mock compiler (no safeguards, no MCP). |

### Impact metrics (optional)

| Var | Purpose |
|-----|---------|
| `PROMETHEUS_IMPACT_METRICS_API` | URL of the Prometheus instance (supports basic-auth user:pass@). Required for safeguards and for the compile-time metric catalog. If unset, the catalog returns empty and asking for a safeguard returns a clarification telling the user to configure a metric first. |

### MCP servers (optional)

The release-agent can schedule MCP tool calls as part of a rollout. MCP
servers are discovered from env vars at boot; the executor holds long-lived
stdio connections for the lifetime of the process.

| Var | Purpose |
|-----|---------|
| `UNLEASH_MCP_SERVERS` | Comma-separated list of server names, e.g. `demo,slack`. Empty/unset = no MCP. |
| `UNLEASH_MCP_<NAME>_COMMAND` | Executable to spawn for that server, usually `npx`. |
| `UNLEASH_MCP_<NAME>_ARGS` | Comma-separated argv, e.g. `-y,@modelcontextprotocol/server-slack`. |
| `UNLEASH_MCP_<NAME>_ENV` | Comma-separated `KEY:VALUE` pairs merged into the server's environment. Credentials live here. |

The server name (e.g. `slack`) is case-insensitive in env-var lookup but is
the exact string the agent must put in `payload.server` — keep it
lowercase for clarity.

### Dropping MCP entirely

Remove `UNLEASH_MCP_SERVERS` and the related `UNLEASH_MCP_*` vars. Existing
sequences that include `mcp.invoke` actions will fail at fire time with
"MCP invoker not configured" (or "server X not configured on this
instance"), which is surfaced as a red `failed` chip on the step.

## Things that bite

### Stale OSS build

Enterprise imports from `unleash/dist`, **not** `unleash/src`. If you edit
OSS code and restart enterprise without running `yarn build:backend`,
nothing changes. There's no warning — you just see old behavior.

### Frontend types live in OSS

If the backend adds a field (say, to `CompiledSequencePreview`), the
frontend type has to be updated by hand too — there's no codegen hook for
`useReleaseAgentApi.ts` or `useReleaseAgentSequences.ts`. Grep those two
files when changing shapes.

### DB check constraints

`scheduled_actions.action_type` has a CHECK constraint. When adding a new
action type you need a migration that drops and re-adds the constraint
with the new value. See
`src/migrations/20260422143000-add-mcp-invoke-action-type.js` for the
pattern.

### Slack scopes are scope-stale until reinstall

Adding a scope to the Slack app in its settings does NOT grant it to an
existing install. You must **Reinstall to Workspace**. Runtime
`missing_scope` errors are almost always this.

### Channel IDs, not names

The `@modelcontextprotocol/server-slack` tools take `channel_id`
(`C0123...`), not `#channel-name`. Tell the agent the ID or paste it into
the prompt. The bot also has to be a member of the channel.

### Ordering: strategy.create must precede setEnabled(true)

Enabling a feature-environment with no strategies auto-creates a 100%
rollout. The compiler and the service-side validator both enforce that
the first `strategy.create` for a feature fires strictly before any
`setEnabled(true)` for the same feature.

### Cancellation and safeguards

- Cancelling a sequence marks pending actions (including `mcp.invoke`) as
  `skipped`. Already-executed actions are permanent (a Slack message sent
  stays sent).
- Safeguards created alongside a sequence outlive the sequence. Cleanup
  is manual.

## Verifying end-to-end

With enterprise running, open http://localhost:4242, navigate to
**Releases** → **Draft release**, and try a prompt:

```
Canary my-feature-flag to 10%, 50%, and 100% over the next 5 minutes.
When we hit 50%, post "🚀 my-feature-flag is now at 50%" to Slack channel
C0AUHV2AQ2J. When we reach 100%, post "✅ my-feature-flag fully rolled
out" to C0AUHV2AQ2J.
```

You should see 4–6 steps in the plan, two of which are
`Notify via slack.slack_post_message → C0AUHV2AQ2J`. Commit the plan; at
each ramp tick, the Slack channel should receive a message.

## Files you'll most often touch

| File | What's in it |
|------|-------------|
| `src/lib/features/release-agent/anthropic-compiler.ts` | Tool schema (what the model can emit), system prompt (how it behaves), user-message catalog injection. |
| `src/lib/features/release-agent/release-agent-service.ts` | Orchestration, validation, provider injection. Adding a new action type means a new `validatePayload` case. |
| `src/lib/features/release-agent/scheduled-action.ts` | Discriminated-union type for actions. |
| `unleash-enterprise/src/release-agent/scheduled-action-executor.ts` | The runtime that fires each action. One case per `actionType`. |
| `unleash-enterprise/src/release-agent/mcp/mcp-client-registry.ts` | Env-driven MCP client bootstrap + `invoke` / `listServers`. |
| `unleash-enterprise/src/util/setup-services.ts` | Where enterprise wires the MCP registry, safeguards commit participant, and impact-metrics provider into the OSS service. |
| `frontend/src/component/releaseAgent/author/*` | The Draft page (hero landing + chat composer + preview with inline editing). |
| `frontend/src/component/releaseAgent/sequences/SequencesPage.tsx` | The Releases overview page and the detail dialog. |
