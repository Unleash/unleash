import { applicationSchema } from './application-schema';
import { FromSchema } from 'json-schema-to-ts';

export const applicationsSchema = {
    $id: '#/components/schemas/applicationsSchema',
    additionalProperties: false,
    description:
        'An object containing a list of applications that have connected to Unleash via an SDK.',
    type: 'object',
    properties: {
        applications: {
            description:
                'The list of applications that have connected to this Unleash instance.',
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
