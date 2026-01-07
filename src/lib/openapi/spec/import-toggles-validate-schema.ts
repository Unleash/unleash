import type { FromSchema } from 'json-schema-to-ts';
import { importTogglesValidateItemSchema } from './import-toggles-validate-item-schema.js';

export const importTogglesValidateSchema = {
    $id: '#/components/schemas/importTogglesValidateSchema',
    type: 'object',
    required: ['errors', 'warnings'],
    additionalProperties: false,
    description:
        'An object containing [feature import](https://docs.getunleash.io/concepts/import-export) validation results.',
    properties: {
        errors: {
            description:
                'A list of errors that prevent the provided data from being successfully imported.',
            type: 'array',
            example: [
                {
                    message:
                        'You cannot import a feature that already exist in other projects. You already have the following features defined outside of project default:',
                    affectedItems: ['my-feature (in project project-854)'],
                },
            ],
            items: {
                $ref: '#/components/schemas/importTogglesValidateItemSchema',
            },
        },
        warnings: {
            type: 'array',
            description: 'A list of warnings related to the provided data.',
            example: [
                {
                    message:
                        'The following strategy types will be used in import. Please make sure the strategy type parameters are configured as in source environment:',
                    affectedItems: ['custom-strategy-7'],
                },
            ],
            items: {
                $ref: '#/components/schemas/importTogglesValidateItemSchema',
            },
        },
        permissions: {
            type: 'array',
            description:
                'Any additional permissions required to import the data. If the list is empty, you require no additional permissions beyond what your user already has.',
            items: {
                $ref: '#/components/schemas/importTogglesValidateItemSchema',
            },
            example: [],
        },
    },
    components: {
        schemas: {
            importTogglesValidateItemSchema,
        },
    },
} as const;

export type ImportTogglesValidateSchema = FromSchema<
    typeof importTogglesValidateSchema
>;
