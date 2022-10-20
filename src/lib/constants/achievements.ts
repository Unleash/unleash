export enum Achievement {
    FIRST_LOGIN = 'FIRST_LOGIN',
    FIRST_TOGGLE = 'FIRST_TOGGLE',
}

export interface IAchievementDefinition {
    id: Achievement;
    title: string;
    description: string;
    imageUrl: string;
    rarity?: string;
}

export type AchievementDefinitions = Record<
    Achievement,
    IAchievementDefinition
>;

export const Achievements: AchievementDefinitions = {
    [Achievement.FIRST_LOGIN]: {
        id: Achievement.FIRST_LOGIN,
        title: 'Hello Unleash',
        description: 'Sign in for the first time',
        imageUrl: 'https://www.getunleash.io/logos/unleash_glyph_pos.svg',
    },
    [Achievement.FIRST_TOGGLE]: {
        id: Achievement.FIRST_TOGGLE,
        title: 'Toggle Creator',
        description: 'Create your first feature toggle',
        imageUrl: 'https://www.getunleash.io/logos/unleash_glyph_pos.svg',
    },
};
