import { FromSchema } from 'json-schema-to-ts';
import { adminSegmentSchema } from './admin-segment-schema';
import { constraintSchema } from './constraint-schema';

export const segmentsSchema = {
    $id: '#/components/schemas/segmentsSchema',
    description:
        'Data containing a list of [segments](https://docs.getunleash.io/reference/segments)',
    type: 'object',
    properties: {
        segments: {
            type: 'array',
            description: 'A list of segments',
            items: {
                $ref: '#/components/schemas/adminSegmentSchema',
            },
        },
    },
    components: {
        schemas: {
            adminSegmentSchema,
            constraintSchema,
        },
    },
} as const;

export type SegmentsSchema = FromSchema<typeof segmentsSchema>;
