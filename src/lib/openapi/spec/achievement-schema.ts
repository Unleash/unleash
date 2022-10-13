import { FromSchema } from 'json-schema-to-ts';

export const achievementSchema = {
    $id: '#/components/schemas/achievementSchema',
    type: 'object',
    properties: {
        id: {
            type: 'number',
        },
        title: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        rarity: {
            type: 'string',
        },
        imageUrl: {
            type: 'string',
        },
        unlockedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        seenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type AchievementSchema = FromSchema<typeof achievementSchema>;
