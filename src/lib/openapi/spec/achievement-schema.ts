import { FromSchema } from 'json-schema-to-ts';
import { Achievement } from '../../constants/achievements';

export const achievementSchema = {
    $id: '#/components/schemas/achievementSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        id: {
            enum: Object.values(Achievement),
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
    },
    components: {
        schemas: {},
    },
} as const;

export type AchievementSchema = FromSchema<typeof achievementSchema>;
