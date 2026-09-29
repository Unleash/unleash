import type { FromSchema } from 'json-schema-to-ts';
import { tagTypeSchema } from './tag-type-schema.js';

export const tagTypeWithUsageSchema = {
    $id: '#/components/schemas/tagTypeWithUsageSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A tag type with how widely it is used.',
    required: ['name'],
    properties: {
        ...tagTypeSchema.properties,
        valueCount: {
            type: 'integer',
            minimum: 0,
            example: 12,
            description: 'The number of values of this tag type.',
        },
        usedInProjects: {
            type: 'integer',
            minimum: 0,
            example: 4,
            description:
                'The number of projects with at least one flag, active or archived, tagged with this tag type.',
        },
    },
    components: {},
} as const;

export type TagTypeWithUsageSchema = FromSchema<typeof tagTypeWithUsageSchema>;
