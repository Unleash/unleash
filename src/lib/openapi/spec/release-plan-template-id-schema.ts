import type { FromSchema } from 'json-schema-to-ts';

export const releasePlanTemplateIdSchema = {
    $id: '#/components/schemas/releasePlanTemplateIdSchema',
    additionalProperties: false,
    description:
        'Schema for creating a release plan for a feature flag environment by copying and applying the configuration from a release plan template.',
    type: 'object',
    required: ['templateId'],
    properties: {
        templateId: {
            type: 'string',
            description:
                "The release plan template's ID. Release template IDs are ulids.",
            example: '01JB9GGTGQYEQ9D40R17T3YVW2',
            nullable: false,
        },
    },
    components: {},
} as const;

export type ReleasePlanTemplateIdSchema = FromSchema<
    typeof releasePlanTemplateIdSchema
>;
