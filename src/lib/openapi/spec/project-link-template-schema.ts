import type { FromSchema } from 'json-schema-to-ts';

export const projectLinkTemplateSchema = {
    $id: '#/components/schemas/projectLinkTemplateSchema',
    type: 'object',
    description:
        'A template for a link that can be automatically added to new feature flags.',
    required: ['urlTemplate'],
    properties: {
        title: {
            type: 'string',
            description: 'The title of the link.',
            example: 'Code search',
            nullable: true,
        },
        urlTemplate: {
            type: 'string',
            description:
                'The URL to use as a template. Can contain {{project}} or {{feature}} as placeholders.',
            example:
                'https://github.com/search?type=code&q=repo%3AUnleash%2F{{project}}+{{feature}}',
        },
    },
    additionalProperties: false,
    components: {},
} as const;

export type ProjectLinkTemplateSchema = FromSchema<
    typeof projectLinkTemplateSchema
>;
