import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { schema as strategySchema } from './strategy-schema';

const schema = {
    ...strategySchema,
    required: [],
} as const;

export type UpdateStrategySchema = FromSchema<typeof schema>;

export const updateStrategySchema = schema as DeepMutable<typeof schema>;
