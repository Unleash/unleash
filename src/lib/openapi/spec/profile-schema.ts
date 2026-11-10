import type { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema.js';
import { roleSchema } from './role-schema.js';
import { groupItemSchema } from './group-item-schema.js';

export const profileSchema = {
    $id: '#/components/schemas/profileSchema',
    type: 'object',
    additionalProperties: false,
    description: 'User profile overview',
    required: [
        'rootRole',
        'projects',
        'groups',
        'features',
        'subscriptions',
        'canChangePassword',
    ],
    properties: {
        rootRole: {
            $ref: '#/components/schemas/roleSchema',
        },
        projects: {
            description: 'Which projects this user is a member of',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['my-projectA', 'my-projectB'],
        },
        groups: {
            description: 'Experimental: Which groups this user is a member of',
            type: 'array',
            items: {
                $ref: '#/components/schemas/groupItemSchema',
            },
            example: [],
        },
        subscriptions: {
            description: 'Which email subscriptions this user is subscribed to',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['productivity-report'],
        },
        features: {
            description: 'Deprecated, always returns empty array',
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
            example: [],
        },
        canChangePassword: {
            description:
                'Whether the current user has a local password that can be changed.',
            type: 'boolean',
            example: true,
        },
    },
    components: {
        schemas: {
            groupItemSchema,
            featureSchema,
            roleSchema,
        },
    },
} as const;

export type ProfileSchema = FromSchema<typeof profileSchema>;
