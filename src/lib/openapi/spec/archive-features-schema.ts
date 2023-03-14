import { FromSchema } from 'json-schema-to-ts';

export const archiveFeaturesSchema = {
    $id: '#/components/schemas/archiveFeaturesSchema',
    type: 'object',
    required: ['features'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ArchiveFeaturesSchema = FromSchema<typeof archiveFeaturesSchema>;
