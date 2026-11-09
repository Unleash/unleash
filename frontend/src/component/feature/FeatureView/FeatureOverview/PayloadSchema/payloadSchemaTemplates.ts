export type PayloadSchemaTemplate = {
    key: string;
    label: string;
    schema: Record<string, unknown>;
};

export type PayloadSchemaTemplateGroup = {
    groupHeader: string;
    templates: PayloadSchemaTemplate[];
};

const anthropicModel = {
    type: 'string',
    title: 'Model',
    description:
        'Anthropic model id. Edit the allowed values to the models your team has approved.',
    // Current and still-served models as of 2026-10-06.
    enum: [
        'claude-fable-5-1',
        'claude-opus-5-5',
        'claude-opus-5',
        'claude-sonnet-5-5',
        'claude-sonnet-5',
        'claude-haiku-5-5',
        'claude-opus-4-8',
        'claude-opus-4-7',
        'claude-opus-4-6',
        'claude-sonnet-4-6',
        'claude-haiku-4-5',
    ],
};

const openAiModel = {
    type: 'string',
    title: 'Model',
    description:
        'OpenAI model id. Edit the allowed values to the models your team has approved.',
    // Non-deprecated chat and reasoning models on the OpenAI models page as of 2026-10-08.
    enum: [
        'gpt-6-astra',
        'gpt-6.1-sol',
        'gpt-6-sol',
        'gpt-6-luna',
        'gpt-5.6-sol',
        'gpt-5.6-terra',
        'gpt-5.6-luna',
        'gpt-5.5',
        'gpt-5.5-pro',
        'gpt-5.4',
        'gpt-5.4-mini',
        'gpt-5.4-pro',
    ],
};

const geminiModel = {
    type: 'string',
    title: 'Model',
    description:
        'Gemini model id. Edit the allowed values to the models your team has approved.',
    // Text models on the Gemini API models page as of 2026-10-08. The 2.5 family is served only to existing users.
    enum: [
        'gemini-3.8-flash',
        'gemini-3.7-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.1-pro-preview',
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
    ],
};

const logLevelValues = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

const anthropicConfig: PayloadSchemaTemplate = {
    key: 'anthropic-config',
    label: 'Anthropic config',
    schema: {
        title: 'Anthropic config',
        description:
            'Runtime settings for one Claude Messages API call. Field names follow the Anthropic Messages API.',
        type: 'object',
        additionalProperties: false,
        required: ['model', 'max_tokens'],
        properties: {
            model: anthropicModel,
            max_tokens: {
                type: 'integer',
                title: 'Maximum output tokens',
                minimum: 1,
                maximum: 128000,
            },
            effort: {
                type: 'string',
                title: 'Effort',
                description:
                    'How much reasoning to spend. Default differs per model.',
                enum: ['low', 'medium', 'high', 'xhigh', 'max'],
            },
            thinking: {
                type: 'string',
                title: 'Thinking',
                enum: ['adaptive', 'between_tools'],
            },
            system: {
                type: 'string',
                title: 'System prompt',
                format: 'multiline',
            },
            stop_sequences: {
                type: 'array',
                title: 'Stop sequences',
                items: { type: 'string' },
                maxItems: 4,
            },
        },
        examples: [
            {
                model: 'claude-opus-5-5',
                max_tokens: 4096,
                effort: 'medium',
                system: 'You are a support assistant.',
            },
        ],
    },
};

const openAiConfig: PayloadSchemaTemplate = {
    key: 'openai-config',
    label: 'OpenAI config',
    schema: {
        title: 'OpenAI config',
        description:
            'Runtime settings for one OpenAI chat completion. Field names follow the OpenAI API.',
        type: 'object',
        additionalProperties: false,
        required: ['model'],
        properties: {
            model: openAiModel,
            max_completion_tokens: {
                type: 'integer',
                title: 'Maximum output tokens',
                minimum: 1,
            },
            reasoning_effort: {
                type: 'string',
                title: 'Reasoning effort',
                enum: ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'],
            },
            temperature: {
                type: 'number',
                title: 'Temperature',
                minimum: 0,
                maximum: 2,
            },
            top_p: { type: 'number', title: 'Top p', minimum: 0, maximum: 1 },
            frequency_penalty: {
                type: 'number',
                title: 'Frequency penalty',
                minimum: -2,
                maximum: 2,
            },
            presence_penalty: {
                type: 'number',
                title: 'Presence penalty',
                minimum: -2,
                maximum: 2,
            },
            seed: { type: 'integer', title: 'Seed' },
            system: {
                type: 'string',
                title: 'System prompt',
                format: 'multiline',
            },
            stop: {
                type: 'array',
                title: 'Stop sequences',
                items: { type: 'string' },
                maxItems: 4,
            },
        },
        examples: [
            {
                model: 'gpt-6-astra',
                max_completion_tokens: 4096,
                reasoning_effort: 'medium',
                system: 'You are a support assistant.',
            },
        ],
    },
};

