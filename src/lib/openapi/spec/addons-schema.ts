import { FromSchema } from 'json-schema-to-ts';
import { addonSchema } from './addon-schema';
import { addonTypeSchema } from './addon-type-schema';

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
        },
    },
} as const;

export type AddonsSchema = FromSchema<typeof addonsSchema>;
