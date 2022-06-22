import { applicationSchema } from './application-schema';
import { FromSchema } from 'json-schema-to-ts';

export const applicationsSchema = {
    $id: '#/components/schemas/applicationsSchema',
    type: 'object',
    properties: {
        applications: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/applicationSchema',
            },
        },
    },
    components: {
        schemas: {
            applicationSchema,
        },
    },
} as const;

export type ApplicationsSchema = FromSchema<typeof applicationsSchema>;
