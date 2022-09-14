import { FromSchema } from 'json-schema-to-ts';

export const patchSchema = {
    $id: '#/components/schemas/patchSchema',
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
        value: {
            oneOf: [
                {
                    type: 'object',
                },
                { type: 'array', items: { type: 'object' } },
            ],
        },
    },
    components: {},
} as const;

export type PatchSchema = FromSchema<typeof patchSchema>;
