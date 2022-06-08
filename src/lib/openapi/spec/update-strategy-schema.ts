import { FromSchema } from 'json-schema-to-ts';
import { strategySchema } from './strategy-schema';

export const updateStrategySchema = {
    ...strategySchema,
    $id: '#/components/schemas/updateStrategySchema',
    required: [],
    components: {},
} as const;

export type UpdateStrategySchema = FromSchema<typeof updateStrategySchema>;
