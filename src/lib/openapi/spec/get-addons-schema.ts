import { FromSchema } from 'json-schema-to-ts';
import { addonSchema } from './addon-schema';
import { addonDefinitionSchema } from '../../addons/addon-schema';

export const getAddonsSchema = {
    $id: '#/components/schemas/getAddonsSchema',
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
                $ref: '#/components/schemas/addonDefinitionSchema',
            },
        },
    },
    components: {
        schemas: {
            addonSchema,
            addonDefinitionSchema,
        },
    },
} as const;
export type GetAddonsSchema = FromSchema<typeof getAddonsSchema>;
