import Anthropic from '@anthropic-ai/sdk';
import type { Logger } from '../../logger.js';
import { BadDataError } from '../../error/index.js';
import type { CreateActionInput } from './release-agent-service.js';
import type { MockCompileInput, MockCompileOutput } from './mock-compiler.js';

const MODEL = 'claude-sonnet-4-6';
const AGENT_VERSION = '0.1.0-anthropic';

const SYSTEM_PROMPT = `You are Unleash's Release Agent. You turn a natural-language rollout request into a concrete, deterministic, time-scheduled sequence of API calls against a single Unleash project and environment.

Rules you MUST follow:
- You always target the project, environment, and feature list the user supplies. Do not invent feature names.
- You produce an ordered list of actions, each with an absolute ISO-8601 UTC fireAt timestamp.
- Compute every fireAt relative to the supplied "now" timestamp.
- You have four action types: strategy.create, strategy.update, strategy.delete, feature_environment.setEnabled.
- strategy.create payload: { strategyName, parameters?, constraints?, variants?, segments?, title?, disabled?, sortOrder? }.
- strategy.update payload: { strategyRef: { type: "owned", sortOrder: N }, patch: { parameters?, constraints?, variants?, segments?, title?, disabled?, sortOrder? } }. You may NOT change strategyName on an update — create a new strategy instead if you need a different type.
- strategy.delete payload: { strategyRef: { type: "owned", sortOrder: N } }.
- The strategyRef's sortOrder must match the sortOrder of an earlier strategy.create in the same sequence.
- feature_environment.setEnabled payload is { enabled: boolean }.
- Ordering rule when a sequence both creates strategies and enables the environment for the same feature: the FIRST strategy.create for that feature MUST have a fireAt strictly earlier than the fireAt of any feature_environment.setEnabled with enabled=true. Enabling an environment that has no strategies auto-creates a 100% default rollout, which would blow past a gradual rollout. A small gap of a few seconds is enough — prefer setting the setEnabled(true) a few seconds after the strategy.create, not a full minute later. The executor ticks every minute, so both actions in the same minute will fire in the correct order within that tick.
- For gradual rollouts, prefer the "flexibleRollout" strategy with numeric percentage string parameters: { rollout: "10", stickiness: "default", groupId: "<feature>" }.
- Keep the sequence small and legible. Typical rollouts have 2–5 actions per feature.
- Never produce overlapping or duplicate strategy.create for the same feature.
- If the user's instruction is ambiguous, pick a reasonable default and explain it briefly in the rationale.
- Output is committed server-side verbatim — the user has no chance to edit. Prefer caution: smaller steps, longer intervals.

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
    ],
} as const;

const tool: Anthropic.Tool = {
    name: 'propose_sequence',
    description:
        'Emit the ordered, time-scheduled actions that make up the release rollout.',
    input_schema: {
        type: 'object',
        required: ['rationale', 'actions'],
        properties: {
            rationale: {
                type: 'string',
                description:
                    'One-paragraph human-readable summary of what the sequence does and why.',
            },
            actions: {
                type: 'array',
                minItems: 1,
                items: actionSchema,
            },
        },
    },
};

type ToolInput = {
    rationale: string;
    actions: Array<{
        featureName: string;
        fireAt: string;
        actionType: CreateActionInput['actionType'];
        payload: Record<string, unknown>;
        sortOrder: number;
    }>;
};

const resolveApiKey = (): string | undefined =>
    HARDCODED_API_KEY || process.env.ANTHROPIC_API_KEY;

export const isAnthropicCompilerConfigured = (): boolean => {
    return Boolean(resolveApiKey());
};

const buildUserMessage = (input: MockCompileInput): string => {
    const nowIso = (input.now ?? new Date()).toISOString();
    const features = input.features.length > 0 ? input.features : [];
    return [
        `Project: ${input.project}`,
        `Environment: ${input.environment}`,
        `Features: ${features.join(', ') || '(none)'}`,
        `Now: ${nowIso}`,
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
        max_tokens: 2048,
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
        options.logger?.warn(
            'Anthropic response did not contain a propose_sequence tool call',
            { stop_reason: response.stop_reason },
        );
        throw new BadDataError(
            'The model did not produce a sequence; try rephrasing the prompt.',
        );
    }

    const toolInput = toolUse.input as ToolInput;

    const actions: CreateActionInput[] = toolInput.actions.map((action) => {
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
    });

    return {
        prompt: input.prompt,
        model: MODEL,
        agentVersion: AGENT_VERSION,
        actions,
        rationale: toolInput.rationale,
    };
};
