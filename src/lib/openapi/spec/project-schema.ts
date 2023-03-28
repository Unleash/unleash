import { FromSchema } from 'json-schema-to-ts';

export const projectSchema = {
    $id: '#/components/schemas/projectSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name'],
    description:
        'A definition of the project used for projects listing purposes',
    properties: {
        id: {
            type: 'string',
            example: 'dx-squad',
            description: 'The id of this project',
        },
        name: {
            type: 'string',
            example: 'DX-Squad',
            description: 'The name of this project',
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'DX squad feature release',
            description: 'Additional information about the project',
        },
        health: {
            type: 'number',
            example: 50,
            description:
                "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#health-rating) on a scale from 0 to 100",
        },
        featureCount: {
            type: 'number',
            example: 10,
            description: 'The number of features this project has',
        },
        memberCount: {
            type: 'number',
            example: 4,
            description: 'The number of members this project has',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        favorite: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the project was favorited, otherwise `false`.',
        },
        mode: {
            type: 'string',
            enum: ['open', 'protected'],
            example: 'open',
            description:
                "The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode). Determines whether non-project members can submit change requests or not.",
        },
        defaultStickiness: {
            type: 'string',
            example: 'userId',
            description:
                'A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy',
        },
    },
    components: {},
} as const;

export type ProjectSchema = FromSchema<typeof projectSchema>;