const geminiConfig: PayloadSchemaTemplate = {
    key: 'gemini-config',
    label: 'Google Gemini config',
    schema: {
        title: 'Google Gemini config',
        description:
            'Runtime settings for one Gemini generateContent call. Field names follow the Gemini API GenerationConfig.',
        type: 'object',
        additionalProperties: false,
        required: ['model'],
        properties: {
            model: geminiModel,
            systemInstruction: {
                type: 'string',
                title: 'System instruction',
                format: 'multiline',
            },
            generationConfig: {
                type: 'object',
                title: 'Generation config',
                additionalProperties: false,
                properties: {
                    maxOutputTokens: {
                        type: 'integer',
                        title: 'Maximum output tokens',
                        minimum: 1,
                    },
                    temperature: {
                        type: 'number',
                        title: 'Temperature',
                        minimum: 0,
                        maximum: 2,
                    },
                    topP: {
                        type: 'number',
                        title: 'Top p',
                        minimum: 0,
                        maximum: 1,
                    },
                    topK: { type: 'integer', title: 'Top k', minimum: 1 },
                    thinkingLevel: {
                        type: 'string',
                        title: 'Thinking level',
                        enum: ['low', 'medium', 'high'],
                    },
                    stopSequences: {
                        type: 'array',
                        title: 'Stop sequences',
                        items: { type: 'string' },
                        maxItems: 5,
                    },
                },
            },
        },
        examples: [
            {
                model: 'gemini-3.8-flash',
                generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
            },
        ],
    },
};

const logLevel: PayloadSchemaTemplate = {
    key: 'log-level',
    label: 'Log level',
    schema: {
        title: 'Log level',
        description:
            'Minimum severity to emit. Level names follow syslog and OpenTelemetry severity names.',
        type: 'object',
        additionalProperties: false,
        required: ['level'],
        properties: {
            level: {
                type: 'string',
                title: 'Level',
                enum: logLevelValues,
            },
            loggers: {
                type: 'object',
                title: 'Per-logger overrides',
                description: 'Keyed by logger name.',
                additionalProperties: {
                    type: 'string',
                    enum: logLevelValues,
                },
            },
        },
        examples: [{ level: 'info', loggers: { 'http.client': 'debug' } }],
    },
};

const maintenanceMode: PayloadSchemaTemplate = {
    key: 'maintenance-mode',
    label: 'Maintenance mode',
    schema: {
        title: 'Maintenance mode',
        description:
            'Take a surface offline with a message and an optional end time.',
        type: 'object',
        additionalProperties: false,
        required: ['enabled', 'message'],
        properties: {
            enabled: { type: 'boolean', title: 'Enabled' },
            message: {
                type: 'string',
                title: 'Message',
                format: 'multiline',
                minLength: 1,
            },
            until: {
                type: 'string',
                title: 'Until',
                description: 'When maintenance is expected to end.',
                format: 'date-time',
            },
        },
        examples: [
            {
                enabled: true,
                message: 'We are upgrading the database. Back shortly.',
                until: '2026-10-09T02:00:00Z',
            },
        ],
    },
};

const semverPattern =
    '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$';

const minimumVersion: PayloadSchemaTemplate = {
    key: 'minimum-version',
    label: 'Minimum version',
    schema: {
        title: 'Minimum version',
        description:
            'Lowest client version allowed. The version string follows the semver.org specification.',
        type: 'object',
        additionalProperties: false,
        required: ['minimumVersion'],
        properties: {
            minimumVersion: {
                type: 'string',
                title: 'Minimum version',
                description: 'A semantic version such as 4.2.0.',
                pattern: semverPattern,
            },
            message: {
                type: 'string',
                title: 'Message',
                format: 'multiline',
            },
            updateUrl: {
                type: 'string',
                title: 'Update URL',
                format: 'uri',
            },
        },
        examples: [
            {
                minimumVersion: '4.2.0',
                message: 'Please update to continue.',
                updateUrl: 'https://example.com/download',
            },
        ],
    },
};

const allowList: PayloadSchemaTemplate = {
    key: 'allow-list',
    label: 'Allow list',
    schema: {
        title: 'Allow list',
        description:
            'A set of unique identifiers that are allowed. Set the item format to ipv4, hostname, email, or uuid as needed.',
        type: 'object',
        additionalProperties: false,
        required: ['allowed'],
        properties: {
            allowed: {
                type: 'array',
                title: 'Allowed',
                uniqueItems: true,
                items: { type: 'string', minLength: 1 },
            },
        },
        examples: [{ allowed: ['tenant-a', 'tenant-b'] }],
    },
};

