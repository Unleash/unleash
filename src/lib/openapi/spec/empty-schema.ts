import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';

const schema = {
    type: 'object',
    description: 'emptySchema',
} as const;

export type EmptySchema = FromSchema<typeof schema>;

export const emptySchema = schema as DeepMutable<typeof schema>;
