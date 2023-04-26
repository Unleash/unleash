import { applicationSchema } from './application-schema';
import { FromSchema } from 'json-schema-to-ts';

export const applicationsSchema = {
    $id: '#/components/schemas/applicationsSchema',
    additionalProperties: false,
    type: 'object',
    properties: {
        applications: {
            description:
                'Contains a list of applications that have connected via an SDK',
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
