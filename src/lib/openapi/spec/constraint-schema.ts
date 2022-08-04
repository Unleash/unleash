import { FromSchema } from 'json-schema-to-ts';
import { ALL_OPERATORS } from '../../util/constants';

export const constraintSchemaBase = {
    type: 'object',
    required: ['contextName', 'operator'],
    description:
        'A strategy constraint. For more information, refer to [the strategy constraint reference documentation](https://docs.getunleash.io/advanced/strategy_constraints)',
    properties: {
        contextName: {
            description:
                'The name of the context field that this constraint should apply to.',
            example: 'appName',
            type: 'string',
        },
        operator: {
            description:
                'The operator to use when evaluating this constraint. For more information about the various operators, refer to [the strategy constraint operator documentation](https://docs.getunleash.io/advanced/strategy_constraints#strategy-constraint-operators).',
            type: 'string',
            enum: ALL_OPERATORS,
        },
        caseInsensitive: {
            description:
                'Whether the operator should be case sensitive or not. Defaults to `false` (being case sensitive).',
            type: 'boolean',
            default: false,
        },
        inverted: {
            description:
                'Whether the result should be negated or not. If `true`, will turn a `true` result into a `false` result and vice versa.',
            type: 'boolean',
            default: false,
        },
        values: {
            type: 'array',
            description:
                'The context values that should be used for constraint evaluation. Use this property instead of `value` for properties that accept multiple values.',
            items: {
                type: 'string',
            },
        },
        value: {
            description:
                'The context value that should be used for constraint evaluation. Use this property instead of `values` for properties that only accept single values.',
            type: 'string',
        },
    },
    components: {},
} as const;

export const constraintSchema = {
    $id: '#/components/schemas/constraintSchema',
    additionalProperties: false,
    ...constraintSchemaBase,
} as const;

export type ConstraintSchema = FromSchema<typeof constraintSchema>;
