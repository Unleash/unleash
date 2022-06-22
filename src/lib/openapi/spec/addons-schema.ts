import { FromSchema } from 'json-schema-to-ts';
import { addonSchema } from './addon-schema';
import { addonTypeSchema } from './addon-type-schema';
import { addonParameterSchema } from './addon-parameter-schema';
import { tagTypeSchema } from './tag-type-schema';

export const addonsSchema = {
    $id: '#/components/schemas/addonsSchema',
    type: 'object',
    required: ['addons', 'providers'],
    properties: {
        addons: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/addonSchema',
            },
        },
        providers: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/addonTypeSchema',
            },
        },
    },
    components: {
        schemas: {
            addonSchema,
            addonTypeSchema,
            tagTypeSchema,
            addonParameterSchema,
        },
    },
} as const;

export type AddonsSchema = FromSchema<typeof addonsSchema>;
