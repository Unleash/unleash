import { FromSchema } from 'json-schema-to-ts';

export const createFeatureNamingPatternSchema = {
    $id: '#/components/schemas/createFeatureNamingPatternSchema',
    type: 'object',
    description: 'Create a feature naming pattern',
    required: ['pattern'],
    properties: {
        pattern: {
            type: 'string',
            nullable: true,
            description:
                'A JavaScript regular expression pattern, including the start and end delimiters, and any optional flags.',
            example: '/[a-z]{2,5}.team-[a-z]+.[a-z-]+/i',
            pattern: '^/.*/[gimuy]*$',
        },
        example: {
            type: 'string',
            nullable: true,
            description:
                'An example of a feature name that matches the pattern. Must itself match the pattern supplied.',
            example: 'new-project.team-red.feature-1',
        },
    },
    components: {},
} as const;

export type CreateFeatureNamingPatternSchema = FromSchema<
    typeof createFeatureNamingPatternSchema
>;
