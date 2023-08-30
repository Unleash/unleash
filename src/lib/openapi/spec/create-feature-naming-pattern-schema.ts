import { FromSchema } from 'json-schema-to-ts';

export const createFeatureNamingPattern = {
    $id: '#/components/schemas/createFeatureNamingPattern',
    type: 'object',
    description: 'Create a feature naming pattern',
    required: ['pattern'],
    properties: {
        pattern: {
            type: 'string',
            description:
                'A JavaScript regular expression pattern, including the start and end delimiters, and any optional flags.',
            example: '/[a-z]{2,5}.team-[a-z]+.[a-z-]+/i',
            pattern: '^/.*/[gimuy]*$',
        },
        example: {
            type: 'stringe',
            description:
                'An example of a feature name that matches the pattern. Must itself match the pattern supplied.',
            example: 'new-project.team-red.feature-1',
        },
    },
    components: {},
} as const;

export type IdSchema = FromSchema<typeof idSchema>;
