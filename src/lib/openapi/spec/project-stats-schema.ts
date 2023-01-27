import { FromSchema } from 'json-schema-to-ts';

export const projectStatsSchema = {
    $id: '#/components/schemas/projectStatsSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        avgTimeToProdCurrentWindow: {
            type: 'number',
        },
        avgTimeToProdPastWindow: {
            type: 'number',
        },
        createdCurrentWindow: {
            type: 'number',
        },
        createdPastWindow: {
            type: 'number',
        },
        archivedCurrentWindow: {
            type: 'number',
        },
        archivedPastWindow: {
            type: 'number',
        },
        projectActivityCurrentWindow: {
            type: 'number',
        },
        projectActivityPastWindow: {
            type: 'number',
        },
        projectMembersAddedCurrentWindow: {
            type: 'number',
        },
    },
    components: {},
} as const;

export type ProjectStatsSchema = FromSchema<typeof projectStatsSchema>;
