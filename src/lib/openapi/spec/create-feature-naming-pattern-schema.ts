import { FromSchema } from 'json-schema-to-ts';

export const createFeatureNamingPatternSchema = {
    $id: '#/components/schemas/createFeatureNamingPatternSchema',
    type: 'object',
    description: 'Create a feature naming pattern',
    required: ['pattern'],
    properties: {
        pattern: {
            type: 'string',
            description:
                'A JavaScript regular expression pattern, without the start and end delimiters. Optional flags are not allowed.',
            example: '[a-z]{2,5}.team-[a-z]+.[a-z-]+',
            pattern: '.*',
        },
        example: {
            type: 'string',
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
