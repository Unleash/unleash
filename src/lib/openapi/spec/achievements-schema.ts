import { FromSchema } from 'json-schema-to-ts';
import { achievementSchema } from './achievement-schema';
import { achievementUnlockSchema } from './achievement-unlock-schema';

export const achievementsSchema = {
    $id: '#/components/schemas/achievementsSchema',
    type: 'object',
    properties: {
        achievements: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/achievementSchema',
            },
        },
        unlocks: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/achievementUnlockSchema',
            },
        },
    },
    components: {
        schemas: {
            achievementSchema,
            achievementUnlockSchema,
        },
    },
} as const;

export type AchievementsSchema = FromSchema<typeof achievementsSchema>;
