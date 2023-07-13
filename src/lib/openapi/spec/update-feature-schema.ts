import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';

export const updateFeatureSchema = {
    $id: '#/components/schemas/updateFeatureSchema',
    type: 'object',
    description: 'Data used for updating a feature toggle',
    properties: {
        description: {
            type: 'string',
            example:
                'Controls disabling of the comments section in case of an incident',
            description: 'Detailed description of the feature',
        },
        type: {
            type: 'string',
            example: 'kill-switch',
            description:
                'Type of the toggle e.g. experiment, kill-switch, release, operational, permission',
        },
        stale: {
            type: 'boolean',
            example: true,
            description: '`true` if the feature is archived',
        },
        archived: {
            type: 'boolean',
            example: true,
            description:
                'If `true` the feature toggle will be moved to the [archive](https://docs.getunleash.io/reference/archived-toggles) with a property `archivedAt` set to current time',
        },
        impressionData: {
            type: 'boolean',
            example: false,
            description:
                '`true` if the impression data collection is enabled for the feature',
        },
    },
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;

export type UpdateFeatureSchema = FromSchema<typeof updateFeatureSchema>;
