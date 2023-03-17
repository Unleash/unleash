import { FromSchema } from 'json-schema-to-ts';

export const projectStatsSchema = {
    $id: '#/components/schemas/projectStatsSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'avgTimeToProdCurrentWindow',
        'createdCurrentWindow',
        'createdPastWindow',
        'archivedCurrentWindow',
        'archivedPastWindow',
        'projectActivityCurrentWindow',
        'projectActivityPastWindow',
        'projectMembersAddedCurrentWindow',
    ],
    description: `Statistics for a project, including the average time to production, number of features created, the project activity and more.

Stats are divided into current and previous **windows**.
- The **current window** is the past 30 days.
- The **previous window** is the 30 days **before** the current window (from 60 to 30 days ago)`,
    properties: {
        avgTimeToProdCurrentWindow: {
            type: 'number',
            example: 10,
            description:
                'The average time from when a feature was created to when it was enabled in the "production" environment during the current window',
        },
        createdCurrentWindow: {
            type: 'number',
            example: 15,
            description:
                'The number of feature toggles created during the current window',
        },
        createdPastWindow: {
            type: 'number',
            example: 15,
            description:
                'The number of feature toggles created during the previous window',
        },
        archivedCurrentWindow: {
            type: 'number',
            example: 5,
            description:
                'The number of feature toggles that were archived during the current window',
        },
        archivedPastWindow: {
            type: 'number',
            example: 5,
            description:
                'The number of feature toggles that were archived during the previous window',
        },
        projectActivityCurrentWindow: {
            type: 'number',
            example: 100,
            description:
                'The number of project events that occurred during the current window',
        },
        projectActivityPastWindow: {
            type: 'number',
            example: 100,
            description:
                'The number of project events that occurred during the previous window',
        },
        projectMembersAddedCurrentWindow: {
            type: 'number',
            example: 1,
            description:
                'The number of members that were added to the project during the current window',
        },
    },
    components: {},
} as const;

export type ProjectStatsSchema = FromSchema<typeof projectStatsSchema>;
