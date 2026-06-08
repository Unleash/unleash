import { constraintSchema } from './constraint-schema.js';

const dynamicConfigurationValueSchema = {
    oneOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
        { type: 'object', additionalProperties: true },
        { type: 'array', items: {} },
    ],
};

const dynamicConfigurationVersionSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['version', 'value'],
    properties: {
        version: { type: 'integer', minimum: 1 },
        value: dynamicConfigurationValueSchema,
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
    },
};

const dynamicConfigurationOverrideSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'priority', 'constraints', 'version'],
    properties: {
        id: { type: 'string' },
        priority: { type: 'integer', minimum: 1 },
        constraints: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
        segments: {
            type: 'array',
            items: { type: 'integer' },
        },
        version: {
            type: 'integer',
            minimum: 1,
            description: 'The immutable configuration version to select.',
        },
    },
};

const dynamicConfigurationEnvironmentSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['defaultVersion', 'overrides'],
    properties: {
        defaultVersion: {
            type: 'integer',
            minimum: 1,
            description:
                'The configuration version selected when no targeted override matches.',
        },
        overrides: {
            type: 'array',
            items: dynamicConfigurationOverrideSchema,
        },
    },
};

export const dynamicConfigurationSchema = {
    $id: '#/components/schemas/dynamicConfigurationSchema',
    description:
        'A dynamic configuration resource in its management representation.',
    type: 'object',
    additionalProperties: false,
    required: [
        'key',
        'project',
        'description',
        'type',
        'versions',
        'environments',
        'createdAt',
        'updatedAt',
    ],
    properties: {
        key: {
            type: 'string',
            description: 'The unique configuration key within the project.',
            example: 'api_timeout_ms',
        },
        project: {
            type: 'string',
            description: 'The project that owns this configuration.',
            example: 'payment-services',
        },
        description: {
            type: 'string',
            description: 'A human-readable explanation of the configuration.',
        },
        type: {
            type: 'string',
            description:
                'The value type enforced for defaults and targeted overrides.',
            enum: ['string', 'number', 'boolean', 'json'],
        },
        validation: {
            type: 'object',
            description:
                'Optional validation rules applied to configuration values.',
            additionalProperties: false,
            properties: {
                minimum: { type: 'number' },
                maximum: { type: 'number' },
                legalValues: {
                    type: 'array',
                    minItems: 1,
                    uniqueItems: true,
                    items: dynamicConfigurationValueSchema,
                },
            },
        },
        versions: {
            type: 'array',
            minItems: 1,
            description:
                'Immutable, append-only configuration values. Selectors refer to these version numbers.',
            items: dynamicConfigurationVersionSchema,
        },
        environments: {
            type: 'object',
            description:
                'Default version selections and ordered targeted selectors keyed by environment name.',
            additionalProperties: dynamicConfigurationEnvironmentSchema,
        },
        createdAt: {
            type: 'string',
            description: 'When the configuration was created.',
            format: 'date-time',
        },
        updatedAt: {
            type: 'string',
            description: 'When the configuration was last updated.',
            format: 'date-time',
        },
    },
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;
