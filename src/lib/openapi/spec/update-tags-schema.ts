import { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema';

export const updateTagsSchema = {
    $id: '#/components/schemas/updateTagsSchema',
    type: 'object',
    description:
        "Represents a set of changes to a feature's tags, such as adding or removing tags.",
    additionalProperties: false,
    required: ['addedTags', 'removedTags'],
    properties: {
        addedTags: {
            type: 'array',
            description: 'Tags to add to the feature.',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
        removedTags: {
            type: 'array',
            description: 'Tags to remove from the feature.',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
    },
    example: {
        addedTags: [
            {
                value: 'tag-to-add',
                type: 'simple',
            },
        ],
        removedTags: [
            {
                value: 'tag-to-remove',
                type: 'simple',
            },
        ],
    },
    components: {
        schemas: {
            tagSchema,
        },
    },
} as const;

export type UpdateTagsSchema = FromSchema<typeof updateTagsSchema>;
