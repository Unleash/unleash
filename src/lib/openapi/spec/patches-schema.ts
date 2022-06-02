import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { patchSchema } from './patch-schema';

const schema = {
    type: 'array',
    items: patchSchema,
} as const;

export type PatchesSchema = FromSchema<typeof schema>;

export const patchesSchema = schema as DeepMutable<typeof schema>;
