import { constraintSchema } from './constraint-schema.js';
import { dynamicConfigurationSchema } from './dynamic-configuration-schema.js';

export const dynamicConfigurationsSchema = {
    $id: '#/components/schemas/dynamicConfigurationsSchema',
    description: 'A list of dynamic configurations in a project.',
    type: 'object',
    additionalProperties: false,
    required: ['configurations'],
    properties: {
        configurations: {
            type: 'array',
            description: 'The dynamic configurations in the project.',
            items: {
                $ref: '#/components/schemas/dynamicConfigurationSchema',
            },
        },
    },
    components: {
        schemas: {
            dynamicConfigurationSchema,
            constraintSchema,
        },
    },
} as const;
