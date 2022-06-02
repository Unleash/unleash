import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';

const schema = {
    type: 'object',
    required: ['path', 'op'],
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['add', 'remove', 'replace', 'copy', 'move'],
        },
        from: {
            type: 'string',
        },
        value: {},
    },
} as const;

export type PatchSchema = FromSchema<typeof schema>;

export const patchSchema = schema as DeepMutable<typeof schema>;
