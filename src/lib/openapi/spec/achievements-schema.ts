import { FromSchema } from 'json-schema-to-ts';
import { achievementSchema } from './achievement-schema';

export const achievementsSchema = {
    $id: '#/components/schemas/achievementsSchema',
    type: 'object',
    properties: {
        pats: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/achievementSchema',
            },
        },
    },
    components: {
        schemas: {
            achievementSchema,
        },
    },
} as const;

export type AchievementsSchema = FromSchema<typeof achievementsSchema>;
