import { applicationSchema } from './application-schema.js';
import type { FromSchema } from 'json-schema-to-ts';
import { applicationUsageSchema } from './application-usage-schema.js';

export const applicationsSchema = {
    $id: '#/components/schemas/applicationsSchema',
    additionalProperties: false,
    description:
        'An object containing a list of applications that have connected to Unleash via an SDK.',
    required: ['total', 'applications'],
    type: 'object',
    properties: {
        total: {
            type: 'integer',
            example: 50,
            description: 'The total number of project applications.',
        },
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
            applicationUsageSchema,
        },
    },
} as const;

export type ApplicationsSchema = FromSchema<typeof applicationsSchema>;