const retryAndTimeoutPolicy: PayloadSchemaTemplate = {
    key: 'retry-and-timeout-policy',
    label: 'Retry and timeout policy',
    schema: {
        title: 'Retry and timeout policy',
        description:
            'Timeout and exponential backoff for an outbound call. Field set follows the gRPC service config retryPolicy.',
        type: 'object',
        additionalProperties: false,
        required: ['timeoutMs', 'maxAttempts'],
        properties: {
            timeoutMs: { type: 'integer', title: 'Timeout (ms)', minimum: 1 },
            maxAttempts: {
                type: 'integer',
                title: 'Maximum attempts',
                minimum: 1,
                maximum: 10,
            },
            initialBackoffMs: {
                type: 'integer',
                title: 'Initial backoff (ms)',
                minimum: 0,
            },
            maxBackoffMs: {
                type: 'integer',
                title: 'Maximum backoff (ms)',
                minimum: 0,
            },
            backoffMultiplier: {
                type: 'number',
                title: 'Backoff multiplier',
                minimum: 1,
            },
            retryableStatusCodes: {
                type: 'array',
                title: 'Retryable status codes',
                uniqueItems: true,
                items: { type: 'integer', minimum: 100, maximum: 599 },
            },
        },
        examples: [
            {
                timeoutMs: 5000,
                maxAttempts: 3,
                initialBackoffMs: 200,
                maxBackoffMs: 2000,
                backoffMultiplier: 2,
                retryableStatusCodes: [429, 502, 503, 504],
            },
        ],
    },
};

const rateLimit: PayloadSchemaTemplate = {
    key: 'rate-limit',
    label: 'Rate limit',
    schema: {
        title: 'Rate limit',
        description:
            'Token-bucket rate limit: allowed requests per window plus burst.',
        type: 'object',
        additionalProperties: false,
        required: ['requests', 'per'],
        properties: {
            requests: { type: 'integer', title: 'Requests', minimum: 1 },
            per: {
                type: 'string',
                title: 'Per',
                enum: ['second', 'minute', 'hour', 'day'],
            },
            burst: { type: 'integer', title: 'Burst', minimum: 1 },
        },
        examples: [{ requests: 100, per: 'minute', burst: 20 }],
    },
};

const circuitBreaker: PayloadSchemaTemplate = {
    key: 'circuit-breaker',
    label: 'Circuit breaker',
    schema: {
        title: 'Circuit breaker',
        description:
            'When to open a circuit and when to probe it again. Field names follow Resilience4j.',
        type: 'object',
        additionalProperties: false,
        required: [
            'failureRateThreshold',
            'slidingWindow',
            'waitDurationInOpenStateMs',
        ],
        properties: {
            failureRateThreshold: {
                type: 'number',
                title: 'Failure rate threshold (%)',
                minimum: 0,
                maximum: 100,
            },
            slowCallDurationMs: {
                type: 'integer',
                title: 'Slow call duration (ms)',
                minimum: 1,
            },
            slowCallRateThreshold: {
                type: 'number',
                title: 'Slow call rate threshold (%)',
                minimum: 0,
                maximum: 100,
            },
            slidingWindow: {
                type: 'object',
                title: 'Sliding window',
                additionalProperties: false,
                required: ['type', 'size'],
                properties: {
                    type: {
                        type: 'string',
                        title: 'Type',
                        description: 'Count is calls, time is seconds.',
                        enum: ['count', 'time'],
                    },
                    size: { type: 'integer', title: 'Size', minimum: 1 },
                },
            },
            minimumNumberOfCalls: {
                type: 'integer',
                title: 'Minimum number of calls',
                minimum: 1,
            },
            waitDurationInOpenStateMs: {
                type: 'integer',
                title: 'Wait in open state (ms)',
                minimum: 1,
            },
            permittedCallsInHalfOpenState: {
                type: 'integer',
                title: 'Permitted calls in half-open state',
                minimum: 1,
            },
        },
        examples: [
            {
                failureRateThreshold: 50,
                slidingWindow: { type: 'count', size: 100 },
                minimumNumberOfCalls: 10,
                waitDurationInOpenStateMs: 30000,
                permittedCallsInHalfOpenState: 5,
            },
        ],
    },
};

export const payloadSchemaTemplateGroups: PayloadSchemaTemplateGroup[] = [
    {
        groupHeader: 'AI',
        templates: [anthropicConfig, openAiConfig, geminiConfig],
    },
    {
        groupHeader: 'Operational',
        templates: [logLevel, maintenanceMode, minimumVersion, allowList],
    },
    {
        groupHeader: 'Resilience',
        templates: [retryAndTimeoutPolicy, rateLimit, circuitBreaker],
    },
];

export const findPayloadSchemaTemplate = (
    key: string,
): PayloadSchemaTemplate | undefined =>
    payloadSchemaTemplateGroups
        .flatMap((group) => group.templates)
        .find((template) => template.key === key);
