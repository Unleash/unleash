import Anthropic from '@anthropic-ai/sdk';
import type { Logger } from '../../logger.js';
import { BadDataError } from '../../error/index.js';
import type {
    CreateActionInput,
    SafeguardRequest,
} from './release-agent-service.js';
import type { MockCompileInput, MockCompileOutput } from './mock-compiler.js';

const MODEL = 'claude-sonnet-4-6';
const AGENT_VERSION = '0.1.0-anthropic';

const SYSTEM_PROMPT = `You are Unleash's Release Agent. You turn a natural-language rollout request into a concrete, deterministic, time-scheduled sequence of API calls against a single Unleash project and environment.

Rules you MUST follow:
- You always target the project, environment, and feature list the user supplies. Do not invent feature names.
- You produce an ordered list of actions, each with an absolute ISO-8601 UTC fireAt timestamp.
- Compute every fireAt relative to the supplied "now" timestamp.
- You have five action types: strategy.create, strategy.update, strategy.delete, feature_environment.setEnabled, mcp.invoke.
- strategy.create payload: { strategyName, parameters?, constraints?, variants?, segments?, title?, disabled?, sortOrder? }.
- strategy.update payload: { strategyRef: { type: "owned", sortOrder: N }, patch: { parameters?, constraints?, variants?, segments?, title?, disabled?, sortOrder? } }. You may NOT change strategyName on an update — create a new strategy instead if you need a different type.
- strategy.delete payload: { strategyRef: { type: "owned", sortOrder: N } }.
- The strategyRef's sortOrder must match the sortOrder of an earlier strategy.create in the same sequence.
- feature_environment.setEnabled payload is { enabled: boolean }.
- mcp.invoke payload: { server, tool, arguments }. "server" must be one of the names in the "Available MCP servers" section of the user message. "tool" must be one of that server's tool names. "arguments" must match the tool's inputSchema. Use mcp.invoke for notifications and side-effects ("post to Slack", "page the on-call", "send an email"). Schedule it at the same fireAt as the rollout step it accompanies — the executor will process actions in order within the minute. For mcp.invoke actions, set featureName to one of the sequence's features (the one the notification is about); if it's about multiple features, pick any one.
- Ordering rule when a sequence both creates strategies and enables the environment for the same feature: the FIRST strategy.create for that feature MUST have a fireAt strictly earlier than the fireAt of any feature_environment.setEnabled with enabled=true. Enabling an environment that has no strategies auto-creates a 100% default rollout, which would blow past a gradual rollout. A small gap of a few seconds is enough — prefer setting the setEnabled(true) a few seconds after the strategy.create, not a full minute later. The executor ticks every minute, so both actions in the same minute will fire in the correct order within that tick.
- For gradual rollouts, prefer the "flexibleRollout" strategy with numeric percentage string parameters: { rollout: "10", stickiness: "default", groupId: "<feature>" }.
- Keep the sequence small and legible. Typical rollouts have 2–5 actions per feature.
- Never produce overlapping or duplicate strategy.create for the same feature.
- If the user's instruction is ambiguous, pick a reasonable default and explain it briefly in the rationale.
- Output is committed server-side verbatim — the user has no chance to edit. Prefer caution: smaller steps, longer intervals.
- You MUST emit at least one action unless clarificationNeeded is set. An empty actions list with no clarificationNeeded is a hard error. If the prompt is unclear, either pick a sensible default rollout (e.g., 10%→50%→100% over 5 minutes) OR set clarificationNeeded.

Safeguards:
- The user's message may include an "Available impact metrics" section. These are the ONLY metrics you can reference. Do not invent metric names. Each metric has an "inferredType" field ("counter" | "gauge" | "histogram" | "summary" | "unknown") — trust it when choosing aggregationMode.
- Emit a safeguard ONLY when the user asks for a guardrail, kill-switch, abort condition, or similar ("kill it if errors spike", "stop if p95 latency climbs", "abort on 5xx").
- A safeguard on a feature automatically disables that feature-environment when the metric breaches the threshold. It does not pause the sequence itself — further scheduled actions still fire (harmlessly, since the flag is off).
- Safeguard shape: { featureName, impactMetric: { metricName, timeRange, aggregationMode, labelSelectors, source }, triggerCondition: { operator, threshold } }.
  - metricName: from the available-metrics list.
  - timeRange: one of "hour" | "day" | "week" | "month". Pick the shortest useful window; "hour" for rollouts.
  - aggregationMode: REQUIRED — never omit, never empty. You MUST choose a value from the metric's own "validAggregations" array in the available-metrics block. Any value outside that array will be rejected. If validAggregations is empty (the metric type couldn't be inferred), set clarificationNeeded and ask the user which aggregation to use.
    - Counters (validAggregations typically ["rps", "count"]): prefer "rps" when the user talks about a rate ("errors per second", "request rate", "errors spike", "5xx rate"); pick "count" for an absolute number over the window. Default to "rps" for canary rollouts — a rate threshold is what you almost always want.
    - Gauges (validAggregations typically ["avg", "sum"]): "avg" by default, or "sum" if the user clearly wants a total.
    - Histograms (validAggregations typically ["p50", "p95", "p99"]): pick based on the user's language ("p95 latency" → "p95", "median" → "p50", "tail latency" → "p99").
    - Summaries (validAggregations typically ["avg", "sum", "count"]): use the one matching user intent.
  - labelSelectors: an object whose keys are label names and values are arrays of strings. Use {} if no label filter is needed.
  - source: "internal" or "external", taken from the metric's entry in the available list.
  - operator: ">" or "<" — "error rate above N" → ">", "success rate below N" → "<".
  - threshold: a finite number.
- You may emit zero or more safeguards per sequence.

Clarification:
- If the user asks for a guardrail but the metric choice is genuinely ambiguous (multiple plausible candidates, wrong metric name, no clear match), set clarificationNeeded to a short one-sentence question and omit actions/safeguards. The user will re-prompt.
- Do NOT use clarificationNeeded for mere missing parameters you can default sensibly (threshold, time range). Pick a default and explain in rationale.
- If the user does not ask for a guardrail, do not ask about one.

You will answer by calling the propose_sequence tool exactly once.`;

