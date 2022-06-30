import { FromSchema } from 'json-schema-to-ts';
import { uiConfigSchema } from './ui-config-schema';
import { userSchema } from './user-schema';
import { permissionSchema } from './permission-schema';
import { featureTypeSchema } from './feature-type-schema';
import { tagTypeSchema } from './tag-type-schema';
import { contextFieldSchema } from './context-field-schema';
import { strategySchema } from './strategy-schema';
import { projectSchema } from './project-schema';
import { versionSchema } from './version-schema';
import { legalValueSchema } from './legal-value-schema';

export const bootstrapUiSchema = {
    $id: '#/components/schemas/bootstrapUiSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'uiConfig',
        'user',
        'email',
        'context',
        'featureTypes',
        'tagTypes',
        'strategies',
        'projects',
    ],
    properties: {
        uiConfig: {
            $ref: '#/components/schemas/uiConfigSchema',
        },
        user: {
            type: 'object',
            required: [...userSchema.required],
            properties: {
                ...userSchema.properties,
                permissions: {
                    type: 'array',
                    items: {
                        $ref: '#/components/schemas/permissionSchema',
                    },
                },
            },
        },
        email: {
            type: 'boolean',
        },
        context: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/contextFieldSchema',
            },
        },
        featureTypes: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureTypeSchema',
            },
        },
        tagTypes: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
        },
        projects: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectSchema',
            },
        },
    },
    components: {
        schemas: {
            uiConfigSchema,
            userSchema,
            permissionSchema,
            contextFieldSchema,
            featureTypeSchema,
            tagTypeSchema,
            strategySchema,
            projectSchema,
            versionSchema,
            legalValueSchema,
        },
    },
} as const;

export type BootstrapUiSchema = FromSchema<typeof bootstrapUiSchema>;
