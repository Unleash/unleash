import { FromSchema } from 'json-schema-to-ts';
import { Achievement } from '../../constants/achievements';

export const achievementUnlockSchema = {
    $id: '#/components/schemas/achievementUnlockSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        id: {
            type: 'number',
        },
        achievementId: {
            enum: Object.values(Achievement),
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

export type AchievementUnlockSchema = FromSchema<
    typeof achievementUnlockSchema
>;