const strategyRefSchema = {
    type: 'object',
    required: ['type', 'sortOrder'],
    properties: {
        type: { type: 'string', enum: ['owned'] },
        sortOrder: {
            type: 'integer',
            minimum: 0,
            description:
                'sortOrder of an earlier strategy.create action in this same sequence.',
        },
    },
    additionalProperties: false,
} as const;

const updatePatchSchema = {
    type: 'object',
    description:
        'Fields to update on the referenced strategy. strategyName is intentionally not allowed — create a new strategy instead if you need a different type.',
    properties: {
        parameters: { type: 'object', additionalProperties: true },
        constraints: { type: 'array', items: {} },
        variants: { type: 'array', items: {} },
        segments: { type: 'array', items: { type: 'integer' } },
        title: { type: 'string' },
        disabled: { type: 'boolean' },
        sortOrder: { type: 'integer', minimum: 0 },
    },
    additionalProperties: false,
} as const;

const actionSchema = {
    type: 'object',
    required: ['featureName', 'fireAt', 'actionType', 'payload', 'sortOrder'],
    properties: {
        featureName: { type: 'string' },
        fireAt: {
            type: 'string',
            description: 'Absolute ISO-8601 UTC timestamp.',
        },
        sortOrder: { type: 'integer', minimum: 0 },
    },
    oneOf: [
        {
            properties: {
                actionType: { const: 'strategy.create' },
                payload: {
                    type: 'object',
                    required: ['strategyName'],
                    properties: {
                        strategyName: { type: 'string' },
                        parameters: {
                            type: 'object',
                            additionalProperties: true,
                        },
                        constraints: { type: 'array', items: {} },
                        variants: { type: 'array', items: {} },
                        segments: { type: 'array', items: { type: 'integer' } },
                        title: { type: 'string' },
                        disabled: { type: 'boolean' },
                        sortOrder: { type: 'integer', minimum: 0 },
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            properties: {
                actionType: { const: 'strategy.update' },
                payload: {
                    type: 'object',
                    required: ['strategyRef', 'patch'],
                    properties: {
                        strategyRef: strategyRefSchema,
                        patch: updatePatchSchema,
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            properties: {
                actionType: { const: 'strategy.delete' },
                payload: {
                    type: 'object',
                    required: ['strategyRef'],
                    properties: {
                        strategyRef: strategyRefSchema,
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            properties: {
                actionType: { const: 'feature_environment.setEnabled' },
                payload: {
                    type: 'object',
                    required: ['enabled'],
                    properties: { enabled: { type: 'boolean' } },
                    additionalProperties: false,
                },
            },
        },
        {
            properties: {
                actionType: { const: 'mcp.invoke' },
                payload: {
                    type: 'object',
                    required: ['server', 'tool', 'arguments'],
                    properties: {
                        server: {
                            type: 'string',
                            description:
                                'Name of an MCP server from the provided list.',
                        },
                        tool: {
                            type: 'string',
                            description: 'Tool name exposed by that server.',
                        },
                        arguments: {
                            type: 'object',
                            additionalProperties: true,
                            description:
                                "Arguments matching the tool's inputSchema.",
                        },
                    },
                    additionalProperties: false,
                },
            },
        },
    ],
} as const;

const safeguardSchema = {
    type: 'object',
    required: ['featureName', 'impactMetric', 'triggerCondition'],
    properties: {
        featureName: {
            type: 'string',
            description:
                'A feature from the target list. Must also appear in actions.',
        },
        impactMetric: {
            type: 'object',
            required: [
                'metricName',
                'timeRange',
                'aggregationMode',
                'labelSelectors',
            ],
            properties: {
                metricName: { type: 'string' },
                timeRange: {
                    type: 'string',
                    enum: ['hour', 'day', 'week', 'month'],
                },
                aggregationMode: {
                    type: 'string',
                    enum: ['rps', 'count', 'avg', 'sum', 'p95', 'p99', 'p50'],
                },
                labelSelectors: {
                    type: 'object',
                    additionalProperties: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                source: {
                    type: 'string',
                    enum: ['internal', 'external'],
                },
            },
            additionalProperties: false,
        },
        triggerCondition: {
            type: 'object',
            required: ['operator', 'threshold'],
            properties: {
                operator: { type: 'string', enum: ['>', '<'] },
                threshold: { type: 'number' },
            },
            additionalProperties: false,
        },
    },
    additionalProperties: false,
} as const;

const tool: Anthropic.Tool = {
    name: 'propose_sequence',
    description:
        'Emit the ordered, time-scheduled actions that make up the release rollout, plus optional safeguards.',
    input_schema: {
        type: 'object',
        required: ['rationale'],
        properties: {
            rationale: {
                type: 'string',
                description:
                    'One-paragraph human-readable summary of what the sequence does and why.',
            },
            actions: {
                type: 'array',
                minItems: 0,
                items: actionSchema,
                description:
                    'Omit (or leave empty) when clarificationNeeded is set.',
            },
            safeguards: {
                type: 'array',
                items: safeguardSchema,
                description:
                    'Optional feature-environment safeguards. One per feature that should be auto-disabled on breach.',
            },
            clarificationNeeded: {
                type: 'string',
                description:
                    'Set to a short question when the user asked for a safeguard but the metric choice is genuinely ambiguous. When set, omit actions and safeguards.',
            },
        },
    },
};

type ToolInput = {
    rationale: string;
    actions?: Array<{
        featureName: string;
        fireAt: string;
        actionType: CreateActionInput['actionType'];
        payload: Record<string, unknown>;
        sortOrder: number;
    }>;
    safeguards?: SafeguardRequest[];
    clarificationNeeded?: string;
};

const resolveApiKey = (): string | undefined => process.env.ANTHROPIC_API_KEY;

export const isAnthropicCompilerConfigured = (): boolean => {
    return Boolean(resolveApiKey());
};

type InferredMetricType =
    | 'counter'
    | 'gauge'
    | 'histogram'
    | 'summary'
    | 'unknown';

/**
 * Matches enterprise's prometheus-query-builder::detectMetricType so the agent
 * emits aggregations that the safeguards UI / query builder will actually
 * accept. Anything outside the known prefixes is "unknown" — the agent must
 * ask for clarification rather than guess.
 */
/**
 * Prefer the catalog's real Prometheus `metric_type` label over any
 * name-based guess. Falls back to `inferMetricType` (name heuristics) only
 * when the label is missing or 'unknown' — that path is mostly for the OSS
 * no-op catalog, not for live enterprise installs.
 */
export const resolveMetricType = (
    metric: {
        name: string;
        metricType?: InferredMetricType;
    },
    allNames: ReadonlySet<string>,
): InferredMetricType => {
    if (metric.metricType && metric.metricType !== 'unknown') {
        return metric.metricType;
    }
    return inferMetricType(metric.name, allNames);
};

export const inferMetricType = (
    name: string,
    allNames: ReadonlySet<string>,
): InferredMetricType => {
    if (name.startsWith('unleash_counter_')) return 'counter';
    if (name.startsWith('unleash_gauge_')) return 'gauge';
    if (name.startsWith('unleash_histogram_')) return 'histogram';

    // Prometheus naming conventions (external metrics, libraries that don't
    // use Unleash prefixes).
    if (
        name.endsWith('_bucket') ||
        allNames.has(`${name}_bucket`) ||
        allNames.has(`${name}_sum`)
    ) {
        return 'histogram';
    }
    if (name.endsWith('_count')) return 'counter';

    return 'unknown';
};

export const validAggregationsFor = (
    type: InferredMetricType,
): Array<'rps' | 'count' | 'avg' | 'sum' | 'p95' | 'p99' | 'p50'> => {
    switch (type) {
        case 'counter':
            return ['rps', 'count'];
        case 'gauge':
            return ['avg', 'sum'];
        case 'histogram':
            return ['p50', 'p95', 'p99'];
        case 'summary':
            return ['avg', 'sum', 'count'];
        case 'unknown':
            return [];
    }
};

const buildUserMessage = (input: MockCompileInput): string => {
    const nowIso = (input.now ?? new Date()).toISOString();
    const features = input.features.length > 0 ? input.features : [];
    const metrics = input.availableMetrics ?? [];
    const nameSet = new Set(metrics.map((m) => m.name));
    const metricsBlock =
        metrics.length === 0
            ? 'Available impact metrics: (none configured in this instance)'
            : [
                  'Available impact metrics (only these metricNames may appear in safeguards). For each metric, aggregationMode MUST be chosen from the validAggregations array — any other value will be rejected.',
                  JSON.stringify(
                      metrics.map((m) => {
                          const type = resolveMetricType(m, nameSet);
                          return {
                              metricName: m.name,
                              help: m.help,
                              displayName: m.displayName,
                              source: m.source,
                              metricType: type,
                              validAggregations: validAggregationsFor(type),
                          };
                      }),
                      null,
                      2,
                  ),
              ].join('\n');
    const mcpServers = input.availableMcpServers ?? [];
    const mcpBlock =
        mcpServers.length === 0
            ? 'Available MCP servers: (none configured in this instance — do not emit mcp.invoke actions)'
            : [
                  'Available MCP servers (you may only target these server names and tool names on mcp.invoke actions; "arguments" must match the tool\'s inputSchema):',
                  JSON.stringify(mcpServers, null, 2),
              ].join('\n');
    return [
        `Project: ${input.project}`,
        `Environment: ${input.environment}`,
        `Features: ${features.join(', ') || '(none)'}`,
        `Now: ${nowIso}`,
        '',
        metricsBlock,
        '',
        mcpBlock,
        '',
        'Rollout request:',
        input.prompt,
    ].join('\n');
};

export const anthropicCompile = async (
    input: MockCompileInput,
    options: { logger?: Logger } = {},
): Promise<MockCompileOutput> => {
    const apiKey = resolveApiKey();
    if (!apiKey) {
        throw new BadDataError(
            'ANTHROPIC_API_KEY is not set on the server; cannot compile with the real model.',
        );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
        model: MODEL,
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        tools: [tool],
        tool_choice: { type: 'tool', name: 'propose_sequence' },
        messages: [{ role: 'user', content: buildUserMessage(input) }],
    });

    const toolUse = response.content.find(
        (block): block is Anthropic.ToolUseBlock =>
            block.type === 'tool_use' && block.name === 'propose_sequence',
    );

    if (!toolUse) {
        const textBlocks = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map((b) => b.text);
        options.logger?.warn(
            'Anthropic response did not contain a propose_sequence tool call',
            {
                stop_reason: response.stop_reason,
                usage: response.usage,
                content_types: response.content.map((b) => b.type),
                text_preview: textBlocks.join('\n').slice(0, 500),
            },
        );
        const hint =
            response.stop_reason === 'max_tokens'
                ? 'The model hit its token limit; try a shorter prompt or fewer features.'
                : 'The model did not produce a sequence; try rephrasing the prompt.';
        throw new BadDataError(hint);
    }

    const toolInput = toolUse.input as ToolInput;

    const actions: CreateActionInput[] = (toolInput.actions ?? []).map(
        (action) => {
            const fireAt = new Date(action.fireAt);
            if (Number.isNaN(fireAt.getTime())) {
                throw new BadDataError(
                    `Model returned an invalid fireAt for feature ${action.featureName}: ${action.fireAt}`,
                );
            }
            return {
                featureName: action.featureName,
                fireAt,
                actionType: action.actionType,
                payload: action.payload,
                sortOrder: action.sortOrder,
            } as CreateActionInput;
        },
    );

    return {
        prompt: input.prompt,
        model: MODEL,
        agentVersion: AGENT_VERSION,
        actions,
        safeguards: toolInput.safeguards ?? [],
        rationale: toolInput.rationale,
        clarificationNeeded: toolInput.clarificationNeeded,
    };
};
