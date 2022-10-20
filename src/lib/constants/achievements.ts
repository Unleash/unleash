import { IAchievement } from '../types/models/achievement';

export enum Achievement {
    FIRST_LOGIN = 'FIRST_LOGIN',
    FIRST_TOGGLE = 'FIRST_TOGGLE',
}

export const Achievements: IAchievement[] = [
    {
        id: Achievement.FIRST_LOGIN,
        title: 'Hello Unleash',
        description: 'Sign in for the first time',
        imageUrl: 'https://www.getunleash.io/logos/unleash_glyph_pos.svg',
    },
    {
        id: Achievement.FIRST_TOGGLE,
        title: 'Toggle Creator',
        description: 'Create your first feature toggle',
        imageUrl: 'https://www.getunleash.io/logos/unleash_glyph_pos.svg',
    },
];
