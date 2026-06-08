import { constraintSchema } from './constraint-schema.js';
import { dynamicConfigurationSchema } from './dynamic-configuration-schema.js';

export const upsertDynamicConfigurationSchema = {
    ...dynamicConfigurationSchema,
    $id: '#/components/schemas/upsertDynamicConfigurationSchema',
    description:
        'Input for creating or replacing a dynamic configuration. Identity and timestamps come from the server.',
    required: ['description', 'type', 'versions', 'environments'],
    properties: {
        description: dynamicConfigurationSchema.properties.description,
        type: dynamicConfigurationSchema.properties.type,
        validation: dynamicConfigurationSchema.properties.validation,
        versions: dynamicConfigurationSchema.properties.versions,
        environments: dynamicConfigurationSchema.properties.environments,
    },
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;
