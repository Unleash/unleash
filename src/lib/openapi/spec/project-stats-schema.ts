import { FromSchema } from 'json-schema-to-ts';

export const projectStatsSchema = {
    $id: '#/components/schemas/projectStatsSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'avgTimeToProdCurrentWindow',
        'avgTimeToProdPastWindow',
        'createdCurrentWindow',
        'createdPastWindow',
        'archivedCurrentWindow',
        'archivedPastWindow',
        'projectActivityCurrentWindow',
        'projectActivityPastWindow',
        'projectMembersAddedCurrentWindow',
    ],
    properties: {
        avgTimeToProdCurrentWindow: {
            type: 'number',
            example: 10,
            description:
                'Average time to production for features in the current window (last 30 days)',
        },
        avgTimeToProdPastWindow: {
            type: 'number',
            example: 10,
            description:
                'Average time to production for features in the past window (previous 30 days before current window)',
        },
        createdCurrentWindow: {
            type: 'number',
            example: 15,
            description:
                'Number of feature toggles created in the current window (last 30 days)',
        },
        createdPastWindow: {
            type: 'number',
            example: 15,
            description:
                'Number of feature toggles created in the past window (previous 30 days before current window)',
        },
        archivedCurrentWindow: {
            type: 'number',
            example: 5,
            description:
                'Number of feature toggles archived in the current window (last 30 days)',
        },
        archivedPastWindow: {
            type: 'number',
            example: 5,
            description:
                'Number of feature toggles archived in the past window (previous 30 days before current window)',
        },
        projectActivityCurrentWindow: {
            type: 'number',
            example: 100,
            description:
                'Number of event from the event log in the current window (last 30 days)',
        },
        projectActivityPastWindow: {
            type: 'number',
            example: 100,
            description:
                'Number of event from the event log in the past window (previous 30 days before current window)',
        },
        projectMembersAddedCurrentWindow: {
            type: 'number',
            example: 1,
            description:
                'Number of members added to the project in the current window (last 30 days)',
        },
    },
    components: {},
} as const;

export type ProjectStatsSchema = FromSchema<typeof projectStatsSchema>;
