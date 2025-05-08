import type { FromSchema } from 'json-schema-to-ts';

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
                'A JavaScript regular expression pattern, without the start and end delimiters. Optional flags are not allowed.',
            example: '^[A-Za-z]+\\.[A-Za-z]+\\.[A-Za-z0-9-]+$',
        },
        example: {
            type: 'string',
            nullable: true,
            description:
                'An example of a feature name that matches the pattern. Must itself match the pattern supplied.',
            example: 'dx.feature.1-135',
        },
        description: {
            type: 'string',
            nullable: true,
            description:
                'A description of the pattern in a human-readable format. Will be shown to users when they create a new feature flag.',
            example: `<project>.<featureName>.<ticket>

The flag name should contain the project name, the feature name, and the ticket number, each separated by a dot.`,
        },
    },
    components: {},
} as const;

export type CreateFeatureNamingPatternSchema = FromSchema<
    typeof createFeatureNamingPatternSchema
>;
