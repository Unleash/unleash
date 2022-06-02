import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';

const schema = {
    type: 'object',
    additionalProperties: {
        type: 'string',
    },
} as const;

export type ParametersSchema = FromSchema<typeof schema>;

export const parametersSchema = schema as DeepMutable<typeof schema>;
